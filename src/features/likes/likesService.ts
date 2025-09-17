import { createSupabaseClientWithToken } from "../../lib/supabaseClient";

// Like a profile
export async function likeProfile({
  likerId,
  likedId,
  token,
}: {
  likerId: string;
  likedId: string;
  token: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!likerId || !likedId) {
    return { success: false, error: "Missing liker or liked user ID" };
  }

  if (likerId === likedId) {
    return { success: false, error: "Cannot like your own profile" };
  }

  const supabase = createSupabaseClientWithToken(token);

  // Check if like already exists
  const { data: existingLike, error: checkError } = await supabase
    .from("likes")
    .select("id")
    .eq("liker_id", likerId)
    .eq("liked_id", likedId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" error, which is expected if no like exists
    console.error("Error checking existing like:", checkError);
    return { success: false, error: "Failed to check like status" };
  }

  if (existingLike) {
    return { success: false, error: "Profile already liked" };
  }

  // Insert the like
  const { error: insertError } = await supabase.from("likes").insert({
    liker_id: likerId,
    liked_id: likedId,
  });

  if (insertError) {
    console.error("Error inserting like:", insertError);
    return { success: false, error: "Failed to like profile" };
  }

  return { success: true };
}

// Unlike a profile
export async function unlikeProfile({
  likerId,
  likedId,
  token,
}: {
  likerId: string;
  likedId: string;
  token: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!likerId || !likedId) {
    return { success: false, error: "Missing liker or liked user ID" };
  }

  const supabase = createSupabaseClientWithToken(token);

  const { error: deleteError } = await supabase
    .from("likes")
    .delete()
    .eq("liker_id", likerId)
    .eq("liked_id", likedId);

  if (deleteError) {
    console.error("Error deleting like:", deleteError);
    return { success: false, error: "Failed to unlike profile" };
  }

  return { success: true };
}

// Check if a profile is liked by the current user
export async function checkLikeStatus({
  likerId,
  likedId,
  token,
}: {
  likerId: string;
  likedId: string;
  token: string;
}): Promise<{ isLiked: boolean; error?: string }> {
  if (!likerId || !likedId) {
    return { isLiked: false, error: "Missing liker or liked user ID" };
  }

  const supabase = createSupabaseClientWithToken(token);

  const { data: like, error } = await supabase
    .from("likes")
    .select("id")
    .eq("liker_id", likerId)
    .eq("liked_id", likedId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error, which is expected if no like exists
    console.error("Error checking like status:", error);
    return { isLiked: false, error: "Failed to check like status" };
  }

  return { isLiked: !!like };
}

// Get all profiles liked by the current user
export async function getLikedProfiles({
  likerId,
  token,
}: {
  likerId: string;
  token: string;
}): Promise<{ profiles: string[]; error?: string }> {
  if (!likerId) {
    return { profiles: [], error: "Missing liker user ID" };
  }

  const supabase = createSupabaseClientWithToken(token);

  const { data: likes, error } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", likerId);

  if (error) {
    console.error("Error fetching liked profiles:", error);
    return { profiles: [], error: "Failed to fetch liked profiles" };
  }

  const likedIds = likes?.map((like) => like.liked_id) || [];
  return { profiles: likedIds };
}

// Get all profiles that liked the current user
export async function getLikers({
  likedId,
  token,
}: {
  likedId: string;
  token: string;
}): Promise<{ profiles: string[]; error?: string }> {
  if (!likedId) {
    return { profiles: [], error: "Missing liked user ID" };
  }

  const supabase = createSupabaseClientWithToken(token);

  const { data: likes, error } = await supabase
    .from("likes")
    .select("liker_id")
    .eq("liked_id", likedId);

  if (error) {
    console.error("Error fetching likers:", error);
    return { profiles: [], error: "Failed to fetch likers" };
  }

  const likerIds = likes?.map((like) => like.liker_id) || [];
  return { profiles: likerIds };
}

// Check for mutual likes (matches)
export async function getMutualLikes({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<{ matches: string[]; error?: string }> {
  if (!userId) {
    return { matches: [], error: "Missing user ID" };
  }

  const supabase = createSupabaseClientWithToken(token);

  // Get profiles that the user liked
  const { data: userLikes, error: userLikesError } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", userId);

  if (userLikesError) {
    console.error("Error fetching user likes:", userLikesError);
    return { matches: [], error: "Failed to fetch user likes" };
  }

  if (!userLikes || userLikes.length === 0) {
    return { matches: [] };
  }

  const likedIds = userLikes.map((like) => like.liked_id);

  // Get profiles that liked the user back
  const { data: mutualLikes, error: mutualLikesError } = await supabase
    .from("likes")
    .select("liker_id")
    .eq("liked_id", userId)
    .in("liker_id", likedIds);

  if (mutualLikesError) {
    console.error("Error fetching mutual likes:", mutualLikesError);
    return { matches: [], error: "Failed to fetch mutual likes" };
  }

  const matchIds = mutualLikes?.map((like) => like.liker_id) || [];
  return { matches: matchIds };
}
