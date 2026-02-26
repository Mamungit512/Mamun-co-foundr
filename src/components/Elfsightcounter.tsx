"use client";
import React, { useEffect } from "react";
export default function CoFounderCounter() {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://elfsightcdn.com/platform.js"]'
    );
    if (existingScript) {
      // @ts-expect-error eapps is injected by Elfsight and not typed
      if (window?.eapps?.AppsManager?.reload) {
        // @ts-expect-error eapps is injected by Elfsight and not typed
        window.eapps.AppsManager.reload();
      }
      return;
    }
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center bg-transparent p-12">
      <div className="elfsight-app-334537da-6c2d-4c40-8503-059994736095" />
    </div>
  );
}