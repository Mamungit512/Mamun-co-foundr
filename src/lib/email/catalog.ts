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

export interface EmailVariablesByType {
  welcome: WelcomeEmailVariables;
  profileReminder: ProfileReminderEmailVariables;
  reEngagement: ReEngagementEmailVariables;
  weeklyProfileViews: WeeklyProfileViewsEmailVariables;
}

export type EmailType = keyof EmailVariablesByType;

export const EMAIL_CATALOG: Record<EmailType, { templateId: string }> = {
  welcome: { templateId: "welcome-email-01-1" },
  profileReminder: { templateId: "profile-completion-03-1" },
  reEngagement: { templateId: "re-engagement-email-07-1" },
  weeklyProfileViews: { templateId: "weekly-profile-summary" },
};
