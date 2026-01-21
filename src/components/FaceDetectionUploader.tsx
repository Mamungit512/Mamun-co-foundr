"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import * as faceapi from "@vladmandic/face-api";
import Image from "next/image";

// Props definition
interface FaceDetectionUploaderProps {
  onValidationSuccess: (file: File) => void;
  onValidationFail?: (error: string) => void;
}

export default function FaceDetectionUploader({
  onValidationSuccess,
  onValidationFail,
}: FaceDetectionUploaderProps) {
  const [status, setStatus] = useState<{
    type: "loading" | "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  // 1. Load SSD Mobilenet V1 Model
  // This model is larger but much more accurate than BlazeFace.
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus({
          type: "loading",
          message: "Loading accurate face detection model...",
        });

        // We load the model from a reliable CDN to avoid huge local file requirements.
        // SSD Mobilenet V1 is highly accurate for distinguishing real faces.
        const modelUrl =
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);

        // Optional: Load landmark model if you want even stricter checks (e.g. eyes open) later.
        // await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);

        setIsModelReady(true);
        setStatus({
          type: "idle",
          message: "AI ready. Please select a photo.",
        });
      } catch (error) {
        console.error("Model loading error:", error);
        setStatus({
          type: "error",
          message: "Failed to load AI model. Please refresh.",
        });
      }
    };
    loadModels();
  }, []);

  // 2. Validation Process
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clean up previous preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (!isModelReady) {
      const msg = "AI model is still loading, please wait...";
      setStatus({ type: "error", message: msg });
      onValidationFail?.(msg);
      return;
    }

    if (!file.type.startsWith("image/")) {
      const msg = "Please select a valid image file.";
      setStatus({ type: "error", message: msg });
      onValidationFail?.(msg);
      return;
    }

    setStatus({
      type: "loading",
      message: "Scanning photo with high accuracy...",
    });
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Create an HTML image element for face-api to use
    const img = document.createElement("img");
    img.src = objectUrl;

    // Wait for image to load before detection
    img.onload = async () => {
      try {
        // Perform detection using SSD Mobilenet V1
        // minConfidence: 0.6 is a good baseline. Increase to 0.8+ for very strict checks.
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 }),
        );

        if (detections.length > 0) {
          // Found at least one face with high confidence
          // Optional: Check detections[0].score for the confidence level (e.g., > 0.9 for absolute certainty)
          const bestScore = detections[0].score;
          console.log(`Face detected with score: ${bestScore}`);

          if (bestScore > 0.75) {
            // Extra strict check against good cartoons
            setStatus({ type: "success", message: "✅ Valid face detected!" });
            onValidationSuccess(file);
          } else {
            const msg =
              "⚠️ Cannot clearly verify a real human face. Please try a clearer photo.";
            setStatus({ type: "error", message: msg });
            onValidationFail?.(msg);
          }
        } else {
          // No face found above confidence threshold
          const msg =
            "❌ No human face detected. Please use a real profile photo.";
          setStatus({ type: "error", message: msg });
          onValidationFail?.(msg);
        }
      } catch (error) {
        console.error("Detection error:", error);
        setStatus({
          type: "error",
          message: "Something went wrong during scan.",
        });
        onValidationFail?.("Scan error.");
      }
    };

    img.onerror = () => {
      setStatus({ type: "error", message: "Failed to process image file." });
    };
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        Upload Profile Photo (High Accuracy Check)
      </label>
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        disabled={status.type === "loading" && !isModelReady}
        className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
      />

      <div className="mt-4 space-y-3">
        {status.type === "loading" && (
          <div className="flex items-center text-blue-500">
            <svg
              className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
            <span className="ml-2 text-sm">{status.message}</span>
          </div>
        )}

        {status.type !== "idle" && status.type !== "loading" && (
          <p
            className={`text-sm font-medium ${status.type === "success" ? "text-green-500" : "text-red-500"}`}
          >
            {status.message}
          </p>
        )}

        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Preview"
            width={128}
            height={128}
            className="h-32 w-32 rounded-full border-2 border-gray-300 object-cover"
          />
        )}
      </div>
    </div>
  );
}
