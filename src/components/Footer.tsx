import Image from "next/image";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="flex w-full items-center justify-center gap-x-4 bg-(--charcoal-black) pt-16 pb-30 text-(--mist-white)">
      <a
        href=""
        className="translate-y hover:underline hover:underline-offset-4"
      >
        {" "}
        Careers
      </a>
      <Link href="/">
        <Image
          src="/img/Mamun Logo.png"
          width={100}
          height={100}
          className="translate-y"
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
        />
      </Link>
      <a
        href="mailto:mamun@mamuncofoundr.com"
        className="translate-y hover:underline hover:underline-offset-4"
      >
        Contact Us
      </a>
    </footer>
  );
}

export default Footer;
