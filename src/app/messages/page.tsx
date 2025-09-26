"use client";

import ReactLenis from "lenis/react";
import { FaEnvelope, FaHeart } from "react-icons/fa6";
import { motion } from "motion/react";

function MessagesPage() {
  return (
    <ReactLenis root>
      <section className="section-padding section-height bg-[var(--charcoal-black)] pt-6 pb-16 text-[var(--mist-white)] sm:pt-8 sm:pb-20">
        <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2 text-center md:text-left"
          >
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              Messages
            </h2>
            <p className="text-sm text-white/70 sm:text-base md:text-lg">
              Connect with your matched cofounders
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex min-h-[400px] flex-col items-center justify-center space-y-6"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <FaEnvelope className="h-8 w-8" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold text-white">
                No messages yet
              </h3>
              <p className="max-w-md text-sm text-white/70">
                Start connecting with your matches by liking profiles in the
                cofounder matching section. When you both like each other, you
                can start messaging!
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 rounded-lg bg-pink-500/20 px-6 py-3 text-pink-400 transition-all duration-200 hover:bg-pink-500/30 hover:text-pink-300"
              onClick={() => (window.location.href = "/cofoundr-matching")}
            >
              <FaHeart className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Start Matching</span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </ReactLenis>
  );
}

export default MessagesPage;
