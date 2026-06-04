"use client";

import { motion } from "framer-motion";

export default function UtAboutPanel() {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl text-center"
      style={{ backgroundColor: "#bf5700" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="px-6 py-10 sm:px-12 sm:py-14">
        <p
          className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em]"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          University of Texas at Austin
        </p>
        <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
          Have a school question?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/80">
          For questions about UT programs, events, or anything school-related
          that isn&apos;t about the co-foundr platform, reach out to McCombs
          directly.
        </p>
        <a
          href="https://www.mccombs.utexas.edu/about/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md px-7 py-3 text-sm font-semibold transition-transform hover:scale-105"
          style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
        >
          Contact McCombs →
        </a>
      </div>
    </motion.div>
  );
}
