import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MAX_CHARS = 2000;

// Build profile text by concatenating relevant fields in high-signal-first order
async function buildProfileText(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "title, personal_intro, startup_name, startup_description, accomplishments, interests, hobbies, city"
    )
    .eq("user_id", userId)
    .single();

  const { data: schoolProfile } = await supabase
    .from("school_profiles")
    .select("major, college, degree_type, sector_interests")
    .eq("user_id", userId)
    .single();

  const parts: string[] = [];

  if (profile) {
    if (profile.title) parts.push(profile.title);
    if (profile.personal_intro) parts.push(profile.personal_intro);
    if (profile.startup_name) parts.push(profile.startup_name);
    if (profile.startup_description) parts.push(profile.startup_description);
  }

  if (schoolProfile) {
    if (schoolProfile.major) parts.push(schoolProfile.major);
    if (schoolProfile.college) parts.push(schoolProfile.college);
    if (schoolProfile.degree_type) parts.push(schoolProfile.degree_type);
    if (
      schoolProfile.sector_interests &&
      Array.isArray(schoolProfile.sector_interests)
    ) {
      parts.push(schoolProfile.sector_interests.join(" "));
    }
  }

  if (profile) {
    if (profile.interests) parts.push(profile.interests);
    if (profile.hobbies) parts.push(profile.hobbies);
    if (profile.accomplishments) parts.push(profile.accomplishments);
    if (profile.city) parts.push(profile.city);
  }

  return parts.filter(Boolean).join(" ");
}

// Embed text using gte-small model and return as vector
async function embedText(text: string): Promise<number[]> {
  const truncated = text.slice(0, MAX_CHARS);

  // Use Supabase's built-in embedding via AI session
  const session = new Supabase.ai.Session("gte-small");
  const embedding = await session.run(truncated, {
    mean_pool: true,
    normalize: true,
  });

  return embedding;
}

// Drain mode: process queue messages and re-embed profiles
async function drainQueue() {
  try {
    // Read up to 20 messages from the queue
    const { data: messages, error: readError } = await supabase
      .rpc("pgmq_read", {
        queue_name: "embedding_refresh",
        limit: 20,
        vt: 30,
      })
      .returns<Array<{ msg_id: string; message: { user_id: string } }>>();

    if (readError) {
      console.error("Error reading from queue:", readError);
      return { drained: 0, error: readError.message };
    }

    if (!messages || messages.length === 0) {
      return { drained: 0 };
    }

    let successCount = 0;

    for (const msg of messages) {
      try {
        const userId = msg.message.user_id;
        const profileText = await buildProfileText(userId);
        const embedding = await embedText(profileText);

        // Update the profiles table with the new embedding
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ embedding })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            `Error updating embedding for user ${userId}:`,
            updateError
          );
        } else {
          successCount++;

          // Delete the message from the queue
          const { error: deleteError } = await supabase.rpc("pgmq_delete", {
            queue_name: "embedding_refresh",
            msg_id: msg.msg_id,
          });

          if (deleteError) {
            console.error(
              `Error deleting message ${msg.msg_id}:`,
              deleteError
            );
          }
        }
      } catch (error) {
        console.error("Error processing queue message:", error);
      }
    }

    return { drained: successCount, total: messages.length };
  } catch (error) {
    console.error("Error draining queue:", error);
    return { drained: 0, error: (error as Error).message };
  }
}

// Query mode: embed a search string and return the vector
async function queryEmbed(text: string) {
  try {
    const embedding = await embedText(text);
    return { embedding, success: true };
  } catch (error) {
    console.error("Error embedding query:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Main handler
Deno.serve(async (req) => {
  try {
    const { mode, text } = await req.json();

    if (mode === "query") {
      const result = await queryEmbed(text || "");
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (mode === "drain") {
      const result = await drainQueue();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown mode. Use 'query' or 'drain'." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in embed function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
