type Props = {
  primaryColor: string;
};

export default function UTTermsAndConditions({ primaryColor }: Props) {
  const h2 = { color: primaryColor };

  return (
    <div className="space-y-8 text-sm leading-relaxed text-gray-800">
      <div>
        <p><strong>Effective Date:</strong> June 15, 2026</p>
        <p><strong>Last Revised:</strong> June 15, 2026</p>
        <p><strong>Version:</strong> 1.0</p>
      </div>

      {/* 1 */}
      <section id="t1">
        <h2 className="mb-3 text-xl font-bold" style={h2}>1. Acceptance of These Terms</h2>
        <p>
          By creating a profile or otherwise using the Mamun Co-Foundr platform (&quot;Mamun,&quot; &quot;the
          platform,&quot; &quot;the Service&quot;), you agree to these Terms. If you do not agree, do not use the
          Service. Your use of the Service is also subject to our Privacy Policy, which is incorporated
          by reference.
        </p>
      </section>

      {/* 2 */}
      <section id="t2">
        <h2 className="mb-3 text-xl font-bold" style={h2}>2. Eligibility</h2>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>You must be <strong>at least 18 years old</strong> to create an account.</li>
          <li>
            You must be a <strong>currently enrolled student</strong> at a university that partners
            with Mamun, and you access the Service through that university-sponsored program.
          </li>
          <li>The Service is not directed to, and does not knowingly serve, anyone under 17.</li>
          <li>
            This edition of the Terms applies to <strong>university-sponsored student users</strong>.
            Direct-to-consumer users who register independently outside a university program are
            governed by a separate consumer agreement.
          </li>
        </ul>
      </section>

      {/* 3 */}
      <section id="t3">
        <h2 className="mb-3 text-xl font-bold" style={h2}>3. The Service and How Matching Works</h2>
        <p>
          Mamun helps student entrepreneurs discover mission-aligned co-founders within their
          university cohort. To avoid the most common misunderstanding about the Service:
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>
            Match recommendations are <strong>generated algorithmically</strong> based on the values,
            skills, interests, and workstyle indicators you provide.
          </li>
          <li>
            Recommendations are <strong>advisory only</strong>. They are suggestions, not decisions.{" "}
            <strong>No match produces a binding or legally significant outcome.</strong> A connection
            only forms when <strong>both</strong> students affirmatively accept it (bilateral consent).
          </li>
          <li>
            Mamun does <strong>not guarantee</strong> that you will receive a match, that any match
            will be suitable, or that any co-founder relationship will succeed.
          </li>
          <li>
            You may opt out of algorithmic matching at any time by deactivating your profile, and you
            may request a plain-language explanation of why a specific match was recommended.
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section id="t4">
        <h2 className="mb-3 text-xl font-bold" style={h2}>4. Your Account and Information Accuracy</h2>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>
            All profile information is <strong>self-reported by you</strong>. You agree to provide
            accurate information and to keep it current.
          </li>
          <li>
            You are responsible for activity that occurs under your account and for maintaining the
            confidentiality of your login credentials.
          </li>
          <li>
            Mamun does not pull data from university systems and does not collect academic records
            (grades, GPA, transcripts, disciplinary, financial aid, or immigration status). See the
            Privacy Policy for details.
          </li>
        </ul>
      </section>

      {/* 5 */}
      <section id="t5">
        <h2 className="mb-3 text-xl font-bold" style={h2}>5. Consent, Withdrawal, and Deletion — Three Different Things</h2>
        <p className="mb-3">
          This is the distinction users most often get wrong, so we state it plainly:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Action</th>
                <th className="p-3 text-left font-semibold">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Giving consent</td>
                <td className="p-3">
                  You actively agree, during onboarding, to the collection and use of your profile
                  data for co-founder matching. No data is collected before you do this.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Withdrawing consent</td>
                <td className="p-3">
                  We immediately stop processing your data for matching and deactivate your profile.
                  This is not the same as deletion — compliance and consent records are retained as
                  required by law.
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Requesting deletion</td>
                <td className="p-3">
                  We delete your profile, match history, and connection records within 30 days
                  (limited legal and consent records excepted).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          You can do these separately or together. Withdrawing consent alone does{" "}
          <strong>not</strong> delete your data; deletion requires a separate request.
        </p>
      </section>

      {/* 6 */}
      <section id="t6">
        <h2 className="mb-3 text-xl font-bold" style={h2}>6. Acceptable Use and Conduct</h2>
        <p>You agree that you will <strong>not</strong>:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Harass, threaten, defraud, or impersonate any other user.</li>
          <li>
            Screenshot, redistribute, scrape, or publish another student&apos;s profile data,
            messages, or contact information without that student&apos;s consent.
          </li>
          <li>Attempt unauthorized access to the platform, other accounts, or our systems.</li>
          <li>
            Use the Service for any purpose other than good-faith co-founder discovery, or in any
            way that violates your university&apos;s policies or applicable law.
          </li>
        </ul>
        <p className="mt-3">
          Violations may result in suspension or termination of your account under Section 8.
        </p>
      </section>

      {/* 7 */}
      <section id="t7">
        <h2 className="mb-3 text-xl font-bold" style={h2}>7. Co-Founder Connections and Off-Platform Activity</h2>
        <p>
          Co-founder matching is, by nature, an introduction service. Please understand the
          boundaries of our role:
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>
            Once two students accept a connection, they may exchange contact information and continue
            the relationship off-platform. At that point you are <strong>independent parties</strong>{" "}
            interacting voluntarily.
          </li>
          <li>
            Mamun does <strong>not</strong> vet, background-check, verify, endorse, or guarantee any
            user, nor the truthfulness of any information a user provides.
          </li>
          <li>
            <strong>Mamun is not responsible or liable for any activity conducted outside the
            platform.</strong> This includes any in-person meeting, off-platform communication,
            agreement, partnership, venture, financial arrangement, or any resulting loss, dispute,
            or harm — whether between users or between a user and any third party. Once you connect
            or interact off-platform, you do so entirely at your own risk.
          </li>
          <li>
            You are solely responsible for your own due diligence and for any decision to meet,
            partner with, or do business with another user.
          </li>
          <li>
            Mamun is not responsible for how another user treats information you share with them
            after a connection is made, and cannot compel the return or deletion of data already in
            another party&apos;s possession. You may report misuse to us and we will investigate.
          </li>
        </ul>
      </section>

      {/* 8 */}
      <section id="t8">
        <h2 className="mb-3 text-xl font-bold" style={h2}>8. Account Termination</h2>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>By you</h3>
        <p>
          You may terminate your account at any time through your profile settings or by emailing
          us. The consent-withdrawal and deletion process in Section 5 then applies.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>By Mamun (for cause)</h3>
        <p>
          We may terminate an account for material violation of these Terms (e.g., harassment,
          fraud, impersonation, attempted unauthorized access). In that case you receive written
          notice with the reason and a 14-day appeal window; the account is suspended pending
          appeal; and following final termination, data is deleted within 30 days except records
          required for fraud prevention, legal compliance, or pending investigations.{" "}
          <strong>
            We do not terminate accounts based on a user&apos;s values, beliefs, or protected
            characteristics.
          </strong>
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>If your university&apos;s partnership ends</h3>
        <p>
          Your profile is frozen and removed from active cohorts. You&apos;ll be notified within 7
          days and offered the option to export your data or request deletion — whether your account
          is ending because a university partnership has concluded or through your own personal
          request. Data is retained for 90 days to let you choose, then deleted unless you&apos;ve
          elected an alternative.
        </p>
      </section>

      {/* 9 */}
      <section id="t9">
        <h2 className="mb-3 text-xl font-bold" style={h2}>9. Intellectual Property and Content</h2>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>
            You retain ownership of the profile content you submit. By submitting it, you grant
            Mamun a limited license to host, display, and process that content solely to operate
            the matching Service.
          </li>
          <li>
            The Mamun platform, software, branding, and matching system are the property of Mamun
            Co-Foundr and may not be copied, reverse-engineered, or reused without permission.
          </li>
        </ul>
      </section>

      {/* 10 */}
      <section id="t10">
        <h2 className="mb-3 text-xl font-bold" style={h2}>10. Disclaimers</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available.&quot; To the maximum extent permitted by
          law, Mamun disclaims warranties of any kind regarding the Service, including any warranty
          that the Service will be uninterrupted, error-free, or that any match or connection will
          meet your expectations. Mamun makes no representation about the identity, conduct, or
          suitability of any user.
        </p>
      </section>

      {/* 11 */}
      <section id="t11">
        <h2 className="mb-3 text-xl font-bold" style={h2}>11. Limitation of Liability and Force Majeure</h2>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>
            <strong>Off-platform activity:</strong> As stated in Section 7, Mamun is not liable for
            any activity, conduct, agreement, or harm occurring outside the platform.
          </li>
          <li>
            <strong>Force majeure:</strong> Mamun is not liable for failure or delay caused by
            circumstances beyond its reasonable control (natural disasters, war, government action,
            infrastructure or subprocessor outages, pandemics, etc.). We will give notice, mitigate,
            and resume normal operations as soon as practicable.
          </li>
          <li>
            <strong>Limitation:</strong> To the maximum extent permitted by law — and except for
            breaches of FERPA, COPPA, or other statutory obligations — Mamun&apos;s liability for
            any claim under these Terms is limited to direct damages and excludes indirect,
            consequential, incidental, special, or punitive damages.
          </li>
          <li>
            <strong>No waiver of statutory rights:</strong> Nothing here limits your statutory rights
            under FERPA, COPPA, CCPA, TDPSA, VCDPA, or other applicable law.
          </li>
        </ul>
      </section>

      {/* 12 */}
      <section id="t12">
        <h2 className="mb-3 text-xl font-bold" style={h2}>12. Changes to These Terms</h2>
        <p>
          We may update these Terms. <strong>Material changes</strong> — those that meaningfully
          alter your rights or obligations — require at least 30 days&apos; advance notice and your
          active re-consent before continued use. Continued use alone does not constitute acceptance
          of a material change. Non-material changes (clarifications, formatting, contact updates)
          take effect on posting with an updated revision date.
        </p>
      </section>

      {/* 13 */}
      <section id="t13">
        <h2 className="mb-3 text-xl font-bold" style={h2}>13. Dispute Resolution</h2>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>
            <strong>Direct contact</strong> — Email mamun@mamuncofoundr.com. We acknowledge within
            3 business days and respond substantively within 15 business days.
          </li>
          <li>
            <strong>University escalation</strong> — If unresolved, contact your university&apos;s
            designated FERPA compliance officer, who may intervene under the DUA.
          </li>
          <li>
            <strong>Regulatory</strong> — You retain the right to file a FERPA complaint with the
            U.S. Department of Education&apos;s Student Privacy Policy Office, or a state complaint
            (CPPA for California residents; Texas Attorney General for Texas residents), as
            applicable.
          </li>
        </ul>
      </section>

      {/* 14 */}
      <section id="t14">
        <h2 className="mb-3 text-xl font-bold" style={h2}>14. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of the State of Texas, without regard to
          conflict-of-law provisions, and subject to applicable federal law including FERPA, COPPA,
          and CCPA. Any legal action shall be brought exclusively in the state or federal courts
          located in Travis County, Texas, and both parties consent to personal jurisdiction there.
          Nothing in this section limits your right to file a complaint with the regulators named
          in Section 13.
        </p>
      </section>

      {/* 15 */}
      <section id="t15">
        <h2 className="mb-3 text-xl font-bold" style={h2}>15. Key Definitions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Term</th>
                <th className="p-3 text-left font-semibold">Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Service / Platform</td>
                <td className="p-3">The Mamun Co-Foundr co-founder matching platform.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Cohort</td>
                <td className="p-3">
                  A defined group of students in a specific university-sponsored matching round,
                  typically aligned to an academic semester.
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Connection</td>
                <td className="p-3">A mutual match accepted by both students.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Data Use Agreement (DUA)</td>
                <td className="p-3">
                  The written agreement between Mamun and a university partner governing data flows,
                  retention, security, and incident response. In a conflict between these Terms and
                  a signed DUA, the DUA controls the university relationship.
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Material Change</td>
                <td className="p-3">
                  A change that meaningfully alters how the Service or your data is governed;
                  requires re-consent under Section 12.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 16 */}
      <section id="t16">
        <h2 className="mb-3 text-xl font-bold" style={h2}>16. Contact</h2>
        <p>
          For any question about these Terms, you can get in touch with us by emailing us at{" "}
          <a
            href="mailto:mamun@mamuncofoundr.com"
            className="rounded underline decoration-2 underline-offset-2 transition-colors hover:bg-black/5"
            style={{ color: primaryColor }}
          >
            mamun@mamuncofoundr.com
          </a>
          .
        </p>
        <p className="mt-4 text-center font-semibold">Mamun Co-Foundr — Build with leverage.</p>
      </section>
    </div>
  );
}
