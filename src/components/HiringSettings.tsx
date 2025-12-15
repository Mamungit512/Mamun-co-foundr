"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface HiringSettingsProps {
  isHiring: boolean;
  hiringEmail?: string;
  onUpdate: (data: { isHiring: boolean; hiringEmail?: string }) => void;
}

interface HiringFormData {
  isHiring: boolean;
  hiringEmail: string;
}

export default function HiringSettings({
  isHiring,
  hiringEmail,
  onUpdate,
}: HiringSettingsProps) {
  const { has } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HiringFormData>({
    defaultValues: {
      isHiring,
      hiringEmail: hiringEmail || "",
    },
  });

  const watchedIsHiring = watch("isHiring");

  // Check if user has access to hiring badge feature
  const canAccessHiringBadge = has?.({ feature: "hiring_badge" });

  const onSubmit = async (data: HiringFormData) => {
    try {
      await onUpdate(data);
      toast.success("Hiring settings updated successfully!");
    } catch {
      toast.error("Failed to update hiring settings. Please try again.");
    }
  };

  const handleUpgrade = () => {
    router.push("/billing/upgrade");
  };

  if (!canAccessHiringBadge) {
    return (
      <div className="py-6 text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
            <span className="text-xl">💼</span>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">
          Upgrade to Collab Tier
        </h3>
        <p className="mb-4 text-sm text-gray-300">
          Get access to the &quot;We&apos;re Hiring&quot; badge to attract top
          talent to your startup.
        </p>
        <button
          onClick={handleUpgrade}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hiring Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-300">
            I&apos;m Hiring
          </label>
          <p className="text-xs text-gray-400">
            Show a &quot;We&apos;re Hiring&quot; badge on your profile
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            {...register("isHiring")}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-600 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
      </div>

      {/* Hiring Email */}
      {watchedIsHiring && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Hiring Email Address *
          </label>
          <input
            type="email"
            placeholder="hiring@yourcompany.com"
            {...register("hiringEmail", {
              required: watchedIsHiring
                ? "Hiring email is required when hiring is enabled"
                : false,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.hiringEmail && (
            <p className="text-sm text-red-500">{errors.hiringEmail.message}</p>
          )}
          <p className="text-xs text-gray-400">
            This email will be used when people click your &quot;Hiring&quot;
            badge
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
