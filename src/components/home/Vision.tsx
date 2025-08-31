import React from "react";
import { CiGlobe } from "react-icons/ci";
import { LuBrain, LuSparkle } from "react-icons/lu";
import { motion } from "motion/react";

function Vision() {
  return (
    <section className="px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Vision Statement */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="heading-6 lg:heading-5 font-semibold text-gray-200">
            Vision: Removing barriers to usher in the{" "}
            <span className="text-yellow-300">Islamic Renaissance 2.0</span>
          </p>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid gap-12 md:grid-cols-3">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            <motion.div
              className="mb-6 flex justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-300/10 text-yellow-300">
                <CiGlobe className="size-8" />
              </div>
            </motion.div>
            <h2 className="heading-6 mb-4 font-bold">Ummatic Reach</h2>
            <p className="leading-relaxed text-gray-400">
              Engage with innovators and visionaries from around the globe, and
              transcend borders. Your ideal founder awaits you.
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="mb-6 flex justify-center"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-300/10 text-yellow-300">
                <LuSparkle className="size-8" />
              </div>
            </motion.div>
            <h2 className="heading-6 mb-4 font-bold">Mission Driven</h2>
            <p className="leading-relaxed text-gray-400">
              Mamun isn&apos;t just for business. It&apos;s for anyone looking
              to make a positive impact on the world.
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="mb-6 flex justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-300/10 text-yellow-300">
                <LuBrain className="size-8" />
              </div>
            </motion.div>
            <h2 className="heading-6 mb-4 font-bold">Build Ingenuity</h2>
            <p className="leading-relaxed text-gray-400">
              With the rise of AI, it&apos;s essential to work together as
              humans. Find the support, skills, and shared passion you need to
              bring your vision to life.
            </p>
          </motion.div>
        </div>

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
        </motion.div>
      </div>
    </section>
  );
}

export default Vision;
