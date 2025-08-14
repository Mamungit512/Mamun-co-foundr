"use client";

import ReactLenis from "lenis/react";
import Image from "next/image";
import React, { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { TbMessageCircleFilled } from "react-icons/tb";

import BatteryLevel from "@/components/BatteryLevel";
import InformationTooltipButton from "@/components/ui/InformationTooltipButton";
import { useGetProfiles } from "@/features/profile/useProfile";
import CofoundrShowMore from "./CofoundrShowMore";

function CofoundrMatching() {
  const [curProfileIdx, setCurProfileIdx] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const { data: profiles } = useGetProfiles();

  if (!profiles || profiles.length === 0) return <p>No profiles found.</p>;

  const curProfile = profiles[curProfileIdx];

  const handleNextProfile = () => {
    setCurProfileIdx((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  return (
    <ReactLenis root>
      <section className="section-padding section-height flex flex-col items-center bg-(--charcoal-black) pt-8 pb-20">
        <h1 className="heading-4 mb-10 text-(--mist-white)">
          Muslim Co-Foundr Matching
        </h1>

        <div className="mx-auto w-5/6 rounded-2xl border-2 bg-(--mist-white) px-12 py-20 xl:w-3/4">
          <div className="flex flex-col justify-center gap-x-24 lg:flex-row xl:gap-x-20">
            {/* <div className="relative mx-auto mb-10 aspect-[3/4] max-h-96 w-full max-w-72 flex-none overflow-visible"> */}
            <div className="relative mx-auto mb-10 h-[30rem] w-96 flex-none">
              {/* Striped Arch SVG */}
              <Image
                src="/img/arch1.svg"
                alt="Decorative Arch"
                fill
                className="z-10 object-contain"
              />

              {/* Profile Image */}
              {/* <div className="absolute inset-4 z-0 overflow-hidden rounded-t-full"> */}
              <div className="absolute top-12 left-18 z-0 h-96 w-60 overflow-hidden rounded-t-full">
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
                <h2 className="heading-5">
                  {curProfile.firstName} {curProfile.lastName}
                </h2>
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
                <h3 className="heading-6">{curProfile.title}</h3>

                <div className="flex items-center gap-x-1 text-sm">
                  <p className="text-gray-700">
                    <b>COS:</b>
                  </p>
                  <p className="text-gray-700"> {curProfile.satisfaction}%</p>
                  <InformationTooltipButton
                    text={
                      <div className="absolute top-full left-1/2 mt-2 w-[26rem] -translate-x-1/2 rounded bg-(--charcoal-black) px-2 py-1 text-sm text-white shadow">
                        <p className="mb-3">Current Occupation Satisfaction:</p>
                        <p>
                          A gauge of your overall contentment with their career
                          path and their motivation for seeking a new venture
                          from 0-100%.
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
                <p>
                  {curProfile.city}, {curProfile.country}
                </p>
              </div>

              <div className="mb-2">
                <h3 className="heading-6 font-bold">Bio:</h3>
                <p>{curProfile.personalIntro}</p>
              </div>

              <h3 className="heading-6 font-bold">Accomplishments:</h3>
              <ul className="flex flex-col gap-y-1">
                {curProfile.accomplishments}
              </ul>

              <h3 className="heading-6 font-bold">Technical:</h3>
              <ul className="flex flex-col gap-y-1">
                {curProfile.isTechnical ? "Yes" : "No"}
              </ul>

              <h3 className="heading-6 font-bold">Education:</h3>
              <ul className="flex flex-col gap-y-1">{curProfile.education}</ul>

              <h3 className="heading-6 font-bold">Work Experience:</h3>
              <ul className="flex flex-col gap-y-1">{curProfile.experience}</ul>

              {/* --- Next, Save, Message Buttons --- */}
              <div className="mt-10 flex items-center justify-center gap-x-10">
                <button
                  className="translate-y cursor-pointer"
                  onClick={handleNextProfile}
                >
                  <ImCross className="size-5 text-red-500" />
                </button>

                <button className="translate-y cursor-pointer">
                  <FaStar className="size-7 text-gray-500" />
                </button>

                <button className="translate-y cursor-pointer">
                  <TbMessageCircleFilled className="size-7 text-blue-500" />
                </button>
              </div>

              <button
                className="cursor-pointer transition-all duration-200 hover:translate-y-1"
                onClick={() => setShowMore((prev) => !prev)}
              >
                {showMore ? "Show Less" : "Show More"}
              </button>
            </div>
          </div>

          {showMore && <CofoundrShowMore curProfile={curProfile} />}
        </div>
      </section>
    </ReactLenis>
  );
}

export default CofoundrMatching;
