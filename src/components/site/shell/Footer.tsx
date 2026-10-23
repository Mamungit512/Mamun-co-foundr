import Link from "next/link";

import { FOOTER, WORDMARK } from "@/content/site/shell";
import CorporateMark from "../marks/CorporateMark";
import NodeMark from "../marks/NodeMark";

// Spec §5.2: ink ground, three columns (1.2fr .6fr .6fr) from 1024px, two
// on tablets, one stacked column on phones — as the prototype draws it
// (spec §9.1 describes side-by-side link columns on phones; the prototype,
// which the build checklist gates on, stacks them). Column heads use
// dk-muted rather than the prototype's #66665C, which fails AA contrast on
// ink (§14).
export default function Footer() {
  return (
    <footer className="grid grid-cols-1 gap-40 border-t border-dark-rule bg-ink px-gutter pt-fluid-56 pb-footer md:grid-cols-2 lg:grid-cols-footer">
      <div className="flex flex-col gap-14">
        <span className="flex items-center gap-11 text-white type-wordmark">
          <CorporateMark />
          <span>{WORDMARK}</span>
        </span>
        <p className="max-w-tagline font-semibold text-white text-glow type-small">
          {FOOTER.tagline}
        </p>
        <p className="font-semibold text-white text-glow type-small">{FOOTER.location}</p>
      </div>

      {FOOTER.columns.map((column) => (
        <nav
          key={column.heading}
          aria-label={column.heading}
          className="flex flex-col items-start gap-10"
        >
          <h2 className="text-dk-muted type-eyebrow-sm">{column.heading}</h2>
          {column.links.map((link) => {
            const classes =
              "inline-flex min-h-44 items-center gap-8 text-dk-link type-link-sm lg:min-h-0";
            const content = (
              <>
                {"nodeMark" in link && link.nodeMark && <NodeMark size={16} />}
                <span>{link.label}</span>
              </>
            );
            return "external" in link && link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener"
                data-cta="footer"
                className={classes}
              >
                {content}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className={classes}>
                {content}
              </Link>
            );
          })}
        </nav>
      ))}
    </footer>
  );
}
