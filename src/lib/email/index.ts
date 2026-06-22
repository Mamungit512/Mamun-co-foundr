export { sendWelcomeEmail } from "./emails/welcome";
export { sendProfileReminderEmail } from "./emails/profileReminder";
export type { ProfileReminderResult } from "./emails/profileReminder";
export { sendMessageNotificationEmail } from "./emails/messageNotification";
export { sendMutualMatchEmails } from "./emails/mutualMatch";
export { sendTemplateEmail } from "./send";
export { resolveTemplateId } from "./templateResolver";
export { EMAIL_CATALOG } from "./catalog";
export type {
  EmailType,
  EmailVariablesByType,
  WelcomeEmailVariables,
  ProfileReminderEmailVariables,
  MessageNotificationEmailVariables,
  MutualMatchEmailVariables,
} from "./catalog";
export type { SendResult } from "./send";
