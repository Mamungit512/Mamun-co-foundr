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

      <div className="mx-auto flex w-3/4 justify-center gap-x-12 rounded-2xl border-2 bg-(--mist-white) px-12 py-20">
        <div className="object-fit relative aspect-[3/4] w-72">
          <Image
            src="/img/bilal-hayat.png"
            alt="Bilal Hayat Profile"
            fill
            className="rounded-t-full object-cover"
          />
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
