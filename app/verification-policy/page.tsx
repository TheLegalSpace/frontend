"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

/**
 * VerificationPolicyPage
 * ------------------------
 * Sits below the existing navbar and above the existing footer.
 * Shares the same type + color tokens as PrivacyPolicyPage.tsx so the two
 * legal pages read as one product.
 *
 * Same "On this page" scroll-spy nav pattern as the Privacy Policy page:
 * sticky sidebar on desktop, collapsible jump-to dropdown on mobile.
 *
 * The Verification Policy leans more heavily on lists than the Privacy
 * Policy does, so the body model here is a small union of paragraph and
 * list blocks rather than a flat string[]. Everything else — numbering,
 * spacing, typography — mirrors PrivacyPolicyPage.tsx exactly.
 */

type BodyBlock =
  | { type: "p"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] };

type Subsection = {
  id: string;
  number: string;
  title: string;
  body: BodyBlock[];
};

type Section = {
  id: string;
  number: string;
  title: string;
  body: BodyBlock[];
  subsections?: Subsection[];
};

const EFFECTIVE_DATE = "18 July 2025";
const VERSION = "1.0";

const p = (text: string): BodyBlock => ({ type: "p", text });
const list = (items: string[], ordered = false): BodyBlock => ({
  type: "list",
  ordered,
  items,
});

const POLICY_SECTIONS: Section[] = [
  {
    id: "introduction",
    number: "1",
    title: "Introduction",
    body: [
      p(
        "Welcome to The Legal Space (\u201CTLS\u201D, \u201Cwe\u201D, \u201Cour\u201D, or \u201Cus\u201D).",
      ),
      p(
        "The Legal Space is committed to building a trusted and secure digital community for legal professionals, law firms, and clients. A core part of maintaining this trust is ensuring that individuals and organisations representing themselves as members of the Nigerian legal profession are appropriately verified before they gain access to professional features on the platform.",
      ),
      p(
        "This Verification Policy explains how TLS verifies lawyers and law firms, how verification is maintained over time, the circumstances under which verification may be reviewed or revoked, and the responsibilities of users throughout the verification process.",
      ),
      p(
        "By creating or maintaining a verified account on TLS, you agree to comply with this Verification Policy together with our Terms of Service and Privacy Policy.",
      ),
    ],
  },
  {
    id: "purpose-of-verification",
    number: "2",
    title: "Purpose of Verification",
    body: [
      p(
        "Verification helps preserve the integrity of The Legal Space by ensuring that professional accounts are associated with legitimate members of the Nigerian legal profession.",
      ),
      p("The verification process is intended to:"),
      list([
        "Confirm that lawyers and law firms are associated with the Nigerian Bar through an eligible Nigerian Bar email address.",
        "Reduce impersonation, identity fraud, and unauthorised use of professional identities.",
        "Protect clients and other users who rely on professional profiles when engaging with legal practitioners.",
        "Maintain confidence in the authenticity of lawyer and law firm accounts across the platform.",
        "Promote a safe and trusted environment for legal networking, communication, and professional engagement.",
      ]),
      p(
        "Verification is intended solely to confirm eligibility for professional access on TLS. It does not constitute legal accreditation, certification of competence, endorsement, or a guarantee of professional standing beyond the verification procedures described in this policy.",
      ),
    ],
  },
  {
    id: "who-must-be-verified",
    number: "3",
    title: "Who Must Be Verified",
    body: [
      p("Professional verification is mandatory for all users registering as:"),
      list(["Lawyers.", "Law Firms."]),
      p("Verification is not required for users registering as clients."),
      p(
        "Lawyer and law firm accounts must successfully complete the verification process before gaining access to features reserved for verified legal professionals.",
      ),
    ],
  },
  {
    id: "verification-process",
    number: "4",
    title: "Verification Process",
    body: [
      p(
        "TLS verifies professional users through a secure email-based verification process using an official Nigerian Bar email address.",
      ),
      p("To complete verification, users must:"),
      list(
        [
          "Register using a valid Nigerian Bar email address in the format: username@nigerianbar.ng",
          "Receive a One-Time Password (OTP) sent to that email address.",
          "Enter the OTP within the specified validity period.",
        ],
        true,
      ),
      p("Verification is successful only after the OTP has been correctly entered and validated by TLS."),
      p(
        "If verification cannot be completed successfully, the account may remain restricted until verification requirements have been satisfied.",
      ),
      p(
        "TLS reserves the right to decline verification where an email address cannot be authenticated or where there are reasonable grounds to believe that the verification attempt is fraudulent or unauthorised.",
      ),
    ],
  },
  {
    id: "ongoing-verification",
    number: "5",
    title: "Ongoing Verification",
    body: [
      p("Verification is not a one-time process."),
      p(
        "To help maintain the integrity of the platform and ensure that verified accounts continue to satisfy professional eligibility requirements, TLS may conduct periodic verification checks, including but not limited to monthly verification requests.",
      ),
      p(
        "As part of these checks, verified lawyers and law firms may be required to complete a new One-Time Password (OTP) verification using their registered Nigerian Bar email address.",
      ),
      p("These verification requests help confirm that:"),
      list([
        "The registered Nigerian Bar email address remains active.",
        "The verified user continues to have authorised access to that email account.",
        "The account remains eligible to access professional features on TLS.",
      ]),
      p(
        "TLS may also initiate verification checks outside the regular verification schedule where necessary, including in connection with:",
      ),
      list([
        "Account security investigations.",
        "Suspicious or unusual account activity.",
        "Changes to account information.",
        "Account recovery requests.",
        "Regulatory or legal requirements.",
        "Any other circumstances where additional verification is reasonably necessary.",
      ]),
      p(
        "Failure to complete a verification request within the required timeframe may result in temporary restrictions on professional features, suspension of verified status, or other appropriate action until verification has been successfully completed.",
      ),
    ],
  },
  {
    id: "professional-eligibility-monitoring",
    number: "6",
    title: "Professional Eligibility Monitoring",
    body: [
      p("Maintaining trust requires more than confirming ownership of an email address."),
      p(
        "TLS may periodically review whether a verified lawyer or law firm continues to satisfy the professional eligibility requirements for maintaining a verified account.",
      ),
      p(
        "Where appropriate and permitted by applicable law, TLS may review information made available by the Nigerian Bar or other authorised professional or regulatory bodies to determine whether a verified account remains eligible for professional verification.",
      ),
      p(
        "These reviews may occur as part of our periodic verification programme or whenever there is a legitimate operational, legal, regulatory, or security reason to conduct additional verification.",
      ),
      p("Professional eligibility monitoring may identify circumstances including, but not limited to:"),
      list([
        "Suspension from legal practice.",
        "Disbarment or removal from the Roll of Legal Practitioners.",
        "Disciplinary measures affecting the right to practise.",
        "Loss of access to the registered Nigerian Bar email account.",
        "Deactivation of the Nigerian Bar email account.",
        "Any other circumstance indicating that the account no longer satisfies TLS's verification requirements.",
      ]),
      p(
        "TLS does not independently determine whether an individual is entitled to practise law and relies, where appropriate, on information made available by authorised professional or regulatory bodies.",
      ),
      p(
        "Where TLS is unable to verify continued eligibility, we may request additional verification, temporarily restrict professional features, suspend verified status, or take any other action considered reasonably necessary under our Terms of Service.",
      ),
    ],
  },
  {
    id: "law-firm-verification",
    number: "7",
    title: "Law Firm Verification",
    body: [
      p("Law firms registering on TLS must complete the same verification requirements applicable to professional accounts."),
      p(
        "The individual creating or administering a law firm account must use an authorised Nigerian Bar email address associated with the firm and may be required to demonstrate that they are authorised to manage the firm's presence on the platform.",
      ),
      p(
        "TLS reserves the right to request additional information where necessary to verify the legitimacy of a law firm account or the authority of the individual acting on its behalf.",
      ),
      p("Verification of a law firm account does not constitute an endorsement of the firm's legal services or professional reputation."),
    ],
  },
  {
    id: "user-responsibilities",
    number: "8",
    title: "User Responsibilities",
    body: [
      p("Verified users are responsible for maintaining the accuracy and security of their professional accounts."),
      p("Users agree to:"),
      list([
        "Maintain continuous access to their registered Nigerian Bar email account.",
        "Keep their account information accurate and up to date.",
        "Complete verification requests within the required timeframe.",
        "Protect the confidentiality of OTPs and verification credentials.",
        "Notify TLS promptly if they lose access to their registered email account or believe their account has been compromised.",
        "Refrain from allowing another person to use their verified account.",
      ]),
      p("Failure to comply with these responsibilities may affect continued access to verified features."),
    ],
  },
  {
    id: "failure-to-verify",
    number: "9",
    title: "Failure to Verify",
    body: [
      p("TLS may restrict or suspend access to professional features where a user:"),
      list([
        "Fails to complete the initial verification process.",
        "Does not respond to periodic verification requests.",
        "Loses access to their registered Nigerian Bar email address.",
        "Cannot demonstrate continued eligibility for verification.",
        "Provides inaccurate, misleading, or incomplete verification information.",
        "Otherwise fails to satisfy the verification requirements described in this policy.",
      ]),
      p("Where appropriate, users may be given an opportunity to restore verification by completing the required verification process."),
    ],
  },
  {
    id: "fraudulent-verification-attempts",
    number: "10",
    title: "Fraudulent Verification Attempts",
    body: [
      p("TLS maintains a zero-tolerance approach to fraudulent verification activities."),
      p("Prohibited conduct includes, but is not limited to:"),
      list([
        "Using another person's Nigerian Bar email address.",
        "Attempting to impersonate a lawyer or law firm.",
        "Creating multiple professional accounts using false information.",
        "Circumventing or interfering with the verification process.",
        "Providing false, misleading, or forged information during verification.",
      ]),
      p("Where fraudulent activity is suspected, TLS may:"),
      list([
        "Suspend or permanently terminate the account.",
        "Remove verified status.",
        "Restrict access to professional features.",
        "Preserve relevant records for investigative purposes.",
        "Report suspected misconduct to relevant authorities where required or permitted by law.",
      ]),
    ],
  },
  {
    id: "security-of-verification-information",
    number: "11",
    title: "Security of Verification Information",
    body: [
      p("TLS takes reasonable administrative, technical, and organisational measures to protect verification information against unauthorised access, disclosure, alteration, misuse, or loss."),
      p("Verification OTPs are generated securely, are time-limited, and expire automatically after a short period."),
      p("Verification information is processed solely for identity verification, professional eligibility verification, fraud prevention, account security, compliance, and related operational purposes."),
    ],
  },
  {
    id: "suspension-and-revocation-of-verification",
    number: "12",
    title: "Suspension and Revocation of Verification",
    body: [
      p("TLS reserves the right to suspend or revoke a user's verified status where:"),
      list([
        "Verification can no longer be confirmed.",
        "Professional eligibility cannot be established.",
        "Fraudulent activity is suspected.",
        "The account no longer satisfies the requirements of this Verification Policy.",
        "Continued verification would pose a security, legal, regulatory, or operational risk.",
      ]),
      p("Where reasonably practicable, TLS may notify affected users before or shortly after verification is suspended or revoked."),
      p("Suspension or revocation of verification may result in the loss of access to professional features available only to verified lawyers and law firms."),
    ],
  },
  {
    id: "changes-to-this-verification-policy",
    number: "13",
    title: "Changes to This Verification Policy",
    body: [
      p("TLS may update this Verification Policy from time to time to reflect changes in applicable laws, professional requirements, security practices, operational procedures, or platform functionality."),
      p("The most recent version of this policy will always be made available through the TLS website and application."),
      p("Your continued use of the platform following the publication of an updated Verification Policy constitutes acceptance of the revised policy to the extent permitted by applicable law."),
    ],
  },
  {
    id: "contact-us",
    number: "14",
    title: "Contact Us",
    body: [
      p("If you have any questions regarding this Verification Policy or your verification status, you may contact us using the details below:"),
      p("The Legal Space (TLS)"),
      p("Website: thelegalspace.com"),
      p("Privacy & Verification Enquiries: thelegalspace01@gmail.com"),
    ],
  },
];

const TOKENS = {
  ink: "#14140F",
  muted: "#8A887E",
  border: "#E3E1D9",
  accent: "#2547D0",
  accentTint: "#EFF2FC",
  paper: "#FAFAF8",
};

function BodyBlocks({ blocks }: { blocks: BodyBlock[] }) {
  return (
    <div className="mt-3 space-y-4">
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className="text-[15px] leading-[1.7] text-[#3A3934]">
            {block.text}
          </p>
        ) : block.ordered ? (
          <ol
            key={i}
            className="list-decimal space-y-2 pl-5 text-[15px] leading-[1.7] text-[#3A3934]"
          >
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ol>
        ) : (
          <ul
            key={i}
            className="list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-[#3A3934]"
          >
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export default function VerificationPolicyPage() {
  const [activeId, setActiveId] = useState<string>(
    POLICY_SECTIONS[0]?.id ?? "",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const flatNav = useMemo(
    () =>
      POLICY_SECTIONS.flatMap((section) => [
        {
          id: section.id,
          number: section.number,
          title: section.title,
          depth: 0 as const,
        },
        ...(section.subsections?.map((sub) => ({
          id: sub.id,
          number: sub.number,
          title: sub.title,
          depth: 1 as const,
        })) ?? []),
      ]),
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, []);

  const scrollToId = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileNavOpen(false);
  };

  const activeLabel = flatNav.find((item) => item.id === activeId)
    ? `${flatNav.find((item) => item.id === activeId)!.number}. ${
        flatNav.find((item) => item.id === activeId)!.title
      }`
    : "Jump to section";

  return (
    <>
      <Navbar />
      <section className="w-full bg-white">
        {/* Header */}
        <div className="border-b border-[#E3E1D9] bg-[#FAFAF8] px-8 py-16 text-center sm:py-30">
          <p
            className="text-[15px] font-semibold sm:text-[17px]"
            style={{ color: TOKENS.accent }}
          >
            Effective Date: {EFFECTIVE_DATE} | Version {VERSION}
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-dmSans text-[36px] font-extrabold leading-tight tracking-tight text-[#14140F] sm:text-[48px] lg:text-[56px]">
            Verification Policy
          </h1>
        </div>

        {/* Mobile jump-to dropdown */}
        <div className="sticky top-0 z-10 border-b border-[#E3E1D9] bg-white/95 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left"
          >
            <span className="truncate text-[14px] font-medium text-[#14140F]">
              {activeLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#8A887E] transition-transform ${
                mobileNavOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {mobileNavOpen && (
            <nav className="max-h-64 overflow-y-auto border-t border-[#E3E1D9] px-2 py-2">
              {flatNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToId(item.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-[13.5px] ${
                    item.depth ? "pl-7" : ""
                  } ${
                    activeId === item.id
                      ? "bg-[#EFF2FC] font-medium text-[#2547D0]"
                      : "text-[#5C5A50]"
                  }`}
                >
                  {item.number}. {item.title}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Body */}
        <div className="mx-auto grid w-full max-w-360 grid-cols-1 gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[220px_1fr] lg:gap-16 lg:px-10 lg:py-20">
          {/* Desktop sidebar */}
          <nav className="hidden lg:block">
            <div className="sticky top-10 space-y-0.5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A887E]">
                On this page
              </p>
              {flatNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToId(item.id)}
                  className={`block w-full border-l-2 py-1.5 pl-3.5 text-left text-[13.5px] leading-snug transition-colors ${
                    item.depth ? "pl-7 text-[12.5px]" : ""
                  } ${
                    activeId === item.id
                      ? "border-[#2547D0] font-medium text-[#2547D0]"
                      : "border-transparent text-[#8A887E] hover:border-[#D8D6CC] hover:text-[#14140F]"
                  }`}
                >
                  {item.number}. {item.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Sections */}
          <div className="min-w-0 max-w-180">
            {POLICY_SECTIONS.map((section) => (
              <article
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                className="scroll-mt-20 border-b border-[#EDEBE3] py-8 first:pt-0 last:border-none"
              >
                <h2 className="font-semibold text-[18px] leading-snug text-[#14140F] sm:text-[23px] font-dmSans">
                  <span className="mr-0">{section.number}.</span>{" "}
                  {section.title}
                </h2>
                <BodyBlocks blocks={section.body} />

                {section.subsections?.map((sub) => (
                  <div
                    key={sub.id}
                    id={sub.id}
                    ref={(el) => {
                      sectionRefs.current[sub.id] = el;
                    }}
                    className="scroll-mt-20 mt-6"
                  >
                    <h3 className="text-[16px] font-medium text-[#14140F]">
                      <span className="mr-2 text-[#8A887E]">{sub.number}</span>
                      {sub.title}
                    </h3>
                    <BodyBlocks blocks={sub.body} />
                  </div>
                ))}
              </article>
            ))}

            <p className="mt-4 text-[13px] text-[#8A887E]">
              Questions about verification?{" "}
              <a
                href="mailto:thelegalspace01@gmail.com"
                className="text-[#2547D0] underline-offset-2 hover:underline"
              >
                thelegalspace01@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
      <Footer visible={false} />
    </>
  );
}