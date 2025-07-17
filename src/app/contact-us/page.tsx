import React from "react";
import FormInput from "@/components/ui/FormInput";

function ContactPage() {
  return (
    <section className="section-padding section-height bg-[var(--charcoal-black)] pt-8 pb-20 text-[var(--mist-white)]">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-2">
          <h2 className="heading-5">How Can We Help?</h2>
          <p className="text-white/70">
            We will usually reply within 1–3 business days, insha’Allah.
          </p>
        </div>

        <form className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput name="firstName" placeholder="First name" required />
            <FormInput name="lastName" placeholder="Last name" required />
          </div>

          <FormInput type="email" name="email" placeholder="Email" required />
          <input
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            style={{ display: "none" }}
          />

          <div>
            <label className="mb-3 block font-medium">
              How did you hear about us?
            </label>
            <div className="space-y-2">
              {["Friends", "Social Media", "Other"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="heardAboutUs"
                    value={option.toLowerCase()}
                    className="accent-white"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block font-medium">
              How can we help you?
            </label>
            <div className="space-y-2">
              {[
                "Account Security or Privacy Breach",
                "Matching Concerns or Errors",
                "Questions about the matching process",
                "Harassment or Code of Conduct Violations",
                "Mental Wellness or Burnout Support",
                "Other",
              ].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="helpTopics"
                    value={option.toLowerCase().replace(/\s+/g, "-")}
                    className="accent-white"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Message"
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-[var(--charcoal-black)] transition hover:bg-white/90"
          >
            Send Message
          </button>
        </form>
        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-white/60">
          <h3 className="mb-1 text-base font-medium text-white">
            Press & Collaboration
          </h3>
          <p className="mb-1">
            Include your organization name, media outlet, or event proposal.
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:Press@mamuncofoundr.com"
              className="underline hover:text-white"
            >
              mamun@mamuncofoundr.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
