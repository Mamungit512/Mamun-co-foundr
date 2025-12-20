/**
 * PostHog Event Tracking Utilities
 * Centralized event tracking functions for consistency
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
  profileViewed: (targetUserId: string, fromPage?: string) => {
    posthog.capture("profile_viewed", {
      target_user_id: targetUserId,
      from_page: fromPage || "unknown",
    });
  },

  /**
   * Track profile like/match
   */
  profileLiked: (targetUserId: string) => {
    posthog.capture("profile_liked", {
      target_user_id: targetUserId,
    });
  },

  /**
   * Track profile skip
   */
  profileSkipped: (targetUserId: string) => {
    posthog.capture("profile_skipped", {
      target_user_id: targetUserId,
    });
  },

  /**
   * Track message sent
   */
  messageSent: (conversationId: string, recipientId: string) => {
    posthog.capture("message_sent", {
      conversation_id: conversationId,
      recipient_id: recipientId,
    });
  },

  /**
   * Track match made (mutual like)
   */
  matchMade: (user1Id: string, user2Id: string) => {
    posthog.capture("match_made", {
      user1_id: user1Id,
      user2_id: user2Id,
    });
  },

  /**
   * Track profile completion
   */
  profileCompleted: (userId: string) => {
    posthog.capture("profile_completed", {
      user_id: userId,
    });
  },
};
