import { resolveOrgBranding } from "../branding";
import { sendTemplateEmail } from "../send";
import { updateLastEmailSent } from "@/lib/emailBatching";

type UnreadMessage = {
  senderName: string;
  messagePreview: string;
};

export async function sendMessageNotificationEmail({
  recipientId,
  email,
  orgSlug,
  recipientName,
  unreadMessages,
  appUrl,
}: {
  recipientId: string;
  email: string;
  orgSlug?: string | null;
  recipientName: string;
  unreadMessages: UnreadMessage[];
  appUrl: string;
}): Promise<void> {
  const { primaryColor, wordmark } = resolveOrgBranding(orgSlug);

  const totalUnreadCount = unreadMessages.length;
  const messageWord = totalUnreadCount === 1 ? "message" : "messages";

  const slot = (i: number) => ({
    sender: unreadMessages[i]?.senderName ?? "",
    preview: unreadMessages[i]?.messagePreview ?? "",
  });
  const [s1, s2, s3] = [slot(0), slot(1), slot(2)];

  const result = await sendTemplateEmail({
    type: "messageNotification",
    to: email,
    orgSlug,
    variables: {
      primaryColor,
      wordmark,
      recipientName,
      totalUnreadCount: String(totalUnreadCount),
      messageWord,
      message1_sender: s1.sender,
      message1_preview: s1.preview,
      message2_sender: s2.sender,
      message2_preview: s2.preview,
      message3_sender: s3.sender,
      message3_preview: s3.preview,
      appUrl,
    },
  });

  if (result.ok) {
    await updateLastEmailSent(recipientId);
  }
}
