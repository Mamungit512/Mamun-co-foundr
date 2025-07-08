import BatteryLevel from "@/components/BatteryLevel";
import Image from "next/image";
import React from "react";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { TbMessageCircleFilled } from "react-icons/tb";

function CofoundrMatching() {
  return (
    <section className="section-padding bg-(--charcoal-black) pt-8 pb-20">
      <h1 className="heading-4 mb-10 text-(--mist-white)">
        Muslim Co-Foundr Matching
      </h1>

      <div className="mx-auto flex w-5/6 flex-col justify-center gap-x-24 rounded-2xl border-2 bg-(--mist-white) px-12 py-20 lg:flex-row xl:w-3/4 xl:gap-x-20">
        {/* Striped Arch Overlay */}
        <div className="relative mx-auto mb-10 aspect-[3/4] max-h-96 w-full max-w-72 flex-none overflow-visible">
          <svg
            viewBox="0 0 100 55"
            preserveAspectRatio="none"
            className="pointer-events-none absolute top-0 left-1/2 h-48 w-[130%] -translate-x-1/2 -translate-y-12"
          >
            <defs>
              <pattern
                id="stripes"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <rect width="5" height="12" fill="#9B5753" />
                <rect x="5" width="5" height="12" fill="#D7CFCE" />
              </pattern>
            </defs>

            {/* Half-oval filled with stripes */}
            <ellipse
              cx="50" /* Center horizontally */
              cy="55" /* Position near bottom of viewBox */
              rx="50" /* Radius wider than viewBox to overflow */
              ry="55" /* Radius tall enough to form half-oval */
              fill="url(#stripes)"
            />
          </svg>

          <div className="relative aspect-[3/4] max-h-96 w-full max-w-72 overflow-hidden">
            {/* Image */}
            <Image
              src="/img/bilal-hayat.png"
              alt="Bilal Hayat Profile"
              fill
              className="rounded-t-full object-cover"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="heading-5">Bilal Hayat</h2>
            <div>
              <BatteryLevel level={80} />
            </div>
          </div>

          <h3 className="heading-6 mb-2 text-gray-700">Marketing Specialist</h3>

          <div className="mb-4 flex items-center">
            <FaLocationDot className="mr-2" />
            <p>Brussels, Belgium</p>
          </div>

          <div className="mb-2">
            <p className="heading-6 font-bold">Bio:</p>
            <p></p>
          </div>

          <p className="heading-6 font-bold">Accomplishments:</p>
          <ul className="flex flex-col gap-y-1">
            <li>
              Built Appetas, an instant website builder for SMBs. Acquired by
              Google in 2014.
            </li>

            <li>
              Youngest engineer to be promoted to E7 (Senior Staff) at DoorDash.
            </li>

            <li>
              Scored a perfect 180 (99.99 percentile) on my LSAT and was on law
              review at Harvard Law School.
            </li>
          </ul>

          <div className="mt-10 flex items-center justify-center gap-x-10">
            <button className="cursor-pointer">
              <ImCross className="size-5 text-red-500" />
            </button>

            <button className="cursor-pointer">
              <FaStar className="size-7 text-gray-500" />
            </button>

            <button className="cursor-pointer">
              <TbMessageCircleFilled className="size-7 text-blue-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CofoundrMatching;
