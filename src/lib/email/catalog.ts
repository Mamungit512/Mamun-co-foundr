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

export interface EmailVariablesByType {
  welcome: WelcomeEmailVariables;
  profileReminder: ProfileReminderEmailVariables;
  reEngagement: ReEngagementEmailVariables;
  weeklyProfileViews: WeeklyProfileViewsEmailVariables;
  cofounderInvite: CofounderInviteEmailVariables;
  cofounderLinked: CofounderLinkedEmailVariables;
  messageNotification: MessageNotificationEmailVariables;
  mutualMatch: MutualMatchEmailVariables;
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
};

