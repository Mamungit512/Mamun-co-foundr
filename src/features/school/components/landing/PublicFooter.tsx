"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PublicFooter({ slug }: { slug: string }) {
  return (
    <footer
      className="px-6 py-12"
      style={{ backgroundColor: "#333f48" }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-8 flex flex-col items-start justify-between gap-8 sm:flex-row"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="mb-1 text-sm font-semibold" style={{ color: "#bf5700" }}>
              University of Texas Co-Foundr
            </div>
            <div className="text-xs" style={{ color: "#9cadb7" }}>
              Co-Foundr Matching Platform
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <div className="mb-3 text-[10px] font-semibold text-white/70 uppercase tracking-[0.08em]">
                Resources
              </div>
              <a
                href="https://www.cakeequity.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#9cadb7] transition-colors duration-300 hover:text-white"
              >
                Create a Cap Table
              </a>
            </div>
            <div>
              <div className="mb-3 text-[10px] font-semibold text-white/70 uppercase tracking-[0.08em]">
                Company
              </div>
              <Link
                href={`/school/${slug}/privacy-policy`}
                className="mb-1.5 block text-xs text-[#9cadb7] transition-colors duration-300 hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href={`/school/${slug}/terms-and-conditions`}
                className="mb-1.5 block text-xs text-[#9cadb7] transition-colors duration-300 hover:text-white"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href={`/school/${slug}/contact-us`}
                className="block text-xs text-[#9cadb7] transition-colors duration-300 hover:text-white"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>

        <div
          className="border-t pt-5 text-xs text-white/60"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          © 2026 University of Texas Co-Foundr. Powered by Mamun. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
