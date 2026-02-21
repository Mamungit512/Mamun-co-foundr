"use client";

import React from "react";

interface CounterProps {
  count?: string;
  label?: string;
}

export default function CoFounderCounter({ 
  count = "6+", 
  label = "Co-Founder Matches Made" 
}: CounterProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-transparent">
      <h2 className="text-5xl md:text-6xl font-bold text-[#FACC15] mb-2">
        {count}
      </h2>
      
      <p className="text-white text-lg md:text-xl font-medium opacity-90">
        {label}
      </p>
    </div>
  );
}