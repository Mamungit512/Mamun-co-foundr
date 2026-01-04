"use client";

import { SignInButton } from "@clerk/nextjs";
import ReactLenis from "lenis/react";
import Image from "next/image";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { motion } from "motion/react";

// import AccessCodeForm from "@/components/home/AccessCodeForm";
import CTA from "@/components/home/CTA";
import FAQ from "@/components/home/faq";
import NewsletterCTA from "@/components/home/NewsletterCTA";
import Vision from "@/components/home/Vision";
import BookMe from "@/components/home/BookMe";
import EventsSection from "@/components/EventsSection";

/* ------
HOME PAGE

Page the user first sees when navigating to the root url of the site
------ */

function page() {
  // const [accessGranted, setAccessGranted] = useState(false);

  // if (!accessGranted) {
  //   return <AccessCodeForm onSuccess={() => setAccessGranted(true)} />;
  // }

  return (
    <ReactLenis root>
      <main className="section-height flex flex-col items-center justify-center bg-(--charcoal-black) px-4 pt-8 pb-20 text-center text-(--mist-white) sm:px-6 sm:pt-12 sm:pb-32 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        {/* -- Hero Section -- */}
        <section>
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              MAMUN
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Muslim Co-Foundr Matching
            </motion.p>
          </motion.div>

          <div className="flex flex-col items-center">
            <motion.p
              className="mb-6 px-1 text-base font-semibold sm:mb-8 sm:text-lg md:text-xl lg:text-2xl"
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
              className="relative mt-4 sm:mt-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center">
                <SignInButton forceRedirectUrl="/cofoundr-matching">
                  <motion.button
                    className="cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="translate-y flex cursor-pointer items-center rounded-md bg-(--mist-white) px-3 py-2 font-semibold text-nowrap text-(--charcoal-black) sm:px-4 sm:py-2 md:px-5 md:py-3">
                      <p className="text-sm sm:text-base">
                        Find your co-foundr
                      </p>
                      <motion.div
                        className="flex items-center"
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <MdKeyboardArrowRight className="size-5 sm:size-6 md:size-7" />
                      </motion.div>
                    </div>
                  </motion.button>
                </SignInButton>

                <motion.p
                  className="mt-3 text-center text-xs text-gray-400 sm:mt-4 sm:text-sm"
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
        {/* Newsletter CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <NewsletterCTA />
        </motion.div>

        {/* How It Works Section */}
        <section className="px-4 py-16 pt-32 sm:px-6 sm:py-20 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="mb-12 text-center sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
                How It Works
              </h2>
              <p className="text-base text-gray-300 sm:text-lg md:text-xl">
                Three simple steps to find your perfect co-founder
              </p>
            </motion.div>

            <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  className="mb-4 flex items-center justify-center sm:mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-(--charcoal-black) sm:h-12 sm:w-12">
                    <span className="text-sm font-bold sm:text-base">01</span>
                  </div>
                </motion.div>
                <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl md:text-2xl">
                  Discover
                </h3>
                <h4 className="mb-3 text-lg font-semibold text-gray-300 sm:mb-4 sm:text-xl">
                  Connect
                </h4>
                <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
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
                  className="mb-4 flex items-center justify-center sm:mb-6"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-(--charcoal-black) sm:h-12 sm:w-12">
                    <span className="text-sm font-bold sm:text-base">02</span>
                  </div>
                </motion.div>
                <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl md:text-2xl">
                  Engage
                </h3>
                <h4 className="mb-3 text-lg font-semibold text-gray-300 sm:mb-4 sm:text-xl">
                  Match
                </h4>
                <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
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
                  className="mb-4 flex items-center justify-center sm:mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 text-(--charcoal-black) sm:h-12 sm:w-12">
                    <span className="text-sm font-bold sm:text-base">03</span>
                  </div>
                </motion.div>
                <h3 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl md:text-2xl">
                  Start
                </h3>
                <h4 className="mb-3 text-lg font-semibold text-gray-300 sm:mb-4 sm:text-xl">
                  Conversation
                </h4>
                <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
                  Find a time to start the conversation. Let Mamun co-foundr
                  help you connect with like-minded individuals.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        >
          <p className="heading-6 lg:heading-5 font-semibold text-gray-200">
            Mission: Rebuilding the{" "}
            <span className="text-yellow-300">Silk Road</span> in digital form
          </p>
          <div className="mt-6 flex justify-center">
            <Image
              src="/img/silk.png"
              alt="Silk Road"
              width={800}
              height={500}
              className="w-full max-w-[800px] rounded-xl"
            />
          </div>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Vision />
        </motion.div>

        <BookMe />

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
         <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <EventsSection />
        </motion.div>
      </main>
    </ReactLenis>
  );
}

export default page;
