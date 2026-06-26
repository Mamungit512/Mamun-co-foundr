"use client";

import { motion } from "framer-motion";

const SCHOOLS = [
  { name: "McCombs", role: "Business · Sellers", color: "#bf5700" },
  { name: "Cockrell", role: "Engineering · Builders", color: "#005f86" },
  { name: "Information", role: "Data · UX", color: "#00a9b7" },
  { name: "Nat. Sciences", role: "Science · R&D", color: "#579d42" },
  { name: "Liberal Arts", role: "Econ · Policy", color: "#f8971f" },
  { name: "Moody", role: "Comms · Story", color: "#a6cd57" },
  { name: "Fine Arts", role: "Design · Makers", color: "#ffd600" },
  { name: "Architecture", role: "Space · Systems", color: "#333f48" },
  { name: "LBJ", role: "Public Affairs", color: "#9cadb7" },
  { name: "Dell Medical", role: "Health · Clinical", color: "#c0392b" },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const rowItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhyItWorks() {
  return (
    <section
      className="px-6 py-16 border-y"
      style={{
        backgroundColor: "#faf8f4",
        borderColor: "#e8e4dc",
      }}
    >
      {/* Header */}
      <div className="mx-auto max-w-xl text-center mb-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[10px] font-semibold tracking-widest uppercase mb-2"
          style={{ color: "#bf5700" }}
        >
          Why it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl font-semibold leading-snug mb-3 sm:text-3xl"
          style={{ color: "#333f48" }}
        >
          Great companies aren&apos;t built in{" "}
          <em className="not-italic" style={{ color: "#bf5700" }}>
            one department.
          </em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm leading-relaxed"
          style={{ color: "#7a8893" }}
        >
          An engineer who can&apos;t sell. A business student with no one to
          build. A designer working alone. The matching engine reaches across all
          10 schools and assembles the team none of them could find on their own.
        </motion.p>
      </div>

      {/* Flow diagram */}
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-0">

        {/* Schools panel */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="rounded-xl border bg-white p-4 flex-shrink-0 shadow-sm"
          style={{ borderColor: "#e8e4dc" }}
        >
          <p
            className="text-[9px] font-bold tracking-widest uppercase text-center mb-3"
            style={{ color: "#9cadb7" }}
          >
            10 UT Schools · One pool
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {SCHOOLS.map((s) => (
              <motion.div
                key={s.name}
                variants={rowItem}
                className="flex items-start gap-2"
              >
                <span
                  className="mt-[3px] h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <div>
                  <span
                    className="block text-[11px] font-semibold leading-tight whitespace-nowrap"
                    style={{ color: "#333f48" }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="block text-[9px] leading-snug whitespace-nowrap mt-0.5"
                    style={{ color: "#9cadb7" }}
                  >
                    {s.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Converging funnel */}
        <div
          className="flex-shrink-0 flex items-center justify-center sm:rotate-0 rotate-90"
          aria-hidden="true"
          style={{ width: 72, height: 200 }}
        >
          <svg
            viewBox="0 0 78 250"
            fill="none"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%" }}
          >
            <line x1="0" y1="14"  x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="40"  x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="66"  x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="92"  x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="118" x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="132" x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="158" x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="184" x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="210" x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <line x1="0" y1="236" x2="70" y2="125" stroke="#d8c3a8" strokeWidth="1.5" />
            <circle cx="70" cy="125" r="4.5" fill="#bf5700" />
          </svg>
        </div>

        {/* Matching engine pill */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex-shrink-0 rounded-xl px-5 py-5 text-center"
          style={{
            backgroundColor: "#bf5700",
            boxShadow: "0 6px 20px rgba(191,87,0,0.28)",
          }}
        >
          <p
            className="font-mono text-sm font-bold tracking-wide leading-snug text-white"
          >
            MATCHING<br />ENGINE
          </p>
          <p
            className="mt-2 text-[9px] leading-snug"
            style={{ color: "#ffd9bf" }}
          >
            Complementary skills<br />· Aligned values
          </p>
        </motion.div>

        {/* Arrow */}
        <div
          className="flex-shrink-0 flex items-center justify-center sm:rotate-0 rotate-90"
          aria-hidden="true"
          style={{ width: 44, height: 16 }}
        >
          <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
            <line x1="0" y1="8" x2="32" y2="8" stroke="#cbb6a0" strokeWidth="1.5" />
            <path
              d="M30 3l7 5-7 5"
              stroke="#cbb6a0"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Output: one founding team */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex-shrink-0 rounded-xl px-6 py-5 text-center"
          style={{
            backgroundColor: "#1d262c",
            boxShadow: "0 6px 20px rgba(29,38,44,0.22)",
          }}
        >
          <p
            className="text-[9px] font-bold tracking-widest uppercase mb-3"
            style={{ color: "#5cc4b2" }}
          >
            After · One team
          </p>
          <div className="flex gap-2 justify-center mb-3">
            <span
              className="h-5 w-5 rounded-full border-2"
              style={{ backgroundColor: "#00a9b7", borderColor: "#1d262c", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}
            />
            <span
              className="h-5 w-5 rounded-full border-2"
              style={{ backgroundColor: "#bf5700", borderColor: "#1d262c", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}
            />
            <span
              className="h-5 w-5 rounded-full border-2"
              style={{ backgroundColor: "#ffffff", borderColor: "#1d262c", boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}
            />
          </div>
          <p
            className="font-serif text-lg font-bold text-white whitespace-nowrap"
          >
            One founding team
          </p>
        </motion.div>
      </div>

      {/* Footer tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 text-center text-xs leading-relaxed"
        style={{ color: "#9cadb7" }}
      >
        You bring what you&apos;re great at.{" "}
        <strong style={{ color: "#5a6a75", fontWeight: 600 }}>
          The engine finds the people who are great at the rest.
        </strong>
      </motion.p>
    </section>
  );
}
