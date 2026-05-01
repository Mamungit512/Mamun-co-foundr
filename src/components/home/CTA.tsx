import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

function CTA() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white bg-(--charcoal-black) p-6 sm:p-10 md:p-12">
        <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Institution Only
        </h2>
        <p className="mb-8 text-gray-300 sm:text-lg">
          You have complete ownership of your domain and branding
        </p>
        <a
          href="https://forms.gle/u3tS9KUfNhdFFG489"
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center"
        >
          <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-yellow-300 px-6 py-3 font-semibold text-black">
            <p>Partner with us</p>
            <MdKeyboardArrowRight className="text-xl" />
          </button>
        </a>
      </div>
    </section>
  );
}

export default CTA;
