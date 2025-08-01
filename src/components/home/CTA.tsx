import { SignUpButton } from "@clerk/nextjs";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

function CTA() {
  return (
    <section className="mt-40 mb-20 flex flex-col items-center">
      <h2 className="heading-5 mb-2">Ready to Find Your Co-Foundr?</h2>
      <p>
        Join a global community of builders, dreamers, and doers. Your ummatic
        journey starts here.
      </p>
      <SignUpButton>
        <button className="translate-y mt-10 flex cursor-pointer items-center rounded-md bg-(--mist-white) px-4 py-2 font-semibold text-nowrap text-(--charcoal-black) md:px-5 md:py-3">
          <p>Sign Up Today</p>
          <div className="flex items-center">
            <MdKeyboardArrowRight className="size-7" />
          </div>
        </button>
      </SignUpButton>
    </section>
  );
}

export default CTA;
