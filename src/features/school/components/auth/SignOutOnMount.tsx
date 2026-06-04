"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

type Props = {
  redirectUrl: string;
};

export default function SignOutRedirect({ redirectUrl }: Props) {
  const { signOut } = useClerk();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    signOut({ redirectUrl }).catch(() => {});
  }, [signOut, redirectUrl]);

  return null;
}
