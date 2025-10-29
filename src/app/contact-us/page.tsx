"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";
import ReactLenis from "lenis/react";
import { useForm } from "react-hook-form";

type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  helpTopics: string[];
  heardAboutUs: string[];
};

function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful, isSubmitted },
    reset,
  } = useForm<ContactFormValues>();

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send contact us message");

      reset();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <ReactLenis root>
      <section className="section-padding section-height bg-[var(--charcoal-black)] pt-6 pb-16 text-[var(--mist-white)] sm:pt-8 sm:pb-20">
        <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              How Can We Help?
            </h2>
            <p className="text-sm text-white/70 sm:text-base md:text-lg">
              We will usually reply within 1–3 business days, insha&apos;Allah.
            </p>
          </div>

          <form
            className="space-y-6 sm:space-y-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <FormInput
                {...register("firstName", {
                  required: "First name is required",
                })}
                placeholder="First name"
              />
              <FormInput
                {...register("lastName", { required: "Last name is required" })}
                placeholder="Last name"
              />
            </div>

            <FormInput
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
            />
            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              style={{ display: "none" }}
            />

            <div>
              <textarea
                {...register("message", { required: "Message is required" })}
                placeholder="Message"
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium sm:text-base">
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
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      {...register("helpTopics")}
                      value={option.toLowerCase().replace(/\s+/g, "-")}
                      className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-[var(--charcoal-black)] checked:bg-white focus:ring-2 focus:ring-white/30 focus:ring-offset-0"
                    />
                    <span className="text-sm sm:text-base">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium sm:text-base">
                How did you hear about us?
              </label>
              <div className="space-y-2">
                {["Friends", "Social Media", "Other"].map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      {...register("heardAboutUs")}
                      value={option.toLowerCase()}
                      className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-[var(--charcoal-black)] checked:bg-white focus:ring-2 focus:ring-white/30 focus:ring-offset-0"
                    />
                    <span className="text-sm sm:text-base">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full cursor-pointer rounded-xl bg-white px-4 py-3 text-sm font-medium text-[var(--charcoal-black)] transition hover:bg-white/90 sm:w-auto sm:px-6 sm:text-base"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {/* Status Messages */}
            {isSubmitted && isSubmitSuccessful && (
              <p className="text-green-400">Message sent successfully!</p>
            )}
            {isSubmitted && !isSubmitSuccessful && (
              <p className="text-red-400">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
          <div className="mt-8 border-t border-white/10 pt-6 text-center sm:mt-12 sm:pt-8 sm:text-left">
            <h3 className="mb-2 text-sm font-medium text-white sm:text-base">
              Press & Collaboration
            </h3>
            <p className="mb-2 text-xs text-white/60 sm:text-sm">
              Include your organization name, media outlet, or event proposal.
            </p>
            <p className="text-xs text-white/60 sm:text-sm">
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
    </ReactLenis>
  );
}

export default ContactPage;
