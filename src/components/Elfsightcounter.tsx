"use client";

import React from "react";

interface CounterProps {
  count?: string;
  label?: string;
}

export default function CoFounderCounter({
  count = "6+",
  label = "Co-Founder Matches Made",
}: CounterProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-transparent py-12">
      <h2 className="mb-2 text-5xl font-bold text-[#FACC15] md:text-6xl">
        {count}
      </h2>

      <p className="text-lg font-medium text-white opacity-90 md:text-xl">
        {label}
      </p>
    </div>
  );
}
