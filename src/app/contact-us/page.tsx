import React from "react";

function page() {
  return (
    <section className="section-padding section-height bg-(--charcoal-black) pt-8 pb-20 text-(--mist-white)">
      <div className="flex items-center justify-between">
        <h2 className="heading-5">How Can We Help?</h2>
        <p>We will usually reply within 1-3 business days, insha’Allah.</p>
      </div>

      <form className="space-y-8">
        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          />
        </div>

        {/* How did you hear about us */}
        <div>
          <p className="mb-2">How did you hear about us?</p>
          <div className="space-y-2">
            {["Friends", "Social Media", "Other"].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={option.toLowerCase()}
                  className="h-4 w-4 accent-white"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* How can we help you */}
        <div>
          <p className="mb-2">How can we help you?</p>
          <div className="space-y-2">
            {[
              "Account Security or Privacy Breach",
              "Matching Concerns or Errors",
              "Questions about the matching process",
              "Harassment or Code of Conduct Violations",
              "Mental Wellness or Burnout Support",
              "Other",
            ].map((option) => (
              <label key={option} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  value={option.toLowerCase()}
                  className="mt-1 h-4 w-4 accent-white"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1 block" htmlFor="message">
            Tell Us More
          </label>
          <textarea
            id="message"
            placeholder="Message"
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-[--charcoal-black] transition hover:bg-white/90"
          >
            Send Message
          </button>
        </div>
      </form>
    </section>
  );
}

export default page;
