import ReactLenis from "lenis/react";
import Image from "next/image";
import React from "react";
import { CiCircleInfo } from "react-icons/ci";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { TbMessageCircleFilled } from "react-icons/tb";

import BatteryLevel from "@/components/BatteryLevel";
import InformationTooltipButton from "@/components/ui/InformationTooltipButton";

function CofoundrMatching() {
  return (
    <ReactLenis root>
      <section className="section-padding section-height flex flex-col items-center bg-(--charcoal-black) pt-8 pb-20">
        <h1 className="heading-4 mb-10 text-(--mist-white)">
          Muslim Co-Foundr Matching
        </h1>

        <div className="mx-auto flex w-5/6 flex-col justify-center gap-x-24 rounded-2xl border-2 bg-(--mist-white) px-12 py-20 lg:flex-row xl:w-3/4 xl:gap-x-20">
          {/* <div className="relative mx-auto mb-10 aspect-[3/4] max-h-96 w-full max-w-72 flex-none overflow-visible"> */}
          <div className="relative mx-auto mb-10 h-[30rem] w-96">
            {/* Striped Arch SVG */}
            <Image
              src="/img/arch1.svg"
              alt="Decorative Arch"
              fill
              className="z-10 object-contain"
            />

            {/* Profile Image */}
            {/* <div className="absolute inset-4 z-0 overflow-hidden rounded-t-full"> */}
            <div className="absolute top-12 left-14 z-0 h-96 w-60 overflow-hidden rounded-t-full">
              <Image
                src="/img/bilal-hayat.png"
                alt="Bilal Hayat Profile"
                fill
                className="rounded-t-full object-contain"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="heading-5">Bilal Hayat</h2>
              <div className="flex items-center">
                <BatteryLevel level={80} />
                <InformationTooltipButton
                  text={
                    <div className="absolute top-full left-1/2 mt-2 w-[26rem] -translate-x-1/2 rounded bg-(--charcoal-black) px-2 py-1 text-sm text-white shadow">
                      <p className="mb-3">The Founder&apos;s Battery:</p>
                      <p>
                        Users can update their &lsquo;battery level&rsquo; to
                        indicate their readiness—whether they&apos;re actively
                        seeking a partner, energized, maintaining balance, or
                        nearing burnout—ensuring better matches and stronger
                        startup collaborations. Similar to the iPhone battery
                        level setting visuals, again from 0-100%
                      </p>
                    </div>
                  }
                >
                  <CiCircleInfo />
                </InformationTooltipButton>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="heading-6">Marketing Specialist</h3>

              <div className="flex items-center gap-x-1 text-sm">
                <p className="text-gray-700">
                  <b>COS:</b>
                </p>
                <p className="text-gray-700"> 70%</p>
                <InformationTooltipButton
                  text={
                    <div className="absolute top-full left-1/2 mt-2 w-[26rem] -translate-x-1/2 rounded bg-(--charcoal-black) px-2 py-1 text-sm text-white shadow">
                      <p className="mb-3">Current Occupation Satisfaction:</p>
                      <p>
                        A gauge of your overall contentment with their career
                        path and their motivation for seeking a new venture from
                        0-100%.
                      </p>
                    </div>
                  }
                >
                  <CiCircleInfo />
                </InformationTooltipButton>
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
              <button className="translate-y cursor-pointer">
                <ImCross className="size-5 text-red-500" />
              </button>

              <button className="translate-y cursor-pointer">
                <FaStar className="size-7 text-gray-500" />
              </button>

              <button className="translate-y cursor-pointer">
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
