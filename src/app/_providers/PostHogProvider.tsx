'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { posthog, initPostHog } from '@/lib/posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && userId && user) {
      posthog.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      });
    }
  }, [isSignedIn, userId, user]);

  // Track page views
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

