"use client";

import { motion } from "motion/react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { HiMail } from "react-icons/hi";
import { trackEvent } from "@/lib/posthog-events";

export default function ECCWaitlist() {
  const handleNewsletterClick = () => {
    trackEvent.newsletterCtaClicked({
      source: "homepage",
      destination_url: "https://mamun-cofoundr.kit.com/d7eb029da2",
    });
  };

  return (
    <section className="my-12 px-4 sm:my-16 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
      <motion.div
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white bg-(--charcoal-black) p-8 sm:p-12 md:p-16 lg:p-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-col text-center">
          <motion.div
            className="mb-4 sm:mb-6"
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
            <div className="inline-block rounded-full bg-yellow-300/10 p-3 sm:p-4">
              <HiMail className="h-6 w-6 text-yellow-300 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </motion.div>

          <motion.h2
            className="mb-3 text-xl font-bold text-white sm:mb-4 sm:text-2xl md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join the Made in Mamun Funding Waitlist
          </motion.h2>

          <motion.p
            className="mb-8 text-base text-gray-300 sm:mb-10 md:text-lg lg:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Get exclusive early access before the public announcement
          </motion.p>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onClick={handleNewsletterClick}
          >
            <motion.a
              href="https://docs.google.com/forms/d/1My_Kc6IVqupj3SeRzsK7uvEoVCqxKAuY4np6phaAQP4/edit "
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-yellow-300 px-6 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 sm:w-auto sm:px-8 sm:py-4">
                <span className="text-base sm:text-lg">Apply</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <MdKeyboardArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.div>
              </button>
            </motion.a>
          </motion.div>

          <motion.p
            className="mt-4 text-xs text-gray-500 sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            We respect your privacy. Your information will only be used for
            waitlist purposes.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
