export { sendWelcomeEmail } from "./emails/welcome";
export { sendProfileReminderEmail } from "./emails/profileReminder";
export type { ProfileReminderResult } from "./emails/profileReminder";
export { sendTemplateEmail } from "./send";
export { EMAIL_CATALOG } from "./catalog";
export type {
  EmailType,
  EmailVariablesByType,
  WelcomeEmailVariables,
  ProfileReminderEmailVariables,
} from "./catalog";
export type { SendResult } from "./send";
