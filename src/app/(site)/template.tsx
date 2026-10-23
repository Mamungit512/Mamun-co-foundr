// Re-mounts on every navigation, so the page-enter animation plays on each
// route change (spec §8.2). The header and footer live in the layout and
// don't animate.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div data-page="">{children}</div>;
}
