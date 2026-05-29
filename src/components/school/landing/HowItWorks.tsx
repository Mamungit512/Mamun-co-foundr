"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: 1,
    title: "Build your profile",
    desc: "Skills, startup vision, and values that matter most to you as a builder.",
  },
  {
    n: 2,
    title: "Get matched",
    desc: "Engine surfaces verified University of Texas at Austin founders with complementary skills and aligned values.",
  },
  {
    n: 3,
    title: "Meetup",
    desc: "Connect and message to learn more about each other in person or over video.",
  },
  {
    n: 4,
    title: "Start building",
    desc: "Find the person you want to build the next decade with and get started.",
  },
];

export default function HowItWorks() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      className="px-6 py-20"
      style={{ backgroundColor: "#d6d2c4" }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-2xl font-semibold sm:text-3xl"
          style={{ color: "#333f48" }}
        >
          Four steps to your ideal founding partner
        </motion.h2>
        <motion.div
          className="grid gap-4 sm:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.n}
              variants={item}
              whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
              className="rounded-lg border border-black/5 bg-white p-6 transition-shadow cursor-pointer"
            >
              <div
                className="mb-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: "#bf5700" }}
              >
                {s.n}
              </div>
              <div
                className="mb-1.5 text-sm font-semibold"
                style={{ color: "#333f48" }}
              >
                {s.title}
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: "#9cadb7" }}
              >
                {s.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
