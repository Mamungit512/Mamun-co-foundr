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
    <section className="flex flex-col items-center justify-center bg-(--charcoal-black) px-40 pt-20 pb-40 text-center text-(--mist-white)">
      <div className="mb-10">
        <h1 className="text-7xl">MAMUN</h1>
        <p className="text-4xl">Muslim Co-Foundr Matching</p>
      </div>

      <div className="flex flex-col items-center">
        <p className="mb-8 px-1 text-2xl font-bold">
          <b>
            <i>Where Muslim founders find each other</i>
          </b>
        </p>

        <div className="relative grid w-96 grid-cols-2">
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
          <div className="absolute left-20">
            <SignInButton>
              <button className="cursor-pointer">
                <div className="translate-y flex cursor-pointer items-center rounded-md bg-(--mist-white) px-5 py-3 font-semibold text-nowrap text-(--charcoal-black)">
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
  );
}

export default page;
