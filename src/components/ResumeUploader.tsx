"use client";

import React, { useRef, useState } from "react";

interface ResumeUploaderProps {
  onParsed: (data: Partial<OnboardingData>) => void;
}

type UploadState = "idle" | "parsing" | "done" | "error";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXT = ".pdf,.doc,.docx";

export default function ResumeUploader({ onParsed }: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg("Please upload a PDF, DOC, or DOCX file.");
      setState("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File too large. Maximum size is 5MB.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("parsing");
    setErrorMsg("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Parsing failed");
      }

      setState("done");
      onParsed(json.data as Partial<OnboardingData>);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not parse resume.";
      setErrorMsg(message);
      setState("error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected after an error
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const reset = () => {
    setState("idle");
    setErrorMsg("");
    setFileName("");
  };

  if (state === "done") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4">
        <div className="flex items-center gap-3">
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
          <div>
            <p className="text-sm font-medium text-emerald-400">Resume parsed</p>
            <p className="text-xs text-emerald-400/60">
              Fields pre-filled — review and edit on the next step
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          Remove
        </button>
      </div>
    );
  }

  if (state === "parsing") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <svg
          className="h-4 w-4 shrink-0 animate-spin text-white/50"
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
        <div>
          <p className="text-sm text-white/70">Parsing resume…</p>
          {fileName && <p className="text-xs text-white/30">{fileName}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/3 px-6 py-5 text-center transition-all duration-200 hover:border-white/25 hover:bg-white/5"
      >
        <svg
          className="h-5 w-5 text-white/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div>
          <p className="text-sm text-white/50">
            <span className="text-white/70 underline underline-offset-2">
              Upload resume
            </span>{" "}
            to auto-fill your profile
          </p>
          <p className="mt-0.5 text-xs text-white/25">
            PDF, DOC, DOCX · max 5MB · optional
          </p>
        </div>
      </div>

      {state === "error" && errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        className="sr-only"
        onChange={handleInputChange}
      />
    </div>
  );
}
