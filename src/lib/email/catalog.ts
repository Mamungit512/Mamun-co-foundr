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

export interface EmailVariablesByType {
  welcome: WelcomeEmailVariables;
  profileReminder: ProfileReminderEmailVariables;
}

export type EmailType = keyof EmailVariablesByType;

export const EMAIL_CATALOG: Record<EmailType, { templateId: string }> = {
  welcome: { templateId: "welcome-email-01-1" },
  profileReminder: { templateId: "profile-completion-03-1" },
};
