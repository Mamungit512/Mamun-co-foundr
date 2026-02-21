"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

export default function FounderMatchCounter() {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = rounded.on("change", setDisplay);
    const controls = animate(count, 6, { duration: 2, ease: "easeOut" });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, []);

  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-yellow-300">{display}+</div>
      <p className="mt-2 text-lg text-gray-300">Co-Founder Matches Made</p>
    </div>
  );
}
