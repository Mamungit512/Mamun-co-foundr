"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import {
  useProfileUpsert,
  useUserProfile,
} from "@/features/profile/useProfile";

interface PreferencesPanelProps {
  currentPreferences?: {
    lookingFor?: "technical" | "non-technical" | "either";
    preferredLocation?: "same-city" | "same-country" | "remote";
  };
  onPreferencesChange?: (preferences: {
    lookingFor: "technical" | "non-technical" | "either";
    preferredLocation: "same-city" | "same-country" | "remote";
  }) => void;
}

export default function PreferencesPanel({
  currentPreferences,
  onPreferencesChange,
}: PreferencesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();
  const { data: currentUserProfile } = useUserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lookingFor: currentPreferences?.lookingFor || "either",
      preferredLocation: currentPreferences?.preferredLocation || "remote",
    },
  });

  const onSubmit = async (data: {
    lookingFor: "technical" | "non-technical" | "either";
    preferredLocation: "same-city" | "same-country" | "remote";
  }) => {
    if (!currentUserProfile) {
      console.error("No current user profile found");
      return;
    }

    setIsSaving(true);
    try {
      // Merge preferences with existing profile data to avoid overwriting other fields
      const updatedProfile = {
        ...currentUserProfile,
        lookingFor: data.lookingFor,
        preferredLocation: data.preferredLocation,
      };

      await upsertProfileMutationFn(updatedProfile);
      onPreferencesChange?.(data);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-white bg-(--charcoal-black) p-6 backdrop-blur-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Looking For Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Looking for co-founder who is:
          </label>

          <div className="space-y-3">
            {[
              { value: "technical", label: "Technical" },
              { value: "non-technical", label: "Non-technical" },
              { value: "either", label: "Either" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register("lookingFor", { required: true })}
                  className="h-5 w-5 scale-125 text-blue-600 focus:ring-blue-500"
                />

                <span className="text-base text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>

          {errors.lookingFor && (
            <p className="text-sm text-red-500">Please select a preference</p>
          )}
        </div>

        {/* Location Preference Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Preferred location:
          </label>

          <div className="space-y-3">
            {[
              { value: "same-city", label: "Same city" },
              { value: "same-country", label: "Same country" },
              { value: "remote", label: "Remote work" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center space-x-3"
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register("preferredLocation", { required: true })}
                  className="h-5 w-5 scale-125 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>

          {errors.preferredLocation && (
            <p className="text-sm text-red-500">Please select a preference</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
