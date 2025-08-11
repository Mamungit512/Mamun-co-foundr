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
                <h2 className="heading-5">
                  {curProfile.first_name} {curProfile.last_name}
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
                <p>{curProfile.personal_intro}</p>
              </div>

              <h3 className="heading-6 font-bold">Accomplishments:</h3>
              <ul className="flex flex-col gap-y-1">
                {curProfile.accomplishments}
              </ul>

              <h3 className="heading-6 font-bold">Is Technical:</h3>
              <ul className="flex flex-col gap-y-1">
                {curProfile.is_technical ? "Yes" : "No"}
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

          {showMore && (
            <>
              <div className="mt-20">
                <h2 className="heading-5"> Startup Plans</h2>
                <h3 className="heading-6 font-bold">Has Startup:</h3>
                <ul className="flex flex-col gap-y-1">
                  {curProfile.has_startup ? "Yes" : "No"}
                </ul>

                {curProfile.hasStartUp && (
                  <div>
                    <h3 className="heading-6 font-bold">Startup Name:</h3>
                    <ul className="flex flex-col gap-y-1">
                      {curProfile.startup_name}
                    </ul>

                    <h3 className="heading-6 font-bold">
                      Startup Description:
                    </h3>
                    <ul className="flex flex-col gap-y-1">
                      {curProfile.startup_description}
                    </ul>

                    <h3 className="heading-6 font-bold">
                      Time Spent on Startup:
                    </h3>
                    <ul className="flex flex-col gap-y-1">
                      {curProfile.startup_time_spent}
                    </ul>

                    <h3 className="heading-6 font-bold">
                      Current Startup Funding:
                    </h3>
                    <ul className="flex flex-col gap-y-1">
                      {curProfile.startup_funding}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-20">
                <h2 className="heading-5">Personal Interests</h2>

                <h3 className="heading-6 font-bold">Interests:</h3>
                <ul className="flex flex-col gap-y-1">
                  {curProfile.interests}
                </ul>

                <h3 className="heading-6 font-bold">Hobbies:</h3>
                <ul className="flex flex-col gap-y-1">{curProfile.hobbies}</ul>

                <h3 className="heading-6 font-bold">Journey:</h3>
                <ul className="flex flex-col gap-y-1">{curProfile.journey}</ul>

                <h3 className="heading-6 font-bold">Extra Info:</h3>
                <ul className="flex flex-col gap-y-1">{curProfile.extra}</ul>
              </div>

              <div className="mt-20">
                <h2 className="heading-5">Socials</h2>

                <h3 className="heading-6 font-bold">LinkedIn:</h3>
                <ul className="flex flex-col gap-y-1">{curProfile.linkedin}</ul>

                <h3 className="heading-6 font-bold">Twitter:</h3>
                <ul className="flex flex-col gap-y-1">{curProfile.twitter}</ul>

                <h3 className="heading-6 font-bold">Git:</h3>
                <ul className="flex flex-col gap-y-1">{curProfile.git}</ul>

                <h3 className="heading-6 font-bold">Personal Website:</h3>
                <ul className="flex flex-col gap-y-1">
                  {curProfile.personal_website}
                </ul>
              </div>
            </>
          )}

          {/*


        export type OnboardingSocialsFormData = {
        linkedin: string;
        twitter: string;
        git: string;
        personalWebsite: string;
      };


 */}
        </div>
      </section>
    </ReactLenis>
  );
}

export default CofoundrMatching;
