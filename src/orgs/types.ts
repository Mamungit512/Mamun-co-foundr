export type OrgBranding = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  faviconUrl?: string;
  wordmark?: string;
};

export type OrgLanding = {
  headline: string;
  subheadline: string;
  heroImageUrl?: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
};

export type OrgConfig = {
  branding: OrgBranding;
  landing: OrgLanding;
};
