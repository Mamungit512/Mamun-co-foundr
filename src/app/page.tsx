"use client";

import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

/* ------
HOME PAGE

Page the user first sees when navigating to the root url of the site
------ */

function page() {
  return (
    <main className="flex flex-col items-center justify-center bg-(--charcoal-black) px-40 pt-12 pb-40 text-center text-(--mist-white)">
      {/* -- Hero Section -- */}
      <section>
        <div className="mb-8">
          <h1 className="heading-4 font-bold">MAMUN</h1>
          <p className="heading-6 lg:heading-5">Muslim Co-Foundr Matching</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="lg:heading-6 mb-8 px-1 font-semibold">
            <b>
              <i>Where Muslim founders find each other</i>
            </b>
          </p>

          <div className="relative grid w-56 grid-cols-2 sm:w-72 md:w-96">
            <Image
              className="ml-3 aspect-square rounded-full object-cover"
              src="/img/woman-profile.png"
              height={200}
              width={200}
              alt="Side profile of woman wearing a hijab"
            />

            <Image
              className="aspect-square rounded-full object-cover"
              src="/img/man-profile.png"
              height={200}
              width={200}
              alt="Side profile of a bearded man wearing a nike cap"
            />

            <Image
              className="z-50 -mt-3 ml-3 aspect-square rounded-full object-cover"
              src="/img/company-meeting.png"
              height={200}
              width={200}
              alt="Four people surrounding a table discussing work requirements"
            />

            <Image
              className="-mt-3 aspect-square rounded-full object-cover"
              src="/img/man-profile-2.png"
              height={200}
              width={200}
              alt="Side profile of man wearing kufi"
            />
          </div>

          <div className="relative mt-6">
            <div className="md:absolute md:left-20">
              <SignInButton>
                <button className="cursor-pointer">
                  <div className="translate-y flex cursor-pointer items-center rounded-md bg-(--mist-white) px-4 py-2 font-semibold text-nowrap text-(--charcoal-black) md:px-5 md:py-3">
                    <p>Login to Co-foundr Matching</p>
                    <div className="flex items-center">
                      <MdKeyboardArrowRight className="size-7" />
                    </div>
                  </div>
                </button>
              </SignInButton>

              <p className="mt-4 line-clamp-2 text-sm">
                (Actual founders who found their co-founders on Mamun)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -- Discover, Engage, Connect Section -- */}
      <section className="mt-50 flex flex-col gap-y-20 text-left">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="heading-5">Discover</h2>
            <p className="heading-6 text-gray-400">[01]</p>
          </div>

          <h3 className="heading-6 text-gray-400">Connect</h3>
          <p className="mt-2">
            Create a profile and tell us about yourself. Our matching engine
            shows you profiles that fit your preferences.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="heading-5">Engage</h2>
            <p className="heading-6 text-gray-400">[02]</p>
          </div>
          <h3 className="heading-6 text-gray-400">Match</h3>
          <p className="mt-2">
            If a profile piques your interest, invite them to connect. If they
            accept your invite, that&apos;s a match!
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="heading-5">Start</h2>
            <p className="heading-6 text-gray-400">[03]</p>
          </div>
          <h3 className="heading-6 text-gray-400">Conversation</h3>
          <p className="mt-2">
            Find a time to start the conversation. Let Mamun co-foundr help you
            connect with like-minded individuals.
          </p>
        </div>
      </section>
    </main>
  );
}

export default page;
