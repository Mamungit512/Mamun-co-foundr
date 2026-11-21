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
 * Meetup emails: one hosted template per variant. Every value is a string;
 * user-derived values arrive HTML-escaped because Resend substitutes
 * {{{triple-brace}}} variables as raw HTML.
 *
 * The proposal carries the note, so its template has note rows. noteLabel and
 * note are empty strings when there is no note to show.
 */
export interface MeetupProposedEmailVariables {
  eyebrow: string;
  kicker: string;
  headline: string;
  firstName: string;
  message: string;
  locationName: string;
  locationBuilding: string;
  meetupTime: string;
  noteLabel: string;
  note: string;
  ctaLabel: string;
  ctaUrl: string;
}

/**
 * The accepted and declined templates hardcode their headline, copy and
 * button label, and have no note. matchName is the other student's first name.
 */
export interface MeetupResponseEmailVariables {
  firstName: string;
  matchName: string;
  locationName: string;
  locationBuilding: string;
  meetupTime: string;
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
  meetupProposed: MeetupProposedEmailVariables;
  meetupAccepted: MeetupResponseEmailVariables;
  meetupDeclined: MeetupResponseEmailVariables;
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
  meetupProposed: { templateId: "meetup-proposed" },
  meetupAccepted: { templateId: "meetup-accepted" },
  meetupDeclined: { templateId: "meetup-declined" },
  utAnnouncement: { templateId: "ut-new-feature-update-05" },
};

