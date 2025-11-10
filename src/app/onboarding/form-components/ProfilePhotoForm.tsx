"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth, useSession } from "@clerk/nextjs";

// Dynamically import with SSR disabled (required for face-api.js)
const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="flex animate-pulse items-center gap-2 text-gray-400">
        <svg
          className="h-5 w-5 animate-spin"
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading AI Model...
      </div>
    ),
  },
);

interface ProfilePhotoFormProps {
  onNext: (data: { photoUploaded: boolean; pfp_url?: string }) => void;
  defaultValues?: { photoUploaded?: boolean; pfp_url?: string };
}

function ProfilePhotoForm({ onNext, defaultValues }: ProfilePhotoFormProps) {
  const [validatedPhotoFile, setValidatedPhotoFile] = useState<File | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(
    defaultValues?.photoUploaded || false,
  );

  const { userId } = useAuth();
  const { session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadSuccess) {
      // If already uploaded, just proceed to next step
      onNext({ photoUploaded: true, pfp_url: defaultValues?.pfp_url });
      return;
    }

    if (!validatedPhotoFile) {
      setError("Please upload a valid profile photo with a clear human face");
      return;
    }

    // Upload the validated photo
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      const uploadedUrl = result.url;

      setUploadSuccess(true);
      onNext({ photoUploaded: true, pfp_url: uploadedUrl });
    } catch (err) {
      console.error("Upload error:", err);
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
      <h2 className="heading-6 mb-4">Add Your Profile Photo</h2>
      <p className="mb-6 text-gray-400">
        Upload a clear photo of yourself. Our AI will verify it contains a real
        human face to ensure authentic profiles.
      </p>

      <div className="flex flex-col gap-y-4">
        {!uploadSuccess ? (
          <FaceDetectionUploader
            onValidationSuccess={(file) => {
              console.log("Valid face detected, file ready:", file);
              setValidatedPhotoFile(file);
              setError(null);
            }}
            onValidationFail={(errorMsg) => {
              console.warn("Face validation failed:", errorMsg);
              setValidatedPhotoFile(null);
              setError(errorMsg);
            }}
          />
        ) : (
          <div className="rounded-lg border border-green-500 bg-green-500/10 p-4">
            <p className="flex items-center gap-2 text-green-400">
              <svg
                className="h-5 w-5"
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
              Profile photo uploaded successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          disabled={isUploading || (!validatedPhotoFile && !uploadSuccess)}
          className="cursor-pointer rounded bg-(--mist-white) px-6 py-2 text-(--charcoal-black) transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading
            ? "Uploading..."
            : uploadSuccess
              ? "Continue"
              : "Upload & Continue"}
        </button>
      </div>
    </form>
  );
}

export default ProfilePhotoForm;
