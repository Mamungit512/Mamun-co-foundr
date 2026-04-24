"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function EventsSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Our Partners
          </h2>
          <p className="mx-auto max-w-2xl text-gray-300 sm:text-lg">
            We are proud to partner with world-class institutions that support
            our mission.
          </p>
        </div>

        {/* Partner Card - UT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="group relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[var(--charcoal-black)] p-6 shadow-2xl transition-all duration-300 hover:border-yellow-300/30 hover:shadow-yellow-300/20"
        >
          {/* UT Image */}
          <div className="relative h-48 w-full overflow-hidden rounded-xl sm:h-64 md:h-80">
            {" "}
            <Image
              src="/img/ut-austin.jpg"
              alt="University of Texas at Austin"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Learn More Link */}
          <div className="mt-4 text-center">
            <a
              href="https://herbkellehercenter.mccombs.utexas.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
            >
              Learn more about UT
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
