"use client";

import { useEffect, useId, useState } from "react";
import { useSession } from "@clerk/nextjs";
import {
  loadFaceModel,
  prepareFacePhoto,
  uploadProfilePhoto,
} from "@/features/school/onboarding/quick/profilePhoto";
import { Avatar, BTN_GHOST_SMALL_CLS, ERROR_CLS } from "@/features/school/onboarding/quick/ui";

const ACCEPT = "image/png, image/jpeg, image/webp, image/heic, image/heif, .heic, .heif";

type Status = "idle" | "checking" | "uploading";

export default function PhotoRow({
  name,
  pfpUrl,
  onUploaded,
}: {
  name: string;
  pfpUrl?: string;
  onUploaded: (url: string) => void;
}) {
  const { session } = useSession();
  const inputId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Warm the face model so the check is quick once a photo is picked.
  useEffect(() => {
    if (!pfpUrl) loadFaceModel().catch(() => {});
  }, [pfpUrl]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setStatus("checking");
      const checked = await prepareFacePhoto(file);
      setStatus("uploading");
      const token = await session?.getToken();
      if (!token) throw new Error("Session expired. Please refresh and try again.");
      onUploaded(await uploadProfilePhoto(checked, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const busy = status !== "idle";

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex flex-wrap items-center gap-3.5 rounded-xl border border-dashed px-3.5 py-3 sm:flex-nowrap ${
          error ? "border-red-300 bg-red-50" : "border-[var(--ui-border-strong)]"
        }`}
      >
        <Avatar name={name} src={pfpUrl} size={56} />
        <div className="min-w-[180px] flex-1 text-[13px] leading-snug text-[var(--ui-text-muted)]">
          <b className="block text-sm text-[var(--ui-text)]">
            {pfpUrl ? "Your photo" : "Add a photo"}{" "}
            <small className="text-[13px] font-normal text-[var(--ui-text-muted)]">· required</small>
          </b>
          {status === "checking"
            ? "Checking your photo…"
            : status === "uploading"
              ? "Uploading…"
              : "A clear photo of your face makes your card feel real to other founders."}
        </div>
        <label
          htmlFor={inputId}
          aria-disabled={busy}
          className={`${BTN_GHOST_SMALL_CLS} has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[color:var(--org-primary)] ${busy ? "pointer-events-none opacity-50" : ""}`}
        >
          {pfpUrl ? "Change" : "Upload"}
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            disabled={busy}
            className="sr-only"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className={ERROR_CLS}>
          {error}
        </p>
      )}
    </div>
  );
}
