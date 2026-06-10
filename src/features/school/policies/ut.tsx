type Props = {
  primaryColor: string;
};

export default function UTPrivacyPolicy({ primaryColor }: Props) {
  const h2 = { color: primaryColor };

  return (
    <div className="space-y-8 text-sm leading-relaxed text-gray-800">
      <div>
        <p><strong>Effective Date:</strong> June 1, 2026</p>
        <p><strong>Last Revised:</strong> May 27, 2026</p>
      </div>

      {/* 1 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>1. Who We Are</h2>
        <p>
          Mamun Co-Foundr (&quot;Mamun,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a co-founder matching platform that
          partners with universities to help student entrepreneurs discover mission-aligned co-founders.
          We operate as a Software-as-a-Service (SaaS) provider to higher education institutions.
        </p>
        <p className="mt-2">Our registered contact for privacy matters:</p>
        <p className="mt-1">Mamun Co-Foundr | mamun@mamuncofoundr.com | mamuncofoundr.com</p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>2. Scope of This Policy</h2>
        <p>This policy applies to:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Student users who create profiles on Mamun through a university-sponsored program</li>
          <li>University partners who deploy Mamun as part of their entrepreneurship infrastructure</li>
          <li>Data processed in connection with any co-founder matching cohort administered by a university partner</li>
        </ul>
        <p className="mt-3">This policy does not apply to:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Direct-to-consumer users who register independently outside of a university program</li>
          <li>Third-party websites or services linked from the Mamun platform</li>
        </ul>
      </section>

      {/* 3 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>3. FERPA — Our Primary Framework</h2>
        <p>
          The Family Educational Rights and Privacy Act of 1974 (FERPA) is the federal law that governs
          student education records. Because Mamun partners with federally funded universities, FERPA
          compliance is the foundational layer of this privacy policy — not an afterthought.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>3.1 What FERPA Protects</h3>
        <p>
          FERPA protects &quot;education records&quot; — any record that is directly related to a student and
          maintained by an educational institution. This includes, but is not limited to:
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Enrollment status, class standing, and academic history</li>
          <li>GPA, grades, and transcripts</li>
          <li>Major, department, and college affiliation</li>
          <li>Student identification numbers</li>
          <li>Directory information (if restricted by the student or institution)</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>3.2 How Mamun Operates Under FERPA</h3>
        <p className="mb-3">
          Mamun is designed from the ground up to avoid reliance on university-held education records.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">FERPA Principle</th>
                <th className="p-3 text-left font-semibold">How Mamun Implements It</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">No university data pull</td>
                <td className="p-3">Students self-report all profile information. Mamun never requests or ingests data from university student information systems (SIS) without explicit written consent from both the institution and the individual student.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Student-initiated consent</td>
                <td className="p-3">All data collection begins when a student voluntarily creates a Mamun profile. Consent is explicit, specific, and revocable at any time.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">No re-disclosure</td>
                <td className="p-3">Student data collected on Mamun is never shared with third parties — including university administrators, investors, or sponsors — without a new, separate consent from the student.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Purpose limitation</td>
                <td className="p-3">Data collected for co-founder matching is used only for that purpose. We do not use matching data for marketing, fundraising, or third-party analytics.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Data Use Agreement (DUA)</td>
                <td className="p-3">Every university partnership is governed by a signed Data Use Agreement that specifies data flows, storage, access, and retention — before any student uses the platform.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>3.3 Mamun&apos;s Classification Under FERPA</h3>
        <p>
          When deployed under a university program, Mamun may operate as a &quot;school official with
          legitimate educational interest&quot; as defined under 34 CFR §99.31(a)(1). In this capacity, Mamun
          is held to the same FERPA obligations as the institution itself and may not use education
          records for any purpose other than the one for which access was granted.
        </p>
        <div className="mt-3 rounded border-l-4 p-4 text-sm bg-gray-50" style={{ borderColor: primaryColor }}>
          <strong>KEY:</strong> If your institution classifies Mamun as a school official under FERPA, this policy and
          any applicable DUA constitute the written agreement required by FERPA. We never waive or
          disclaim FERPA obligations.
        </div>
      </section>

      {/* 4 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>4. What Data We Collect — and How</h2>
        <p>
          All data Mamun collects from students is provided voluntarily and directly by the student. We do
          not receive education records from the university unless the student explicitly authorizes such a
          transfer in writing.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>4.1 Student-Provided Profile Data</h3>
        <ul className="ml-6 list-disc space-y-1">
          <li>Name, email address, and profile photo (optional)</li>
          <li>University affiliation (self-reported by student)</li>
          <li>Entrepreneurial interests, skills, and domain focus</li>
          <li>Values and mission alignment indicators</li>
          <li>Work style, commitment level, and collaboration preferences</li>
          <li>Stage of venture idea (pre-idea to early traction)</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>4.2 Platform Activity Data</h3>
        <ul className="ml-6 list-disc space-y-1">
          <li>Profile views, match interactions, and connection history</li>
          <li>Messages sent through the Mamun platform (if applicable)</li>
          <li>Login timestamps and session activity</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>4.3 What We Do Not Collect</h3>
        <ul className="ml-6 list-disc space-y-1">
          <li>GPA, grades, academic transcripts, or class standing</li>
          <li>Financial aid status or records</li>
          <li>Disciplinary records</li>
          <li>Immigration or visa status</li>
          <li>Any data sourced directly from university systems without explicit student authorization</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>4.4 Data Minimization</h3>
        <p>
          Mamun collects only the minimum personal data necessary to operate the co-founder matching
          service. Each data field collected has a documented purpose tied directly to matching
          functionality. Fields that do not contribute to matching quality, cohort reporting, or platform
          security are not collected. We review our data collection scope at least annually and remove
          any field that no longer meets this standard.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>4.5 PPRA — Protection of Pupil Rights Amendment</h3>
        <p>
          The Protection of Pupil Rights Amendment (PPRA) governs the collection of sensitive personal
          information from students in federally funded educational programs. While PPRA primarily
          applies to K-12, its principles are relevant to any platform that collects values, beliefs, or
          behavioral data from students in a university program.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Mamun voluntarily aligns with PPRA principles when collecting values-based or mission-alignment data from students.</li>
          <li>Any data collection that touches on protected categories — political affiliations, religious practices, mental health, sexual behavior, or critical appraisals of close family members — is excluded from the Mamun profile by design.</li>
          <li>Values alignment indicators collected by Mamun are limited to professional, ethical, and work-style dimensions relevant to co-founder fit, not protected belief categories under PPRA.</li>
          <li>Students may decline to answer any values-related profile question without losing access to the matching service.</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>4.6 Sensitive Data Categories</h3>
        <p>
          Several state privacy laws (TDPSA, CCPA/CPRA, VCDPA) define heightened protections for
          &quot;sensitive personal information.&quot; Mamun acknowledges that values alignment data, while not
          falling within traditional sensitive categories (race, religion, health, etc.), may be treated as
          sensitive by some regulators when combined with university affiliation. Accordingly:
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Values and mission alignment data are collected only with explicit, separate consent (see Section 5).</li>
          <li>This data is never sold, never used for advertising, and never shared with university partners at the individual level.</li>
          <li>Students may edit or remove values data from their profile at any time without affecting their account status.</li>
          <li>Mamun does not infer, derive, or assign sensitive attributes (race, ethnicity, religion, sexual orientation, disability status, immigration status) to any student based on profile data.</li>
        </ul>
      </section>

      {/* 5 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>5. Consent Mechanism</h2>
        <p>
          Before accessing any feature of the Mamun platform, every student must affirmatively complete
          the following consent flow during onboarding:
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>A dedicated consent screen is presented prior to profile creation — no data is collected before this step.</li>
          <li>The screen displays a plain-language summary of this Privacy Policy and the specific data that will be collected.</li>
          <li><strong>Checkbox 1:</strong> The student must check each of the following boxes individually before proceeding:</li>
          <li><strong>Checkbox 2:</strong> &quot;I have read and agree to the Mamun Co-Foundr Privacy Policy.&quot;</li>
          <li><strong>Checkbox 3:</strong> &quot;I understand that my profile data will be used for co-founder matching within my university cohort.&quot;</li>
          <li><strong>Checkbox 4:</strong> &quot;I consent to Mamun processing my data as described above and understand I may withdraw consent and delete my account at any time.&quot;</li>
          <li>&quot;I understand and consent to Mamun collecting values alignment and mission-fit indicators as part of my profile, and that this data will be used solely for matching purposes and never shared at the individual level.&quot;</li>
        </ul>
        <p className="mt-3">
          Consent is timestamped and logged at the point of submission. The consent record includes the
          student&apos;s user ID, the policy version in effect at the time, the date and time of acceptance, and
          the IP address of the session. These records are retained for the life of the account plus 24 months.
        </p>
        <p className="mt-2">
          Pre-checked boxes, implied consent, and bundled consent are not used. Each checkbox requires
          an independent, affirmative action by the student.
        </p>
        <div className="mt-3 rounded border-l-4 p-4 text-sm bg-gray-50" style={{ borderColor: primaryColor }}>
          <strong>NOTE:</strong> University partners may not direct students to bypass or abbreviate the consent flow. Any
          cohort deployment that circumvents student-level consent is a violation of the Data Use Agreement.
        </div>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>5.2 Consent Withdrawal vs. Data Deletion — They Are Not the Same</h3>
        <p className="mb-3">These are two legally distinct actions and Mamun treats them separately:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Action</th>
                <th className="p-3 text-left font-semibold">What Happens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Withdraw Consent</td>
                <td className="p-3">Mamun immediately stops processing your personal data for matching purposes. Your profile is deactivated and removed from active cohorts. Compliance records, consent logs, and audit trails are retained as required by law — these are not subject to deletion upon consent withdrawal.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Request Data Deletion</td>
                <td className="p-3">Mamun deletes your profile data, match history, and connection records within 30 days. Retained records are limited to: consent timestamps, breach notification logs, and any data required by a signed DUA or applicable law. You will receive written confirmation of deletion.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Both Together</td>
                <td className="p-3">You may withdraw consent and request full deletion simultaneously. Submit via the student support portal or email mamun@mamuncofoundr.com. Both will be processed within 30 days with separate confirmation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>6. How We Use Your Data</h2>
        <p>We use student data strictly for the purpose of facilitating co-founder discovery and matching within university cohorts. Specifically:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>To generate and display co-founder match recommendations based on values, skills, and interests</li>
          <li>To enable students to view, accept, or decline match connections</li>
          <li>To send platform notifications relevant to the matching process (match availability, connection requests, onboarding prompts)</li>
          <li>To produce aggregate, anonymized cohort reports for university partners (e.g., match rates, engagement rates — never individual student-level records)</li>
          <li>To improve the matching algorithm using anonymized, aggregated data</li>
        </ul>
        <p className="mt-3">We do not use your data for:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Advertising or third-party marketing</li>
          <li>Investor prospecting or fundraising on Mamun&apos;s behalf</li>
          <li>Sale or licensing to third parties in any form</li>
          <li>Any purpose materially different from what you consented to at sign-up</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>6.2 Automated Decision-Making and Algorithmic Matching</h3>
        <p>
          Mamun uses an automated matching algorithm to generate co-founder recommendations. This
          constitutes automated processing as defined under CCPA (CPRA), the Virginia Consumer Data
          Protection Act (VCDPA), and related state laws. The following disclosures apply:
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Match recommendations are generated algorithmically based on values alignment, skill complementarity, domain interest, and work style indicators provided in your profile.</li>
          <li>No match recommendation produces a legally significant or binding outcome — all connections are advisory and require affirmative acceptance by both students.</li>
          <li>Human review is not applied to individual match recommendations, but aggregate algorithm performance is reviewed by the Mamun team on a per-cohort basis.</li>
          <li>You may opt out of algorithmic matching at any time by deactivating your profile. Opting out does not delete your data unless you also submit a deletion request.</li>
          <li>You may request a plain-language explanation of why a specific match was recommended by contacting mamun@mamuncofoundr.com.</li>
        </ul>
      </section>

      {/* 7 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>7. Data Sharing</h2>

        <h3 className="mb-2 text-base font-semibold" style={h2}>7.1 What We Share With University Partners</h3>
        <p>
          University partners receive only aggregate, anonymized cohort data — never individual student
          records — unless the student has explicitly consented to their profile being visible to university
          administrators. Even with consent, universities may not receive data that falls under FERPA&apos;s
          &quot;education records&quot; definition sourced from Mamun.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>7.2 What We Never Share</h3>
        <ul className="ml-6 list-disc space-y-1">
          <li>Individual student profiles with other universities, companies, or organizations</li>
          <li>Student contact information with sponsors, investors, or accelerators</li>
          <li>Matching data, connection history, or messaging data with any party outside the student&apos;s current cohort context</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>7.3 Service Providers and Subprocessors</h3>
        <p>
          Mamun uses a limited set of third-party infrastructure providers (e.g., cloud hosting,
          authentication, email delivery) under strict data processing agreements. These providers
          process data only on Mamun&apos;s instructions and may not use student data for their own purposes.
        </p>
        <p className="mt-2">
          Current subprocessor categories include: cloud infrastructure, authentication services,
          transactional email delivery, and database hosting. A current subprocessor list is available upon
          request by university partners.
        </p>
        <p className="mt-2">
          <strong>Subprocessor change policy:</strong> Mamun will provide university partners with at least 30 days
          written notice before adding or replacing any subprocessor that handles student personal data.
          University partners who object to a subprocessor change may terminate the DUA without
          penalty within that 30-day window.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>7.4 Legal Disclosures</h3>
        <p>
          We may disclose data if required by law, court order, or to protect the rights and safety of users
          — subject to applicable legal constraints and only to the minimum extent required.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>8. Student Rights Under FERPA</h2>
        <p className="mb-3">Students who use Mamun through a university-sponsored program retain all rights guaranteed by FERPA. Mamun facilitates the following rights:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Your Right</th>
                <th className="p-3 text-left font-semibold">How to Exercise It</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Right to access your records</td>
                <td className="p-3">Log into your Mamun profile at any time to view all data we hold about you.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Right to correct inaccuracies</td>
                <td className="p-3">Edit your profile directly or contact mamun@mamuncofoundr.com to request corrections.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Right to withdraw consent</td>
                <td className="p-3">You may delete your account and all associated data at any time from your profile settings.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Right to restrict sharing</td>
                <td className="p-3">You may limit profile visibility to specific cohorts or disable matching at any time.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Right to data portability</td>
                <td className="p-3">Request a copy of your profile data in JSON format (machine-readable) and PDF format (human-readable) by emailing mamun@mamuncofoundr.com. Requests are fulfilled within 30 days at no cost.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Right to file a complaint</td>
                <td className="p-3">You may file a complaint with the U.S. Department of Education&apos;s Student Privacy Policy Office (SPPO) if you believe your FERPA rights have been violated.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 9 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>9. Data Retention</h2>
        <p>
          Student data is retained for the duration of the active cohort period plus a maximum of 24
          months, unless the student requests deletion earlier or the university DUA specifies a shorter period.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Active cohort data is retained for the duration of the academic program</li>
          <li>Inactive accounts (no login for 12 months) receive a re-engagement notice before data is archived</li>
          <li>Archived data is permanently deleted within 24 months of the cohort end date</li>
          <li>Aggregate, anonymized cohort reports may be retained for research and publication purposes indefinitely</li>
        </ul>
        <p className="mt-2">
          Students may request immediate deletion of their data at any time by reaching out to our
          student support portal or emailing mamun@mamuncofoundr.com. We will fulfill deletion
          requests within 30 days.
        </p>
      </section>

      {/* 10 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>10. Data Security</h2>
        <p>Mamun implements technical and organizational safeguards proportionate to the sensitivity of student data:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>All data is encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
          <li>Authentication is handled through a secure, enterprise-grade identity provider with multi-factor authentication available</li>
          <li>Access to student data is restricted on a need-to-know basis within the Mamun team</li>
          <li>Our infrastructure is hosted on cloud providers with SOC 2 Type II attestation, with current attestation documentation available to university partners upon request</li>
          <li>We conduct periodic security reviews and respond to vulnerability disclosures within 72 hours</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>10.1 Breach Notification Policy</h3>
        <p className="mb-3">In the event of a data breach affecting student records, Mamun follows the protocol below:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Item</th>
                <th className="p-3 text-left font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Timeline</td>
                <td className="p-3">72 hours from discovery of a confirmed breach. Mamun will notify affected university partners first (within 24 hours where feasible), followed by affected students (within 72 hours).</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Notification Method</td>
                <td className="p-3">University partners: email to designated compliance contact plus follow-up phone call. Students: email to the address on file. Where required by state law, notification will also be made via the legally specified method.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Notification Content</td>
                <td className="p-3">Each notification will include: (1) a description of what data was affected, (2) the approximate date and duration of the breach, (3) the steps Mamun has taken to contain it, (4) recommended protective actions for affected individuals, and (5) Mamun&apos;s contact for further questions.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Partial Breaches</td>
                <td className="p-3">If a breach affects only a subset of students, notification is limited to that affected group. Unaffected users are not notified.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Regulatory Notification</td>
                <td className="p-3">Where required by law, Mamun will also notify the Texas Attorney General, the California Privacy Protection Agency, and other applicable regulators within statutory timeframes.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Post-Breach Review</td>
                <td className="p-3">Within 30 days of a confirmed breach, Mamun will provide affected university partners with a written post-incident report detailing root cause, remediation, and preventive measures.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 11 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>11. University Partner Obligations</h2>
        <p>University partners who deploy Mamun accept the following obligations by signing a Data Use Agreement:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>To obtain appropriate notice and consent from students prior to directing them to Mamun</li>
          <li>To designate a FERPA compliance contact for the partnership</li>
          <li>To notify Mamun immediately of any change in institutional FERPA policy that may affect the partnership</li>
          <li>To not instruct Mamun to collect, process, or share data in a manner inconsistent with FERPA or this policy</li>
        </ul>
        <p className="mt-3">
          <strong>Privacy Impact Assessment (PIA):</strong> Mamun will cooperate with any university-initiated Privacy
          Impact Assessment or equivalent procurement review. We will provide reasonable access to
          documentation including this policy, the DUA, the subprocessor list, security attestations, and
          breach response protocols. PIA cooperation is provided at no cost to the university partner
          during the initial procurement evaluation.
        </p>
        <p className="mt-3">
          <strong>Data Use Agreement:</strong> Every university partnership requires a signed DUA before any student
          accesses the platform. In the event of any conflict between this privacy policy and a signed
          DUA, the DUA controls with respect to the university partner relationship.
        </p>
      </section>

      {/* 12 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>12. Research Use and IRB Alignment</h2>
        <p>When Mamun operates as a Research Pilot partner with a university, the following additional protections apply:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Aggregate matching outcomes may be used in co-authored research publications, subject to IRB approval at the partnering institution</li>
          <li>No individually identifiable student data will appear in any published research without explicit, written student consent</li>
          <li>Research data is stored and handled in accordance with IRB-equivalent data security and anonymization standards</li>
          <li>Students may opt out of research use of their anonymized data without affecting their access to the matching platform</li>
        </ul>
      </section>

      {/* 13 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>13. COPPA — Children&apos;s Online Privacy Protection Act</h2>
        <p>
          The Children&apos;s Online Privacy Protection Act (COPPA) prohibits the collection of personal
          information from children under the age of 13 without verifiable parental consent. Mamun&apos;s
          platform is designed exclusively for university-enrolled students aged 18 and older.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Mamun does not knowingly collect, use, or disclose personal information from any individual under the age of 13.</li>
          <li>The onboarding consent flow includes an age verification affirmation. Any user who indicates they are under 13 will be denied access and no data will be retained.</li>
          <li>For students between 13 and 17 (e.g., dual enrollment or early college programs), COPPA does not apply but additional protections do. The university partner is responsible for obtaining written parental or guardian consent before enrolling such students in any Mamun cohort.</li>
          <li>If Mamun becomes aware that a user under 13 has provided personal data without verifiable parental consent, that data will be deleted immediately and the relevant university partner will be notified.</li>
        </ul>
        <p className="mt-2">
          To report a potential COPPA violation or to request deletion of a minor&apos;s data, contact
          mamun@mamuncofoundr.com. Requests will be fulfilled within 5 business days.
        </p>
      </section>

      {/* 14 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>14. State Privacy Laws</h2>
        <p className="mb-3">Mamun operates across multiple U.S. states through its university partnerships. Where applicable, we honor the privacy rights and obligations established by state law.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">State</th>
                <th className="p-3 text-left font-semibold">Law</th>
                <th className="p-3 text-left font-semibold">How Mamun Complies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Texas</td>
                <td className="p-3">TDPSA (2024)</td>
                <td className="p-3">Students may access, correct, delete, and opt out of processing. No sale of personal data. Consent obtained before collection. Applies to UT Austin, SMU, TCU, UH, and ACC partnerships.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">California</td>
                <td className="p-3">CCPA / CPRA</td>
                <td className="p-3">California residents have the right to know, delete, correct, and opt out of the sale or sharing of personal information. Mamun does not sell personal data.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Virginia</td>
                <td className="p-3">VCDPA</td>
                <td className="p-3">Access, correction, deletion, and opt-out rights honored. No profiling for decisions that produce legal or similarly significant effects without consent.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">All other states</td>
                <td className="p-3">Applicable law</td>
                <td className="p-3">Mamun applies baseline protections consistent with FERPA and this policy to all users regardless of state.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>14.2 Do Not Sell or Share My Personal Information</h3>
        <p>
          Mamun does not sell, rent, or trade student personal information to any third party for monetary
          or other valuable consideration. This applies to all users regardless of state of residence.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>No student profile data is sold, licensed, or shared with advertisers, data brokers, or commercial third parties.</li>
          <li>No data enrichment or cross-context behavioral advertising is performed on student data.</li>
          <li>California residents may formally invoke their CCPA &quot;Do Not Sell or Share&quot; right by contacting mamun@mamuncofoundr.com with the subject line &quot;Do Not Sell Request.&quot;</li>
        </ul>
      </section>

      {/* 15 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>15. Cookies and Tracking Technologies</h2>
        <p className="mb-3">Mamun uses a minimal set of cookies and similar technologies strictly necessary for platform operation. We do not use advertising cookies, cross-site tracking, or behavioral analytics.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Cookie Type</th>
                <th className="p-3 text-left font-semibold">Required?</th>
                <th className="p-3 text-left font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Session / Authentication</td>
                <td className="p-3">Yes</td>
                <td className="p-3">Maintains your login session securely. Expires at session end or after 30 days of inactivity.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Security / CSRF</td>
                <td className="p-3">Yes</td>
                <td className="p-3">Prevents cross-site request forgery attacks. No personal data stored.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Preference / UI State</td>
                <td className="p-3">Optional</td>
                <td className="p-3">Remembers display preferences (e.g., dark mode). Stored locally. Not transmitted to Mamun servers.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Analytics</td>
                <td className="p-3">No</td>
                <td className="p-3">Mamun does not deploy third-party analytics cookies. Any future use will require a policy update and renewed student consent.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">Advertising / Tracking</td>
                <td className="p-3">Never</td>
                <td className="p-3">Not used. No cross-site behavioral tracking is performed on any Mamun user.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 16 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>16. International Students</h2>
        <p>
          Mamun is designed for U.S.-based university programs and operates under U.S. federal and
          state privacy law. However, many university cohorts include international students, including
          individuals whose home countries have separate data protection requirements.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>International students enrolled in a U.S. university program and accessing Mamun through that program are covered by this policy and applicable U.S. law, including FERPA.</li>
          <li>Students who are residents of the European Economic Area (EEA), United Kingdom, or Switzerland may have additional rights under GDPR or equivalent frameworks. At present, Mamun does not actively market to or operate cohorts in EEA jurisdictions.</li>
          <li>Students with questions about their rights under their home country&apos;s laws are encouraged to contact mamun@mamuncofoundr.com.</li>
          <li>Immigration status and visa classification are never collected by Mamun and are excluded from all data processing activities.</li>
        </ul>
      </section>

      {/* 17 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>17. Dispute Resolution</h2>
        <p className="mb-3">If you believe Mamun has mishandled your personal data or violated this policy, the following escalation process applies:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Step</th>
                <th className="p-3 text-left font-semibold">Action</th>
                <th className="p-3 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">1</td>
                <td className="p-3 font-medium">Direct Contact</td>
                <td className="p-3">Email mamun@mamuncofoundr.com describing the issue. Mamun will acknowledge within 3 business days and provide a substantive response within 15 business days.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">2</td>
                <td className="p-3 font-medium">University Partner Escalation</td>
                <td className="p-3">If unresolved, contact your university&apos;s designated FERPA compliance officer. They may intervene under the terms of the DUA.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">3</td>
                <td className="p-3 font-medium">Federal Complaint (FERPA)</td>
                <td className="p-3">File with the U.S. Department of Education SPPO at studentprivacy.ed.gov. Must be filed within 180 days of the alleged violation.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">4</td>
                <td className="p-3 font-medium">State Regulator (CCPA / TDPSA)</td>
                <td className="p-3">California residents may file with the California Privacy Protection Agency (CPPA). Texas residents may file with the Texas Attorney General&apos;s office.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 18 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>18. Governing Law and Jurisdiction</h2>
        <p>
          This Privacy Policy is governed by and construed in accordance with the laws of the State of
          Texas, without regard to its conflict of law provisions, and subject to applicable federal law
          including FERPA, COPPA, and CCPA where applicable by statute.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Any legal action or proceeding arising under or related to this policy shall be brought exclusively in the state or federal courts located in Travis County, Texas.</li>
          <li>Both parties consent to personal jurisdiction in Travis County, Texas for any such proceedings.</li>
          <li>Nothing in this section limits a student&apos;s right to file a complaint with the U.S. Department of Education SPPO, the California Privacy Protection Agency, or the Texas Attorney General, as applicable.</li>
        </ul>
      </section>

      {/* 19 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>19. Account Termination</h2>

        <h3 className="mb-2 text-base font-semibold" style={h2}>19.1 Student-Initiated Termination</h3>
        <p>
          Students may terminate their account at any time through their profile settings or by emailing
          mamun@mamuncofoundr.com. Upon termination, the consent withdrawal and data deletion
          process described in Section 5.2 applies.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>19.2 University Partner Contract Termination</h3>
        <p>If a university partner terminates its Data Use Agreement with Mamun, the following data disposition applies to students enrolled through that partnership:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Active student profiles are frozen immediately and removed from active matching cohorts.</li>
          <li>Students are notified via email of the partnership termination within 7 days and offered three options: (a) migrate to a different partnered university if eligible, (b) request a full data export, or (c) request immediate data deletion.</li>
          <li>Student data is retained for 90 days after partnership termination to allow students to make a choice. After 90 days, all data is deleted unless the student has affirmatively elected an alternative.</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>19.3 Mamun-Initiated Account Termination</h3>
        <p>Mamun may terminate an individual student account for material violation of platform terms (harassment, fraud, impersonation, or attempted unauthorized access). In such cases:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>The affected student receives written notice with the reason for termination and a 14-day appeal window.</li>
          <li>Pending appeal, the account is suspended but data is not deleted.</li>
          <li>Following final termination, data is deleted within 30 days, except records required for fraud prevention, legal compliance, or pending investigations.</li>
          <li>Mamun does not terminate accounts based on values, beliefs, or protected characteristics.</li>
        </ul>
      </section>

      {/* 20 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>20. Business Transitions</h2>

        <h3 className="mb-2 text-base font-semibold" style={h2}>20.1 Acquisition or Merger</h3>
        <ul className="ml-6 list-disc space-y-1">
          <li>If Mamun is acquired, merged, or undergoes a change of control, student data may be transferred to the acquiring entity — but only under the following conditions:</li>
          <li>The acquiring entity must agree in writing to honor all terms of this privacy policy and any active DUAs.</li>
          <li>Students will receive 30 days advance written notice of the transfer, including the identity of the acquiring entity and any material changes to data handling.</li>
          <li>Students who do not consent to the transfer may request data deletion before the transfer date at no cost.</li>
        </ul>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>20.2 Wind-Down or Discontinuation</h3>
        <p>If Mamun discontinues operations or shuts down the platform:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>All active university partners will receive at least 90 days written notice.</li>
          <li>All students will receive at least 60 days written notice with instructions on how to export their data.</li>
          <li>Upon final shutdown, all student data will be permanently deleted within 30 days.</li>
        </ul>
      </section>

      {/* 21 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>21. Limitation of Liability and Force Majeure</h2>

        <h3 className="mb-2 text-base font-semibold" style={h2}>21.1 Force Majeure</h3>
        <p>
          Mamun is not liable for failure or delay in performance caused by circumstances beyond its
          reasonable control, including natural disasters, war, terrorism, government action, internet or
          infrastructure outages, pandemics, or third-party subprocessor failures.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>21.2 Limitation of Liability</h3>
        <p>
          To the maximum extent permitted by applicable law, and except for breaches of FERPA,
          COPPA, or other statutory obligations, Mamun&apos;s liability for any claim arising under this privacy
          policy is limited to direct damages and excludes indirect, consequential, incidental, special, or
          punitive damages.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>21.3 No Waiver of Statutory Rights</h3>
        <p>
          Nothing in this section limits a student&apos;s statutory rights under FERPA, COPPA, CCPA, TDPSA,
          VCDPA, or any other applicable privacy law. Statutory rights and remedies remain fully
          available regardless of the limitations above.
        </p>
      </section>

      {/* 22 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>22. User-to-User Conduct and Platform Data</h2>
        <p>
          Once two students accept a co-founder match connection, they may share contact information,
          exchange messages, and continue their relationship outside the Mamun platform.
        </p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>Mamun is responsible for the security and privacy of data processed on the platform itself.</li>
          <li>Mamun is not responsible for how individual students treat data shared with them by other students through accepted connections.</li>
          <li>Students agree, as part of the platform terms, not to screenshot, redistribute, or publish another student&apos;s profile data without consent.</li>
          <li>Mamun does not monitor the content of student-to-student messages except where required to investigate a reported violation, comply with legal process, or protect platform integrity.</li>
        </ul>
      </section>

      {/* 23 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>23. Accessibility</h2>
        <p>Mamun is committed to providing a platform that is accessible to all university students, including those with disabilities.</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>The Mamun platform is designed to conform with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard.</li>
          <li>Mamun supports compatibility with major screen readers (NVDA, JAWS, VoiceOver) and keyboard-only navigation.</li>
          <li>Students who require accommodations may contact mamun@mamuncofoundr.com.</li>
          <li>Mamun cooperates with university partners on Section 508 and ADA Title II compliance documentation upon request.</li>
        </ul>
      </section>

      {/* 24 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>24. Glossary of Defined Terms</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Term</th>
                <th className="p-3 text-left font-semibold">Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-gray-50"><td className="p-3 font-medium">Personal Data / Personal Information</td><td className="p-3">Any information that identifies, relates to, or could reasonably be linked to an identifiable individual student. Includes name, email, profile content, match history, and platform activity logs.</td></tr>
              <tr><td className="p-3 font-medium">Student Data</td><td className="p-3">A subset of Personal Data specifically generated, submitted, or processed in connection with a student&apos;s use of the Mamun platform under a university partnership.</td></tr>
              <tr className="bg-gray-50"><td className="p-3 font-medium">Profile Data</td><td className="p-3">Information voluntarily submitted by a student during onboarding and profile creation, including values alignment indicators, skills, interests, and venture stage.</td></tr>
              <tr><td className="p-3 font-medium">Education Records</td><td className="p-3">As defined under 34 CFR §99.3 — records directly related to a student and maintained by an educational institution. Mamun does not collect or store education records unless explicitly authorized in writing by both the student and the institution.</td></tr>
              <tr className="bg-gray-50"><td className="p-3 font-medium">Cohort</td><td className="p-3">A defined group of students participating in a specific university-sponsored matching round, typically aligned to an academic semester.</td></tr>
              <tr><td className="p-3 font-medium">Data Use Agreement (DUA)</td><td className="p-3">The bilateral written agreement between Mamun and a university partner that governs data flows, retention, security, and incident response for that partnership.</td></tr>
              <tr className="bg-gray-50"><td className="p-3 font-medium">Material Change</td><td className="p-3">A change to this policy that meaningfully alters how Personal Data is collected, used, shared, or retained. Material changes require active re-consent under Section 25.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 25 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>25. Changes to This Policy</h2>

        <h3 className="mb-2 text-base font-semibold" style={h2}>25.1 Non-Material Changes</h3>
        <p>
          Clarifications, formatting updates, contact information changes, or typographical corrections do
          not require active re-consent. These changes will be reflected on the website with an updated
          revision date.
        </p>

        <h3 className="mt-4 mb-2 text-base font-semibold" style={h2}>25.2 Material Changes</h3>
        <p>Material changes require active re-consent. The following process applies:</p>
        <ul className="mt-2 ml-6 list-disc space-y-1">
          <li>All registered students receive email notice at least 30 days before the change takes effect, with a plain-language summary of what is changing and why.</li>
          <li>Before continuing to use the platform after the effective date, students must affirmatively re-consent through a new checkbox flow.</li>
          <li>Students who decline to re-consent retain full access to their data export and deletion rights, but their account will be deactivated until consent is provided.</li>
          <li>Continued use of the platform alone does not constitute acceptance of Material Changes.</li>
        </ul>
      </section>

      {/* 26 */}
      <section>
        <h2 className="mb-3 text-xl font-bold" style={h2}>26. Contact &amp; Complaints</h2>
        <p>For any privacy-related inquiry, data request, or concern, contact:</p>
        <p className="mt-2 font-medium">mamun@mamuncofoundr.com | mamuncofoundr.com</p>
        <p className="mt-3">To file a complaint with the federal government regarding FERPA violations:</p>
        <p className="mt-1">
          U.S. Department of Education, Student Privacy Policy Office (SPPO)<br />
          studentprivacy.ed.gov | (202) 260-3887
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                <th className="p-3 text-left font-semibold">Version</th>
                <th className="p-3 text-left font-semibold">Date</th>
                <th className="p-3 text-left font-semibold">Summary of Changes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="p-3 font-medium">1.0</td>
                <td className="p-3">June 1, 2026</td>
                <td className="p-3">Initial release. University Platform Edition. Covers FERPA, COPPA, PPRA, TDPSA, CCPA, VCDPA. Includes consent mechanism with sensitive data acknowledgment, automated decision-making disclosure, subprocessor policy, breach notification protocol, account termination, business transitions, force majeure, user-to-user conduct, accessibility, glossary, governing law, dispute resolution, cookies policy, and version changelog.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
