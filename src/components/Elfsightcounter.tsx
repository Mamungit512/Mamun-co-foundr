"use client";

import { useEffect } from "react";

export default function ElfsightCounter() {
  useEffect(() => {
    if (
      document.querySelector(
        'script[src="https://elfsightcdn.com/platform.js"]',
      )
    ) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="elfsight-app-334537da-6c2d-4c40-8503-059994736095"
      data-elfsight-app-lazy
    />
  );
}
