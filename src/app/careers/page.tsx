import ReactLenis from "lenis/react";
import React from "react";

function Careers() {
  return (
    <ReactLenis root>
      <section className="section-padding section-height flex flex-col items-center justify-center bg-(--charcoal-black) pt-8 pb-20 text-(--mist-white)">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            Careers
          </h1>
          <p className="text-lg text-gray-300 sm:text-xl md:text-2xl">
            No Job Listings Yet
          </p>
        </div>
      </section>
    </ReactLenis>
  );
}

export default Careers;
