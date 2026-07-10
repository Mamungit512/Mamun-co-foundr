"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MdCalendarToday } from "react-icons/md";

export default function UtSupportPanel() {
  return (
    <motion.div
      className="rounded-lg border border-black/5 bg-white p-6 text-center sm:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h2 className="mb-3 text-2xl font-semibold sm:text-3xl" style={{ color: "#333f48" }}>
        Need help with the platform?
      </h2>
      <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed sm:text-base" style={{ color: "#5f7280" }}>
        Book time with the Mamun team for help with your account, matches, or
        anything else technical on the co-foundr platform.
      </p>

      <Link
        href="https://calendly.com/mcfm-mamuncofoundr/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-flex items-center gap-2 rounded-md px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: "#bf5700" }}
      >
        <MdCalendarToday className="text-lg" />
        Schedule a call
      </Link>

      <div className="border-t pt-6" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <p className="mb-1 text-sm" style={{ color: "#5f7280" }}>
          Or email us at{" "}
          <a
            href="mailto:mamun@mamuncofoundr.com"
            className="font-semibold hover:underline"
            style={{ color: "#bf5700" }}
          >
            mamun@mamuncofoundr.com
          </a>
        </p>
        <p className="text-sm" style={{ color: "#5f7280" }}>
          Leave your full name and we will get back to you within 1–2 business
          days.
        </p>
      </div>
    </motion.div>
  );
}
