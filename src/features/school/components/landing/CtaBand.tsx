"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CtaBand() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      className="px-6 py-20 text-center"
      style={{ backgroundColor: "#bf5700" }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          variants={item}
          className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em]"
          style={{ color: "#ffffff" }}
        >
          University of Texas
        </motion.div>
        <motion.h2
          variants={item}
          className="mb-3 text-3xl font-semibold text-white sm:text-4xl"
        >
          Make it here.
        </motion.h2>
        <motion.p
          variants={item}
          className="mx-auto mb-7 max-w-md text-sm leading-relaxed text-white"
        >
          Join the University of Texas co-foundr community — verified, value-aligned, and
          ready to build something that changes the world.
        </motion.p>
        <motion.div variants={item}>
          <Link
            href="/school/ut/sign-up"
            className="mb-4 inline-block rounded-md px-7 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#ffffff", color: "#bf5700" }}
          >
            Create your profile
          </Link>
        </motion.div>
        {/* QR to open the site on a phone — desktop/tablet only, since a
            phone visitor is already there. Static asset in public/qr,
            generated offline (level H, 4-module quiet zone); it encodes the
            URL directly, no shortener. */}
        <motion.div variants={item} className="mb-4 hidden justify-center md:flex">
          <div className="flex max-w-sm items-center gap-4 rounded-2xl bg-white p-3 pr-5 text-left shadow-sm">
            <Image
              src="/qr/ut-mamuncofoundr.svg"
              alt="QR code linking to ut.mamuncofoundr.com"
              width={104}
              height={104}
              unoptimized
              className="h-[104px] w-[104px] shrink-0"
            />
            <div>
              <p className="mb-1 text-sm font-semibold" style={{ color: "#333f48" }}>
                Invite your fellow UT colleagues
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#333f48" }}>
                Scan with your phone camera to open{" "}
                <a
                  href="https://ut.mamuncofoundr.com/"
                  className="font-semibold underline underline-offset-2"
                  style={{ color: "#bf5700" }}
                >
                  UT.mamuncofoundr.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={item} className="text-xs text-white">
          Exclusively for University of Texas students, alumni, and faculty
        </motion.div>
      </motion.div>
    </section>
  );
}
