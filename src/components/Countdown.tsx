"use client";
import { useEffect, useState } from "react";

export default function Countdown() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ecc_target_date");

    if (saved) {
      setTargetDate(new Date(saved));
    } else {
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);

      localStorage.setItem("ecc_target_date", nextYear.toISOString());
      setTargetDate(nextYear);
    }
  }, []);

  useEffect(() => {
    if (!targetDate) return;

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

      setTimeLeft(
        `${days}:${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="inline-flex items-center gap-2 rounded-md px-3 py-1 whitespace-nowrap">
      <span className="text-lime-500">{timeLeft}</span>
      <span className="text-white">Until ECC Funding</span>
    </div>
  );
}
