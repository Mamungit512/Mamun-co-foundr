"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "s1",  title: "1. Who We Are" },
  { id: "s2",  title: "2. Scope" },
  { id: "s3",  title: "3. FERPA Framework" },
  { id: "s4",  title: "4. Data We Collect" },
  { id: "s5",  title: "5. Consent Mechanism" },
  { id: "s6",  title: "6. How We Use Data" },
  { id: "s7",  title: "7. Data Sharing" },
  { id: "s8",  title: "8. Student Rights" },
  { id: "s9",  title: "9. Data Retention" },
  { id: "s10", title: "10. Data Security" },
  { id: "s11", title: "11. University Partners" },
  { id: "s12", title: "12. Research & IRB" },
  { id: "s13", title: "13. COPPA" },
  { id: "s14", title: "14. State Privacy Laws" },
  { id: "s15", title: "15. Cookies & Tracking" },
  { id: "s16", title: "16. International Students" },
  { id: "s17", title: "17. Dispute Resolution" },
  { id: "s18", title: "18. Governing Law" },
  { id: "s19", title: "19. Account Termination" },
  { id: "s20", title: "20. Business Transitions" },
  { id: "s21", title: "21. Limitation of Liability" },
  { id: "s22", title: "22. User Conduct" },
  { id: "s23", title: "23. Accessibility" },
  { id: "s24", title: "24. Glossary" },
  { id: "s25", title: "25. Policy Changes" },
  { id: "s26", title: "26. Contact & Complaints" },
] as const;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function PrivacyPolicyDesktopTOC({ primaryColor }: { primaryColor: string }) {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-5% 0px -70% 0px", threshold: 0 },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Policy table of contents">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Contents
      </p>
      <ul className="space-y-0.5">
        {SECTIONS.map(({ id, title }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={`w-full rounded px-2 py-1 text-left text-xs transition-colors hover:text-gray-900 ${
                  isActive ? "font-semibold" : "text-gray-500"
                }`}
                style={
                  isActive
                    ? { color: primaryColor, backgroundColor: `${primaryColor}18` }
                    : undefined
                }
              >
                {title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PrivacyPolicyMobileTOC({ primaryColor }: { primaryColor: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
        style={{ color: primaryColor }}
        aria-expanded={open}
      >
        <span>Jump to section</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="divide-y divide-gray-100 border-t border-gray-200">
          {SECTIONS.map(({ id, title }) => (
            <li key={id}>
              <button
                onClick={() => {
                  setOpen(false);
                  scrollTo(id);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
