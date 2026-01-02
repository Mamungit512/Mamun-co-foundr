"use client";

import { useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { MdCalendarToday } from "react-icons/md";

export default function BookMe() {
  const { openUserProfile } = useClerk();

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
      <motion.div
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white  bg-(--charcoal-black) p-6 sm:p-10 md:p-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Book a Demo
        </h2>

        <p className="mb-8 text-gray-300 sm:text-lg">
          Learn how Mamun can help you find your ideal co-founder.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="mx-auto mb-4 flex items-center gap-2 rounded-lg bg-yellow-300 px-6 py-3 font-semibold text-black"
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

        <motion.button
          onClick={() => {
            openUserProfile({
              appearance: {
                elements: {
                  rootBox: "billing-focus",
                  profileSection__profile: { display: "none" },
                  profileSectionContent__profile: { display: "none" },
                  avatarImage: { display: "none" },
                  avatarImageActions: { display: "none" },
                },
              },
            });
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-transparent px-6 py-3 font-semibold text-yellow-300 transition-colors hover:bg-yellow-300/10"
        >
          <MdCalendarToday className="text-xl" />
          Upgrade to Collab+ for unlimited matching → Go to Account and
          Billings.
        </motion.button>
      </motion.div>
    </section>
  );
}
