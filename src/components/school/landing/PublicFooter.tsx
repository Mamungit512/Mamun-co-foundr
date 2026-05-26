import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer
      className="px-6 py-12"
      style={{ backgroundColor: "#333f48" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <div className="mb-1 text-sm font-semibold text-white">
              Texas McCombs Co-Foundr
            </div>
            <div className="text-xs" style={{ color: "#9cadb7" }}>
              Co-Foundr Matching Platform
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Resources
              </div>
              <a
                href="https://lu.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1.5 block text-xs hover:text-white"
                style={{ color: "#9cadb7" }}
              >
                UT Luma Events
              </a>
              <a
                href="https://www.cakeequity.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs hover:text-white"
                style={{ color: "#9cadb7" }}
              >
                Create a Cap Table
              </a>
            </div>
            <div>
              <div
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Company
              </div>
              <Link
                href="/privacy-policy"
                className="mb-1.5 block text-xs hover:text-white"
                style={{ color: "#9cadb7" }}
              >
                Privacy Policy
              </Link>
              <a
                href="https://www.mccombs.utexas.edu/about/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs hover:text-white"
                style={{ color: "#9cadb7" }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        <div
          className="border-t pt-5 text-xs"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          © 2026 Texas McCombs Co-Foundr. Powered by Mamun. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
