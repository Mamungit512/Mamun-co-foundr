"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface EnhancedEmailComponentProps {
  hiringEmail: string;
  companyName?: string;
  className?: string;
}

export default function EnhancedEmailComponent({
  hiringEmail,
  companyName,
  className = "",
}: EnhancedEmailComponentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    fileName: string;
    publicUrl: string;
  } | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFile({
          fileName: file.name,
          publicUrl: result.publicUrl,
        });
        toast.success("File uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmailClick = () => {
    const subject = `Inquiry about ${companyName || "opportunity"} via Mamun`;

    let body = "";
    if (uploadedFile) {
      body = `\n\nAttached resume: ${uploadedFile.fileName}\nDownload link: ${uploadedFile.publicUrl}`;
    }

    const mailtoLink = `mailto:${hiringEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Attach Resume (Optional)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full cursor-pointer text-sm text-gray-300 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />
          {isUploading && (
            <div className="text-sm text-gray-400">Uploading...</div>
          )}
        </div>
        {uploadedFile && (
          <div className="text-sm text-green-400">
            ✓ {uploadedFile.fileName} uploaded successfully
          </div>
        )}
        <p className="text-xs text-gray-400">
          Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
        </p>
      </div>

      {/* Email Button */}
      <button
        onClick={handleEmailClick}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-4 py-3 text-sm font-medium text-green-400 transition-all duration-200 hover:border-green-500/50 hover:bg-green-500/30"
      >
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span>Send Email Inquiry</span>
      </button>
    </div>
  );
}
