/**
 * PostHog Event Tracking Utilities
 * Centralized event tracking functions for consistency and type safety
 */

import { posthog } from "./posthog";

export const trackEvent = {
  /**
   * Track user login
   */
  login: (userId: string, properties?: Record<string, unknown>) => {
    posthog.capture("user_login", {
      user_id: userId,
      ...properties,
    });
  },

  /**
   * Track profile view
   */
  profileViewed: (
    targetUserId: string,
    fromPage?: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture("profile_viewed", {
      target_user_id: targetUserId,
      from_page: fromPage || "unknown",
      ...properties,
    });
  },

  /**
   * Track profile like
   */
  profileLiked: (
    targetUserId: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture("profile_liked", {
      target_user_id: targetUserId,
      ...properties,
    });
  },

  /**
   * Track profile skip
   */
  profileSkipped: (
    targetUserId: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture("profile_skipped", {
      target_user_id: targetUserId,
      ...properties,
    });
  },

  /**
   * Track mutual match created
   */
  mutualMatchCreated: (
    matchedUserId: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture("mutual_match_created", {
      matched_profile_id: matchedUserId,
      ...properties,
    });
  },

  /**
   * Track swipe limit reached
   */
  swipeLimitReached: (properties: {
    current_count: number;
    limit: number;
    action_attempted: string;
  }) => {
    posthog.capture("swipe_limit_reached", properties);
  },

  /**
   * Track conversation started
   */
  conversationStarted: (
    conversationId: string,
    otherUserId: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture("conversation_started", {
      conversation_id: conversationId,
      other_user_id: otherUserId,
      ...properties,
    });
  },

  /**
   * Track message sent
   */
  messageSent: (
    conversationId: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture("message_sent", {
      conversation_id: conversationId,
      ...properties,
    });
  },

  /**
   * Track onboarding completed
   */
  onboardingCompleted: (properties: Record<string, unknown>) => {
    posthog.capture("onboarding_completed", properties);
  },

  /**
   * Track profile updated
   */
  profileUpdated: (properties: Record<string, unknown>) => {
    posthog.capture("profile_updated", properties);
  },

  /**
   * Track profile photo uploaded
   */
  profilePhotoUploaded: (properties: {
    file_size: number;
    file_type: string;
  }) => {
    posthog.capture("profile_photo_uploaded", properties);
  },

  /**
   * Track signup page viewed
   */
  signupPageViewed: (properties?: Record<string, unknown>) => {
    posthog.capture("signup_page_viewed", properties);
  },

  /**
   * Track referral invite landing
   */
  referralInviteLanding: (properties: Record<string, unknown>) => {
    posthog.capture("referral_invite_landing", properties);
  },

  /**
   * Track referral link shared
   */
  referralLinkShared: (properties: Record<string, unknown>) => {
    posthog.capture("referral_link_shared", properties);
  },

  /**
   * Track newsletter CTA clicked
   */
  newsletterCtaClicked: (properties: {
    source: string;
    destination_url: string;
  }) => {
    posthog.capture("newsletter_cta_clicked", properties);
  },

  /**
   * Track plan page continued
   */
  planPageContinued: (properties: {
    user_id?: string;
    has_profile: boolean;
  }) => {
    posthog.capture("plan_page_continued", properties);
  },

  /**
   * Track upgrade page viewed
   */
  upgradePageViewed: (properties?: Record<string, unknown>) => {
    posthog.capture("viewed_upgrade_page", properties);
  },

  /**
   * Track account deleted
   */
  accountDeleted: (userId: string, properties?: Record<string, unknown>) => {
    posthog.capture("account_deleted", {
      user_id: userId,
      ...properties,
    });
  },
};
