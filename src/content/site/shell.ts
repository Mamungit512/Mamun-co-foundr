// Copy for the global shell (header, drawer, footer). Final copy — do not
// rewrite. Source: Main.dc.html in the Mamun Studio II design canvas;
// "Partner with Us" in the nav and footer per PR review (replaces the
// footer's "Security & FERPA").

export const CALENDLY_URL = "https://calendly.com/mcfm-mamuncofoundr/30min";

export const BOOK_A_DEMO = "Book a demo";

export const WORDMARK = "MAMUN";

export type NavItem = {
  href: string;
  label: string;
  /** Label used in the mobile drawer, where it differs from the bar. */
  drawerLabel?: string;
  /** Shows the matching node mark beside the label. */
  nodeMark?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/matching",
    label: "Matching",
    drawerLabel: "Co-founder matching",
    nodeMark: true,
  },
  { href: "/platform", label: "Inside the platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/partner", label: "Partner with Us" },
];

export const FOOTER = {
  tagline: "Moving Education Forward",
  location: "Austin, Texas",
  columns: [
    {
      heading: "Platform",
      links: [
        { href: "/matching", label: "Co-founder matching", nodeMark: true },
        { href: "/platform", label: "Inside the platform" },
        { href: "/pricing", label: "Pricing" },
      ],
    },
    {
      heading: "Institutions",
      links: [
        { href: CALENDLY_URL, label: BOOK_A_DEMO, external: true },
        { href: "/partner", label: "Partner with Us" },
      ],
    },
  ],
} as const;
