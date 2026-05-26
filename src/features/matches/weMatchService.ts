export type WeMatchResponse = {
  success: boolean;
  mutual?: boolean;
  alreadyNotified?: boolean;
  error?: string;
};

export async function weMatch({
  toUserId,
  token,
}: {
  toUserId: string;
  token: string;
}): Promise<WeMatchResponse> {
  if (!toUserId) {
    return { success: false, error: "Missing toUserId" };
  }

  const res = await fetch("/api/we-match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ toUserId }),
  });

  const body = (await res.json().catch(() => ({}))) as WeMatchResponse;

  if (!res.ok) {
    return { success: false, error: body.error ?? "Failed to we-match" };
  }
  return body;
}

export type WeMatchStatus = {
  sent: string[];
  mutualNotified: string[];
};

export async function getWeMatchStatus({
  token,
}: {
  token: string;
}): Promise<WeMatchStatus> {
  const res = await fetch("/api/we-match", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return { sent: [], mutualNotified: [] };
  }

  return (await res.json()) as WeMatchStatus;
}
