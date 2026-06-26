"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section
      className="px-6 py-24 text-center"
      style={{ backgroundColor: "#bf5700" }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={item}
          className="mx-auto mb-3 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl"
        >
          Make it here.
          <br />
          <span className="text-white/60">Find your founding team.</span>
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base"
        >
          The University of Texas co-foundr matching platform connects value-aligned students,
          alumni, and faculty ready to build something that changes the world.
        </motion.p>
        <motion.div variants={item}>
          <Link
            href="/school/ut/sign-up"
            className="inline-block rounded-md px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
          >
            Find your co-foundr →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
