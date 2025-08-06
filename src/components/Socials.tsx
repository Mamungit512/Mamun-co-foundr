import React from "react";
import { FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";

/* ------
Socials

A fixed box in the bottom left of the screen where users can find Mamun's social links
------ */

function Socials() {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-10 flex-col items-center gap-y-4 bg-(--charcoal-black) px-3 py-5">
      <a href="" className="translate-y">
        <FaTiktok className="size-4 text-(--mist-white)" />
      </a>

      <a href="" className="translate-y">
        <FaInstagram className="size-4 text-(--mist-white)" />
      </a>

      <a href="" className="translate-y">
        <FaLinkedin className="size-4 text-(--mist-white)" />
      </a>
    </div>
  );
}

export default Socials;
