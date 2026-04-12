"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FaUsers, FaEnvelope, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import clsx from "clsx";

type SchoolHeaderProps = {
  slug: string;
  schoolName: string;
};

export default function SchoolHeader({ slug, schoolName }: SchoolHeaderProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const isSchoolAdmin = user?.publicMetadata?.is_school_admin === true;

  const navItems = [
    {
      href: `/school/${slug}/dashboard`,
      label: "Find Co-Founders",
      icon: FaUsers,
    },
    {
      href: `/school/${slug}/matches`,
      label: "Messages",
      icon: FaEnvelope,
    },
    {
      href: `/school/${slug}/profile`,
      label: "My Profile",
      icon: FaUserCircle,
    },
    ...(isSchoolAdmin
      ? [
          {
            href: `/school/${slug}/admin`,
            label: "Admin",
            icon: FaShieldAlt,
          },
        ]
      : []),
  ];

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-(--charcoal-black) px-6 py-3 text-(--mist-white)">
      {/* Brand lockup: Mamun logo + divider + school name */}
      <Link
        href={`/school/${slug}/dashboard`}
        className="flex items-center gap-3"
      >
        <Image
          src="/img/mamun-transparent-logo.png"
          alt="Mamun"
          width={72}
          height={72}
          className="h-9 w-auto"
        />
        <span className="h-5 w-px bg-white/20" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight text-white">
          {schoolName}
        </span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
