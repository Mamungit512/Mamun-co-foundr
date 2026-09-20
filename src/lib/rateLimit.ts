import { createClient } from "@supabase/supabase-js";

/**
 * Postgres-backed fixed-window rate limiter (see
 * supabase/migrations/20260920000001_add_rate_limits.sql). Works across
 * Vercel's multiple serverless instances, unlike an in-memory counter.
 *
 * Fails OPEN: if the rate_limits table/function is unreachable, the request
 * is allowed rather than the whole route going down because of a limiter
 * outage. Log and move on.
 */

let client: ReturnType<typeof createClient> | null = null;
function serviceRoleClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return client;
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

/**
 * @param key - Unique identifier for what's being limited, e.g. `send:${userId}`
 *   or `send:ip:${ip}` for an unauthenticated route. Callers should prefix
 *   with the route name so different routes never share a bucket.
 * @param limit - Max requests allowed per window.
 * @param windowSeconds - Window size in seconds.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs).toISOString();
  const resetAt = new Date(windowStartMs + windowMs);

  try {
    const { data: count, error } = await serviceRoleClient().rpc(
      "increment_rate_limit",
      { p_key: key, p_window_start: windowStart },
    );

    if (error) {
      console.error("[rateLimit] increment_rate_limit failed:", error);
      return { allowed: true, limit, remaining: limit, resetAt };
    }

    const used = typeof count === "number" ? count : 0;
    return {
      allowed: used <= limit,
      limit,
      remaining: Math.max(0, limit - used),
      resetAt,
    };
  } catch (err) {
    console.error("[rateLimit] unexpected error, failing open:", err);
    return { allowed: true, limit, remaining: limit, resetAt };
  }
}

/** Builds a standard 429 response with a Retry-After header. */
export function rateLimitResponse(result: RateLimitResult) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
  );
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    },
  );
}
