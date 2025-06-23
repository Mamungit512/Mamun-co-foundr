import Image from "next/image";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";

function Header() {
  return (
    <div className="section-padding flex items-center justify-between bg-(--yellow)">
      <a href="#">
        <Image
          src="/img/Mamun Logo.png"
          width={130}
          height={100}
          alt="Mamun Logo. Circle with a line through it next to Mamun in all capital letters"
        />
      </a>

      <div>
        <ul className="flex items-center justify-between gap-x-6">
          <li className="translate-y font-semibold">
            <a href="#">Juma&apos;ah</a>
          </li>
          <li className="translate-y font-semibold">
            <a href="#">Co-Foundr Matching</a>
          </li>
          <li className="translate-y font-semibold">
            <a href="#">Startup Jobs</a>
          </li>
          <li className="translate-y font-semibold">
            <a href="#">Mission</a>
          </li>

          <li>
            <button className="flex cursor-pointer items-center gap-x-2">
              <FaRegCircleUser className="size-8" />
              <IoIosArrowDown />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Header;
