"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "introSurveyShown";

export default function IntroSurveyModal() {
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const hasChecked = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (!localStorage.getItem(STORAGE_KEY)) {
      setIsOpen(true);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (!modalRef.current) return;

      const buttons = modalRef.current.querySelectorAll(
        "button, [role='button']",
      );
      buttons.forEach((btn) => {
        const text = btn.textContent?.trim().toLowerCase() ?? "";
        if (text === "ok" || text === "okay") {
          btn.addEventListener(
            "click",
            () => {
              clearInterval(interval);
              localStorage.setItem(STORAGE_KEY, "true");
              setIsOpen(false);
            },
            { once: true },
          );
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const preventScroll = (e: React.WheelEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      onClick={handleClose}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        ref={modalRef}
        className="relative w-full bg-white"
        style={{
          maxWidth: "560px",
          borderRadius: "12px",
          padding: "32px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={preventScroll}
        onTouchMove={preventScroll}
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Quick question 👋</h2>
          <p className="mt-1 text-sm text-gray-500">
            It will only take a minute to help us get to know you better.
          </p>
        </div>

        <div
          className="elfsight-app-edec83c9-b40f-4a40-ba96-a7f242f8670d"
          data-elfsight-app-lazy
        />
      </div>
    </div>
  );
}
