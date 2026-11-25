import { sendTemplateEmail } from "../send";
import { resolveOrgBranding } from "../branding";
import { getOrgAppUrl } from "../client";

export async function sendCofounderInviteEmail({
  to,
  inviterName,
  slug,
  token,
}: {
  to: string;
  inviterName: string;
  slug: string;
  token: string;
}) {
  const branding = resolveOrgBranding(slug);
  const acceptUrl = `${getOrgAppUrl(slug)}/invite/${token}`;

  return sendTemplateEmail({
    type: "cofounderInvite",
    to,
    variables: {
      primaryColor: branding.primaryColor,
      wordmark: branding.wordmark,
      inviterName,
      acceptUrl,
    },
  });
}

export async function sendCofounderLinkedEmail({
  to,
  linkedName,
  slug,
}: {
  to: string;
  linkedName: string;
  slug: string;
}) {
  const branding = resolveOrgBranding(slug);
  const dashboardUrl = `${getOrgAppUrl(slug)}/dashboard`;

  return sendTemplateEmail({
    type: "cofounderLinked",
    to,
    variables: {
      primaryColor: branding.primaryColor,
      wordmark: branding.wordmark,
      linkedName,
      dashboardUrl,
    },
  });
}
