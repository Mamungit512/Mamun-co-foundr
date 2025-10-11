"use client";

import React, { useState } from "react";
import EnhancedEmailComponent from "./EnhancedEmailComponent";

interface HiringBadgeProps {
  hiringEmail?: string;
  companyName?: string;
  className?: string;
}

export default function HiringBadge({
  hiringEmail,
  companyName,
  className = "",
}: HiringBadgeProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleBadgeClick = () => {
    if (!hiringEmail) return;
    setShowEmailModal(true);
  };

  const handleCloseModal = () => {
    setShowEmailModal(false);
  };

  return (
    <>
      <button
        onClick={handleBadgeClick}
        className={`inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400 transition-all duration-200 hover:border-green-500/50 hover:bg-green-500/30 ${className}`}
        title="Click to send an email inquiry"
      >
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span>Hiring</span>
      </button>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Send Email Inquiry
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <EnhancedEmailComponent
              hiringEmail={hiringEmail!}
              companyName={companyName}
            />
          </div>
        </div>
      )}
    </>
  );
}
