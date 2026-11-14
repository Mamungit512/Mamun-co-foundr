export interface WelcomeEmailVariables {
  primaryColor: string;
  wordmark: string;
  ctaUrl: string;
}

export interface ProfileReminderEmailVariables {
  primaryColor: string;
  wordmark: string;
  firstName: string;
  ctaUrl: string;
}

export interface ReEngagementEmailVariables {
  firstName: string;
}

export interface WeeklyProfileViewsEmailVariables {
  primaryColor: string;
  wordmark: string;
  firstName: string;
  viewCount: number;
  ctaUrl: string;
}

export interface CofounderInviteEmailVariables {
  primaryColor: string;
  wordmark: string;
  inviterName: string;
  acceptUrl: string;
}

export interface CofounderLinkedEmailVariables {
  primaryColor: string;
  wordmark: string;
  linkedName: string;
  dashboardUrl: string;
}

export interface MessageNotificationEmailVariables {
  primaryColor: string;
  wordmark: string;
  recipientName: string;
  totalUnreadCount: string;
  messageWord: string;
  message1_sender: string;
  message1_preview: string;
  message2_sender: string;
  message2_preview: string;
  message3_sender: string;
  message3_preview: string;
  appUrl: string;
}

export interface MutualMatchEmailVariables {
  primaryColor: string;
  wordmark: string;
  schoolPill: string;
  recipientName: string;
  matchedName: string;
  matchedInitials: string;
  matchedTitle: string;
  matchedCity: string;
  matchedState: string;
  schoolStatusLabel: string;
  archetypeLabel: string;
  stageLabel: string;
  bio: string;
  interestsCsv: string;
  lookingFor: string;
  commitment: string;
  collegeLabel: string;
  degreeLabel: string;
  major: string;
  messageUrl: string;
}

/**
 * One template, three variants (proposed / accepted / declined). The hosted
 * template has no conditionals, so the variant is expressed through these
 * values. Every value is a string; user-derived values arrive HTML-escaped
 * because Resend substitutes {{{triple-brace}}} variables as raw HTML.
 * noteLabel and noteText are empty strings when there is no note to show.
 */
export interface MeetupEmailVariables {
  primaryColor: string;
  wordmark: string;
  heading: string;
  body: string;
  locationName: string;
  locationDetail: string;
  whenLabel: string;
  noteLabel: string;
  noteText: string;
  ctaLabel: string;
  ctaUrl: string;
}

/**
 * The hosted template hardcodes its colors, CTA and feedback form links, so
 * the only variable it takes is the recipient's first name.
 */
export interface UtAnnouncementEmailVariables {
  firstName: string;
}

export interface EmailVariablesByType {
  welcome: WelcomeEmailVariables;
  profileReminder: ProfileReminderEmailVariables;
  reEngagement: ReEngagementEmailVariables;
  weeklyProfileViews: WeeklyProfileViewsEmailVariables;
  cofounderInvite: CofounderInviteEmailVariables;
  cofounderLinked: CofounderLinkedEmailVariables;
  messageNotification: MessageNotificationEmailVariables;
  mutualMatch: MutualMatchEmailVariables;
  meetup: MeetupEmailVariables;
  utAnnouncement: UtAnnouncementEmailVariables;
}

export type EmailType = keyof EmailVariablesByType;

export const EMAIL_CATALOG: Record<EmailType, { templateId: string }> = {
  welcome: { templateId: "welcome-email-01-1" },
  profileReminder: { templateId: "profile-completion-03-1" },
  reEngagement: { templateId: "re-engagement-email-07-1" },
  weeklyProfileViews: { templateId: "weekly-profile-summary" },
  cofounderInvite: { templateId: "cofounder-invite-01" },
  cofounderLinked: { templateId: "cofounder-linked-01" },
  messageNotification: { templateId: "new-notification-design-trigger" },
  mutualMatch: { templateId: "we-match-mutual" },
  meetup: { templateId: "meetup-notification" },
  utAnnouncement: { templateId: "ut-new-feature-update-05" },
};

