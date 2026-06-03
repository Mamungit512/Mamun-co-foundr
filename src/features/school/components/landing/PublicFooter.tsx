"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PublicFooter() {
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
              University of Texas at Austin Co-Foundr
            </div>
            <div className="text-xs" style={{ color: "#9cadb7" }}>
              Co-Foundr Matching Platform
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Resources
              </div>
              <motion.a
                href="https://lu.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1.5 block text-xs hover:text-white transition-colors"
                style={{ color: "#9cadb7" }}
                whileHover={{ color: "#ffffff" }}
              >
                UT Luma Events
              </motion.a>
              <motion.a
                href="https://www.cakeequity.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs hover:text-white transition-colors"
                style={{ color: "#9cadb7" }}
                whileHover={{ color: "#ffffff" }}
              >
                Create a Cap Table
              </motion.a>
            </div>
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Company
              </div>
              <motion.div
                whileHover={{ color: "#ffffff" }}
              >
                <Link
                  href="/privacy-policy"
                  className="mb-1.5 block text-xs hover:text-white transition-colors"
                  style={{ color: "#9cadb7" }}
                >
                  Privacy Policy
                </Link>
              </motion.div>
              <motion.div whileHover={{ color: "#ffffff" }}>
                <Link
                  href="/school/ut/contact-us"
                  className="block text-xs hover:text-white transition-colors"
                  style={{ color: "#9cadb7" }}
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div
          className="border-t pt-5 text-xs"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          © 2026 University of Texas at Austin Co-Foundr. Powered by Mamun. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
