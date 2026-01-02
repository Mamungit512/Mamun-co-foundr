"use client";
import { motion } from "framer-motion";

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
            Join Our Events
          </h2>
          <p className="mx-auto max-w-2xl text-gray-300 sm:text-lg">
            Connect with fellow founders, attend networking sessions, and
            discover opportunities at our curated events.
          </p>
        </div>

        {/* Luma Calendar Embed with Hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--charcoal-black)] p-4 shadow-2xl transition-all duration-300 hover:border-yellow-300/30 hover:shadow-yellow-300/20 sm:p-6"
        >
          <div className="relative w-full" style={{ paddingBottom: "75%" }}>
            <iframe
              src="https://luma.com/embed/calendar/cal-i5D32ubAeCUytvZ/events?lt=dark"
              className="absolute top-0 left-0 h-full w-full rounded-lg"
              frameBorder="0"
              style={{ border: "1px solid #bfcbda88" }}
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
