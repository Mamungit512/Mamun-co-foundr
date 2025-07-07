import React from "react";
import { FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";

/* ------
Socials

A fixed box in the bottom left of the screen where users can find Mamun's social links
------ */

function Socials() {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-y-4 bg-(--mist-white) px-3 py-5">
      <a href="" className="translate-y">
        <FaTiktok className="size-4" />
      </a>

      <a href="" className="translate-y">
        <FaLinkedin className="size-4" />
      </a>

      <a href="" className="translate-y">
        <FaInstagram className="size-4" />
      </a>
    </div>
  );
}

export default Socials;
