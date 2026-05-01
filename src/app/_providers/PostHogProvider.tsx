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

  // School users have organization_id in publicMetadata. Per FERPA requirements,
  // we must not send their PII to third-party analytics services.
  const isSchoolUser = Boolean(
    user?.publicMetadata?.organization_id,
  );

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when signed in — suppressed for school users (FERPA)
  useEffect(() => {
    if (isSignedIn && userId && user && !isSchoolUser) {
      posthog.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      });
    }
  }, [isSignedIn, userId, user, isSchoolUser]);

  // Track page views — suppressed for school users (FERPA)
  useEffect(() => {
    if (pathname && !isSchoolUser) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, isSchoolUser]);

  return <>{children}</>;
}

