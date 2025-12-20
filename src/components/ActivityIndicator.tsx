import React from "react";
import { getActivityIndicator } from "@/lib/activityUtils";

interface ActivityIndicatorProps {
  lastActiveAt: string | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Activity Indicator Component
 * Displays a colored dot and optional label showing user's activity status
 */
export default function ActivityIndicator({
  lastActiveAt,
  showLabel = true,
  size = "md",
  className = "",
}: ActivityIndicatorProps) {
  const { label, dotColor } = getActivityIndicator(lastActiveAt);

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`inline-block ${sizeClasses[size]} ${dotColor} rounded-full`}
        aria-label={`Activity status: ${label}`}
      />
      {showLabel && (
        <span className={`${textSizeClasses[size]} text-gray-400`}>
          {label}
        </span>
      )}
    </div>
  );
}
