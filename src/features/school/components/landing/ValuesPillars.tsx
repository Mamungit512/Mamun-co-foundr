"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    title: "Human centered",
    desc: "Matches built around people, not just skill sets or résumés.",
  },
  {
    title: "Ideas launched",
    desc: "Connecting bold thinkers ready to take the first step together.",
  },
  {
    title: "Individuals intersected",
    desc: "Diverse skills, backgrounds, and beliefs — stronger as a team.",
  },
  {
    title: "Future focused",
    desc: "Building for a world we can't yet imagine, starting now.",
  },
];

export default function ValuesPillars() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <section
      className="px-6 py-20"
      style={{ backgroundColor: "#333f48" }}
    >
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-1.5 text-center text-2xl font-semibold text-white sm:text-3xl"
        >
          Built on University of Texas values
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-sm"
          style={{ color: "#9cadb7" }}
        >
          Every match is filtered against four pillars that define who we are
        </motion.p>
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={item}
              whileHover={{ y: -4 }}
              className="rounded-lg border border-white/10 bg-white/5 p-5 cursor-pointer transition-all duration-300"
            >
              <motion.div
                className="mb-3 h-2 w-2 rounded-full"
                style={{ backgroundColor: "#bf5700" }}
                whileHover={{ scale: 1.3 }}
              />
              <div className="mb-1.5 text-sm font-semibold text-white">
                {p.title}
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: "#9cadb7" }}
              >
                {p.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
