"use client";

import { motion } from "motion/react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { HiMail } from "react-icons/hi";
import posthog from "posthog-js";

export default function NewsletterCTA() {
  const handleNewsletterClick = () => {
    posthog.capture("newsletter_cta_clicked", {
      source: "homepage",
      destination_url: "https://mamun-cofoundr.kit.com/d7eb029da2",
    });
  };

  return (
    <section className="my-12 px-4 sm:my-16 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
      <motion.div
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-6 sm:p-10 md:p-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center">
          <motion.div
            className="mb-4 flex justify-center sm:mb-6"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
            }}
          >
            <div className="rounded-full bg-yellow-300/10 p-3 sm:p-4">
              <HiMail className="h-6 w-6 text-yellow-300 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </motion.div>

          <motion.h2
            className="mb-3 text-2xl font-bold text-(--mist-white) sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join Our Newsletter
          </motion.h2>

          <motion.p
            className="mb-4 px-2 text-sm text-gray-300 sm:mb-6 sm:px-0 sm:text-base md:text-lg lg:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Secure your spot at upcoming founders&apos; networking events and
            receive exclusive insights into Muslim entrepreneurship.
          </motion.p>

          <motion.p
            className="mb-6 px-2 text-xs text-gray-400 sm:mb-8 sm:px-0 sm:text-sm md:text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            P.S. Mamun is open for everyone — not just Muslims. We&apos;re
            simply serving a badly underserved demographic.
          </motion.p>

          <motion.a
            href="https://mamun-cofoundr.kit.com/d7eb029da2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onClick={handleNewsletterClick}
          >
            <motion.button
              className="group flex cursor-pointer items-center gap-1.5 rounded-lg bg-yellow-300 px-5 py-2.5 font-semibold text-(--charcoal-black) transition-all hover:bg-yellow-400 sm:gap-2 sm:px-8 sm:py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm sm:text-base md:text-lg">
                Subscribe to Newsletter
              </span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MdKeyboardArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </motion.div>
            </motion.button>
          </motion.a>

          <motion.p
            className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
