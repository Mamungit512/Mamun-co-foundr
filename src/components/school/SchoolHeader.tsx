"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FaUsers, FaEnvelope, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import clsx from "clsx";
import type { OrgConfig } from "@/orgs/types";

type SchoolHeaderProps = {
  slug: string;
  schoolName: string;
  config: OrgConfig;
};

export default function SchoolHeader({ slug, schoolName, config }: SchoolHeaderProps) {
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
    <header
      className="flex items-center justify-between border-b border-black/10 px-6 py-3"
      style={{ backgroundColor: config.branding.backgroundColor, color: config.branding.textColor }}
    >
      <Link
        href={`/school/${slug}/dashboard`}
        className="flex items-center gap-3"
      >
        <Image
          src={config.branding.logoUrl}
          alt={config.branding.wordmark ?? schoolName}
          width={72}
          height={72}
          className="h-9 w-auto"
        />
        <span className="h-5 w-px bg-black/20" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight">
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
                ? "opacity-100 font-semibold"
                : "opacity-60 hover:opacity-90",
            )}
            style={
              pathname.startsWith(href)
                ? { color: config.branding.primaryColor }
                : undefined
            }
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
