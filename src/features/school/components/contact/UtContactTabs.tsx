"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import UtSupportPanel from "./UtSupportPanel";
import UtAboutPanel from "./UtAboutPanel";

type Tab = "support" | "about";

const TABS: { id: Tab; label: string }[] = [
  { id: "support", label: "Platform support" },
  { id: "about", label: "UT inquiries" },
];

export default function UtContactTabs() {
  const [active, setActive] = useState<Tab>("support");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Contact options"
        className="mb-6 inline-flex rounded-full p-1"
        style={{ backgroundColor: "rgba(51,63,72,0.1)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className="relative rounded-full px-5 py-2 text-sm font-medium transition-colors"
            style={{
              color: active === tab.id ? "#ffffff" : "rgba(51,63,72,0.6)",
            }}
          >
            {active === tab.id && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#bf5700" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        aria-label={TABS.find((t) => t.id === active)?.label}
      >
        {active === "support" ? <UtSupportPanel /> : <UtAboutPanel />}
      </div>
    </div>
  );
}
