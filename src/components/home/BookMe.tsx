"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MdCalendarToday } from "react-icons/md";

export default function BookMe() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
      <motion.div
        className="mx-auto max-w-4xl rounded-2xl bg-gray-800/40 p-24 text-center shadow-xl backdrop-blur-md"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
          Book a Demo
        </h2>
        <p className="mb-8 text-gray-300 sm:text-lg">
          Learn how Mamun can help you find your ideal co-founder.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="mx-auto flex items-center gap-2 rounded-lg bg-yellow-300 px-6 py-3 font-semibold text-(--charcoal-black)"
        >
          <Link
            href="https://calendly.com/teslim-mamuncofoundr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <MdCalendarToday className="text-xl" />
            Book Now
          </Link>
        </motion.button>
      </motion.div>
    </section>
  );
}
