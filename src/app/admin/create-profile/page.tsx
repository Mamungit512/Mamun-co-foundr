"use client";

import CreateProfile from "@/components/forms/CreateProfile";

import { isUserAdmin } from "@/features/auth/authService";
import { createUserProfile } from "@/features/profile/profileService";
import { useSession, useUser } from "@clerk/nextjs";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminAddProfilePage() {
  // --- Check Admin Status ---
  const { user } = useUser();
  const { session } = useSession();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const token = await session?.getToken();
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const admin = await isUserAdmin(user.id, token);
      setIsAdmin(admin?.is_admin ? true : false);
    }
    checkAdmin();
  }, [user, session]);

  const userId = user?.id;
  if (!userId) {
    return <div>Unauthorized. Please Sign In</div>;
  }

  const handleSubmit = async (formData: OnboardingData) => {
    try {
      const token = await session?.getToken();

      if (!token) {
        return { success: false, error: "No Logged In User or Missing Token" };
      }

      // --- Must add user_id to formData if creating test profiles. Real users will have user_id set to their Clerk id ---

      const min = 1; // Minimum value for the ID
      const max = 100000; // Maximum value for the ID
      const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
      const formDataWithUserId = { ...formData, user_id: randomId.toString() };

      // -- Upsert OnboardingData into DB --
      const { success, error } = await createUserProfile({
        userId,
        token,
        formData: formDataWithUserId,
      });

      if (!success) {
        setError(error || "Unknown error");
        return {
          success: false,
          error: "Error upserting into profiles table",
        };
      }
    } catch (err) {
      console.error(err);
      toast.error("There was an issue creating new profile");
      setError("Something went wrong. " + err);
    }

    window.location.reload();
    toast.success("New profile created");
    return { success: true };
  };

  if (isAdmin === null) return <p>Loading...</p>;

  if (!isAdmin) return <p>Access denied. Admins only.</p>;

  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <h1 className="heading-5">Create Profile Page [Admin Only]</h1>
      {error && <p className="text-red-500">{error}</p>}
      <CreateProfile onSubmit={handleSubmit} />
    </section>
  );
}
