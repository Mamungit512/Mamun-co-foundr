import ReactLenis from "lenis/react";
import Image from "next/image";
import React from "react";
import { CiCircleInfo } from "react-icons/ci";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { TbMessageCircleFilled } from "react-icons/tb";

import BatteryLevel from "@/components/BatteryLevel";
import StripedArch from "@/components/StripedArch";

function CofoundrMatching() {
  return (
    <ReactLenis root>
      <section className="section-padding flex flex-col items-center bg-(--charcoal-black) pt-8 pb-20">
        <h1 className="heading-4 mb-10 text-(--mist-white)">
          Muslim Co-Foundr Matching
        </h1>

        <div className="mx-auto flex w-5/6 flex-col justify-center gap-x-24 rounded-2xl border-2 bg-(--mist-white) px-12 py-20 lg:flex-row xl:w-3/4 xl:gap-x-20">
          {/* Striped Arch Overlay */}
          <div className="relative mx-auto mb-10 aspect-[3/4] max-h-96 w-full max-w-72 flex-none overflow-visible">
            <StripedArch />

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
            <div className="mb-2 flex items-center justify-between">
              <h2 className="heading-5">Bilal Hayat</h2>
              <div className="flex items-center">
                <BatteryLevel level={80} />
                <button
                  className="ml-3 cursor-pointer"
                  title="Founder Battery Level"
                >
                  <CiCircleInfo />
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="heading-6">Marketing Specialist</h3>

              <div className="flex items-center gap-x-1 text-sm">
                <p className="text-gray-700">
                  <b>COS:</b>
                </p>
                <p className="text-gray-700"> 70%</p>

                <button
                  className="ml-3 cursor-pointer text-base"
                  title="Current Occupation Satisfaction"
                >
                  <CiCircleInfo />
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center">
              <FaLocationDot className="mr-2" />
              <p>Brussels, Belgium 🇧🇪</p>
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
                Youngest engineer to be promoted to E7 (Senior Staff) at
                DoorDash.
              </li>

              <li>
                Scored a perfect 180 (99.99 percentile) on my LSAT and was on
                law review at Harvard Law School.
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
    </ReactLenis>
  );
}

export default CofoundrMatching;
