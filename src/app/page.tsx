"use client";

import CTA from "@/components/home/CTA";
import FAQ from "@/components/home/faq";
import Vision from "@/components/home/Vision";
import { SignInButton } from "@clerk/nextjs";
import ReactLenis from "lenis/react";
import Image from "next/image";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { motion } from "motion/react";

/* ------
HOME PAGE

Page the user first sees when navigating to the root url of the site
------ */

function page() {
  return (
    <ReactLenis root>
      <main className="section-height flex flex-col items-center justify-center bg-(--charcoal-black) px-5 pt-12 pb-40 text-center text-(--mist-white) sm:px-10 lg:px-40">
        {/* -- Hero Section -- */}
        <section>
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="heading-4 font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              MAMUN
            </motion.h1>
            <motion.p
              className="heading-6 lg:heading-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Muslim Co-Foundr Matching
            </motion.p>
          </motion.div>

          <div className="flex flex-col items-center">
            <motion.p
              className="lg:heading-6 mb-8 px-1 font-semibold"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <b>
                <i>Where Muslim founders find each other</i>
              </b>
            </motion.p>

            <motion.div
              className="relative grid w-56 grid-cols-2 sm:w-72 md:w-96"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
              >
                <Image
                  className="ml-3 aspect-square rounded-full object-cover"
                  src="/img/woman-profile.png"
                  height={200}
                  width={200}
                  alt="Side profile of woman wearing a hijab"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
              >
                <Image
                  className="aspect-square rounded-full object-cover"
                  src="/img/man-profile.png"
                  height={200}
                  width={200}
                  alt="Side profile of a bearded man wearing a nike cap"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
              >
                <Image
                  className="z-50 -mt-3 ml-3 aspect-square rounded-full object-cover"
                  src="/img/company-meeting.png"
                  height={200}
                  width={200}
                  alt="Four people surrounding a table discussing work requirements"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
              >
                <Image
                  className="-mt-3 aspect-square rounded-full object-cover"
                  src="/img/man-profile-2.png"
                  height={200}
                  width={200}
                  alt="Side profile of man wearing kufi"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="relative mt-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            >
              <div className="md:absolute md:left-20">
                <SignInButton>
                  <motion.button
                    className="cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="translate-y flex cursor-pointer items-center rounded-md bg-(--mist-white) px-4 py-2 font-semibold text-nowrap text-(--charcoal-black) md:px-5 md:py-3">
                      <p>Login to Co-foundr Matching</p>
                      <motion.div
                        className="flex items-center"
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <MdKeyboardArrowRight className="size-7" />
                      </motion.div>
                    </div>
                  </motion.button>
                </SignInButton>

                <motion.p
                  className="mt-4 line-clamp-2 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 2.0, ease: "easeOut" }}
                >
                  (Actual founders who found their co-founders on Mamun)
                </motion.p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-6 py-20 pt-60 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="heading-5 mb-4">How It Works</h2>
              <p className="text-lg text-gray-300">
                Three simple steps to find your perfect co-founder
              </p>
            </motion.div>

            <div className="grid gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  className="mb-6 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 text-(--charcoal-black)">
                    <span className="font-bold">01</span>
                  </div>
                </motion.div>
                <h3 className="heading-6 mb-4 font-bold">Discover</h3>
                <h4 className="mb-4 text-xl font-semibold text-gray-300">
                  Connect
                </h4>
                <p className="leading-relaxed text-gray-400">
                  Create a profile and tell us about yourself. Our matching
                  engine shows you profiles that fit your preferences.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <motion.div
                  className="mb-6 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 text-(--charcoal-black)">
                    <span className="font-bold">02</span>
                  </div>
                </motion.div>
                <h3 className="heading-6 mb-4 font-bold">Engage</h3>
                <h4 className="mb-4 text-xl font-semibold text-gray-300">
                  Match
                </h4>
                <p className="leading-relaxed text-gray-400">
                  If a profile piques your interest, invite them to connect. If
                  they accept your invite, that&apos;s a match!
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="mb-6 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 text-(--charcoal-black)">
                    <span className="font-bold">03</span>
                  </div>
                </motion.div>
                <h3 className="heading-6 mb-4 font-bold">Start</h3>
                <h4 className="mb-4 text-xl font-semibold text-gray-300">
                  Conversation
                </h4>
                <p className="leading-relaxed text-gray-400">
                  Find a time to start the conversation. Let Mamun co-foundr
                  help you connect with like-minded individuals.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Vision />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <FAQ />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <CTA />
        </motion.div>
      </main>
    </ReactLenis>
  );
}

export default page;
