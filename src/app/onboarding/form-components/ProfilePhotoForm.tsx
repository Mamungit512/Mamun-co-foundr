"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth, useSession } from "@clerk/nextjs";
import { useStepEntry } from "@/hooks/useOnboardingAnimation";
import ResumeUploader from "@/components/ResumeUploader";

const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="flex animate-pulse items-center gap-2.5 text-white/40">
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm">Loading AI model…</span>
      </div>
    ),
  },
);

interface ProfilePhotoFormProps {
  onNext: (
    data: { photoUploaded: boolean; pfp_url?: string } & Partial<OnboardingData>,
  ) => void;
  defaultValues?: { photoUploaded?: boolean; pfp_url?: string };
}

function ProfilePhotoForm({ onNext, defaultValues }: ProfilePhotoFormProps) {
  const fieldsRef = useStepEntry();

  const [validatedPhotoFile, setValidatedPhotoFile] = useState<File | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(
    defaultValues?.photoUploaded || false,
  );
  const [parsedResumeData, setParsedResumeData] =
    useState<Partial<OnboardingData>>({});

  const { userId } = useAuth();
  const { session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadSuccess) {
      if (!defaultValues?.pfp_url) {
        setError(
          "Profile photo URL is missing. Please upload your photo again.",
        );
        setUploadSuccess(false);
        return;
      }
      onNext({
        photoUploaded: true,
        pfp_url: defaultValues.pfp_url,
        ...parsedResumeData,
      });
      return;
    }

    if (!validatedPhotoFile) {
      setError("Please upload a valid profile photo with a clear human face");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const token = await session?.getToken();
      if (!userId || !token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", validatedPhotoFile);

      const response = await fetch("/api/upload-profile-pic", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      setUploadSuccess(true);
      onNext({
        photoUploaded: true,
        pfp_url: result.url,
        ...parsedResumeData,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload photo. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div ref={fieldsRef} className="flex flex-col gap-y-8">
        {/* Header */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-white/40 uppercase">
            Step 1 of 6
          </p>
          <h2 className="text-2xl font-bold text-white">
            Add your profile photo
          </h2>
          <p className="mt-1.5 text-sm text-white/50">
            Our AI verifies it contains a real face to keep profiles authentic.
          </p>
        </div>

        {/* Uploader */}
        <div>
          {!uploadSuccess ? (
            <FaceDetectionUploader
              onValidationSuccess={(file) => {
                setValidatedPhotoFile(file);
                setError(null);
              }}
              onValidationFail={(errorMsg) => {
                setValidatedPhotoFile(null);
                setError(errorMsg);
              }}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <svg
                  className="h-4 w-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-400">
                Profile photo uploaded successfully
              </p>
            </div>
          )}
        </div>

        {/* Resume upload — optional, pre-fills Step 2 & 4 */}
        <div className="flex flex-col gap-y-2">
          <p className="text-xs font-semibold tracking-widest text-white/45 uppercase">
            Resume{" "}
            <span className="font-normal normal-case text-white/30">
              (optional)
            </span>
          </p>
          <ResumeUploader onParsed={(data) => setParsedResumeData(data)} />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action */}
        <div className="pt-10 border-t border-white/8">
          <button
            type="submit"
            disabled={isUploading || (!validatedPhotoFile && !uploadSuccess)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {isUploading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading…
              </>
            ) : uploadSuccess ? (
              "Continue →"
            ) : (
              "Upload & Continue →"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ProfilePhotoForm;
