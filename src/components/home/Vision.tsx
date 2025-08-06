import React from "react";
import { CiGlobe } from "react-icons/ci";
import { LuBrain, LuSparkle } from "react-icons/lu";

function Vision() {
  return (
    <section className="mt-50 w-full">
      <p className="mb-28 text-center font-semibold">
        Vision: Removing barriers to usher in the{" "}
        <span className="text-yellow-300">Islamic Renaissance 2.0</span>
      </p>
      <div className="flex gap-x-20">
        <div className="flex flex-col items-center justify-center">
          <CiGlobe className="mb-6 size-10" />
          <h2 className="heading-6 mb-2">Ummatic Reach</h2>

          <p>
            Engage with innovators and visionaries from around the globe, and
            transcend borders. Your ideal founder awaits you.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <LuSparkle className="mb-6 size-10" />
          <h2 className="heading-6 mb-2">Mission Driven</h2>

          <p>
            Mamun isn&apos;t just for business. It&apos;s for anyone looking to
            make a positive impact on the world.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <LuBrain className="mb-6 size-10" />
          <h2 className="heading-6 mb-2">Build Ingenuity</h2>

          <p>
            With the rise of AI, it&apos;s essential to work together as humans.
            Find the support, skills, and shared passion you need to bring your
            vision to life.
          </p>
        </div>
      </div>
      <p className="mt-30 text-center font-semibold">
        Mission: Rebuilding the{" "}
        <span className="text-yellow-300">Silk Road </span> in digital form
      </p>
    </section>
  );
}

export default Vision;
