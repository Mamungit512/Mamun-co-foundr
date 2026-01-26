export async function createSkipProfileAction(
  userId: string,
  skippedProfileId: string,
  token: string,
) {
  // Call the API route instead of directly accessing Supabase
  // This allows us to use the service role key server-side to bypass RLS
  const response = await fetch("/api/skip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ skippedProfileId }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error from skip API:", error);
    throw new Error(error.error || "Failed to skip profile");
  }

  const result = await response.json();
  console.log("Skip action created successfully:", result);

  return result;
}
