"use client";
import { useEffect, useState } from "react";

export default function Countdown() {
  const targetDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState("365:00:00:00");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("0:00:00:00");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const formatted = `${days}:${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      setTimeLeft(formatted);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-md px-3 py-1 whitespace-nowrap">
      <span className="text-lime-500">{timeLeft}</span>
      <span className="text-white">Until ECC Funding</span>
    </div>
  );
}
