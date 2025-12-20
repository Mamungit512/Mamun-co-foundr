"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the uploader component with SSR disabled.
// This is required because 'face-api.js' uses browser-specific APIs (like TextEncoder) not available on the server.
const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse text-gray-400">Loading AI Model...</div>
    ),
  },
);

export default function TestPage() {
  // State to hold the verified file
  const [verifiedFile, setVerifiedFile] = useState<File | null>(null);

  const handleSubmitSimulation = () => {
    if (verifiedFile) {
      alert(`Simulation: File "${verifiedFile.name}" is ready to be uploaded.`);
      // In a real application, call your API upload endpoint here.
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-10 text-white">
      <h1 className="mb-8 border-b border-gray-700 pb-4 text-3xl font-bold">
        ML Face Detection Test Page
      </h1>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* LEFT SIDE: ML Component Usage */}
        <div className="h-fit rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-400">
            1. Component Usage
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Please upload a photo containing a clear human face below.
          </p>

          <FaceDetectionUploader
            onValidationSuccess={(file) => {
              console.log("Verified file received:", file);
              setVerifiedFile(file);
            }}
            onValidationFail={(error) => {
              console.warn("Validation error:", error);
              setVerifiedFile(null);
            }}
          />
        </div>

        {/* RIGHT SIDE: Result Simulation */}
        <div
          className={`h-fit rounded-xl border bg-gray-800 p-6 transition-all duration-300 ${verifiedFile ? "border-green-500 shadow-lg shadow-green-900/20" : "border-gray-700 opacity-50"}`}
        >
          <h2 className="mb-4 text-xl font-semibold text-green-400">
            2. Integration Example
          </h2>

          {!verifiedFile ? (
            <div className="flex h-48 flex-col items-center justify-center text-gray-500">
              <svg
                className="mb-3 h-12 w-12 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-center">Waiting for a valid face photo...</p>
              <p className="mt-2 text-xs">
                This section will activate once verification passes.
              </p>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-6">
              <p className="rounded-lg border border-green-800 bg-green-900/30 p-3 text-sm text-green-300">
                ✅ <strong>Success!</strong> A valid file has been received from
                the component.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    File Name
                  </label>
                  <div className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white">
                    {verifiedFile.name}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    File Size
                  </label>
                  <div className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white">
                    {(verifiedFile.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    File Type
                  </label>
                  <div className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white">
                    {verifiedFile.type}
                  </div>
                </div>

                <button
                  onClick={handleSubmitSimulation}
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-green-600 py-3 font-bold text-white transition-colors hover:bg-green-700"
                >
                  SIMULATE SUBMIT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
