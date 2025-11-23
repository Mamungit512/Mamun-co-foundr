import React from "react";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";

/* ------
Socials

A fixed box in the bottom left of the screen where users can find Mamun's social links
------ */

function Socials() {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-10 flex-col items-center gap-y-4 bg-(--charcoal-black) px-3 py-5">
      <a
        href="https://www.tiktok.com/@mamun.cofoundr?lang=en"
        target="_blank"
        rel="noopener noreferrer"
        className="translate-y transition-opacity hover:opacity-80"
      >
        <FaTiktok className="size-4 text-(--mist-white)" />
      </a>

      <a
        href="https://www.youtube.com/@RealTeslimDeen"
        target="_blank"
        rel="noopener noreferrer"
        className="translate-y transition-opacity hover:opacity-80"
      >
        <FaYoutube className="size-4 text-(--mist-white)" />
      </a>

      <a
        href="https://www.instagram.com/mamun.cofoundr/"
        target="_blank"
        rel="noopener noreferrer"
        className="translate-y transition-opacity hover:opacity-80"
      >
        <FaInstagram className="size-4 text-(--mist-white)" />
      </a>

      <a
        href="https://www.linkedin.com/company/mamunic/?viewAsMember=true"
        target="_blank"
        rel="noopener noreferrer"
        className="translate-y transition-opacity hover:opacity-80"
      >
        <FaLinkedin className="size-4 text-(--mist-white)" />
      </a>
    </div>
  );
}

export default Socials;
