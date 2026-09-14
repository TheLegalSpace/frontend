"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

/**
 * TermsOfUsePage
 * ------------------------
 * Sits below the existing navbar and above the existing footer.
 * Shares the same type + color tokens as VerificationPolicyPage.tsx /
 * PrivacyPolicyPage.tsx so all three legal pages read as one product.
 *
 * Same "On this page" scroll-spy nav pattern: sticky sidebar on desktop,
 * collapsible jump-to dropdown on mobile. Numbering, spacing, and
 * typography mirror VerificationPolicyPage.tsx exactly.
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
        "These Terms of Services (\u201CTerms\u201D) govern your access to and use of The Legal Space platform (\u201CTLS\u201D, \u201Cwe\u201D, \u201Cus\u201D, or \u201Cour\u201D), including our website at thelegalspace.com and our mobile application (collectively, the \u201CPlatform\u201D). By creating an account, accessing, or using the Platform in any way, you agree to be bound by these Terms in full. If you do not agree with any part of these Terms, you must not use the Platform.",
      ),
      p(
        "TLS is a Nigerian legal technology platform designed to connect lawyers, law firms, and clients within a structured professional community. We provide tools for professional visibility, community engagement, lawyer\u2013client matching, messaging, and related legal technology services.",
      ),
      p(
        "These Terms constitute a legally binding agreement between you and TLS. We encourage you to read them carefully before using the Platform.",
      ),
    ],
  },
  {
    id: "definitions",
    number: "2",
    title: "Definitions",
    body: [
      list([
        "\u201CPlatform\u201D means the TLS website at thelegalspace.com and the TLS mobile application, collectively.",
        "\u201CUser\u201D means any individual or entity that creates an account on or accesses the Platform, including lawyers, law firms, and clients.",
        "\u201CLawyer\u201D means an individual legal practitioner registered on the Platform as a professional user.",
        "\u201CLaw Firm\u201D means a legal practice or organisation registered on the Platform as a firm account.",
        "\u201CClient\u201D means an individual registered on the Platform for the purpose of finding and connecting with legal professionals.",
        "\u201CMembership\u201D means a paid subscription plan that unlocks additional features on the Platform, including Professional Membership.",
        "\u201CContent\u201D means any text, images, documents, files, posts, messages, or other material uploaded, posted, or transmitted through the Platform by a User.",
        "\u201CAI Matching\u201D means the artificial intelligence feature on the Platform that matches clients with lawyers based on the client's legal issue and the lawyer's professional profile.",
        "\u201CVerification\u201D means TLS's process of confirming a lawyer's professional credentials, including their Call to Bar certificate and liveness check.",
      ]),
    ],
  },
  {
    id: "eligibility",
    number: "3",
    title: "Eligibility",
    body: [],
    subsections: [
      {
        id: "general-eligibility",
        number: "3.1",
        title: "General Eligibility",
        body: [
          p(
            "To use the Platform, you must be of legal capacity to enter into a binding agreement under the laws of your jurisdiction. You must not be prohibited from using the Platform under any applicable law.",
          ),
        ],
      },
      {
        id: "lawyers-and-law-firms",
        number: "3.2",
        title: "Lawyers and Law Firms",
        body: [
          p(
            "To register as a lawyer or law firm on the Platform, you must be a qualified legal practitioner who has been duly called to the Bar in your jurisdiction. TLS requires submission of your Call to Bar certificate and completion of a liveness check as part of the registration process. By registering as a lawyer, you represent and warrant that the credentials you submit are genuine, current, and accurately reflect your professional standing.",
          ),
        ],
      },
      {
        id: "clients",
        number: "3.3",
        title: "Clients",
        body: [
          p(
            "Clients must be individuals of legal capacity seeking legal information or services. By registering as a client, you represent that you are an adult capable of entering into legal agreements.",
          ),
        ],
      },
      {
        id: "accurate-information",
        number: "3.4",
        title: "Accurate Information",
        body: [
          p(
            "You represent and warrant that all information you provide during registration and throughout your use of the Platform is true, accurate, current, and complete. You agree to update your information promptly if it changes. TLS reserves the right to suspend or terminate any account where information is found to be false, misleading, or incomplete.",
          ),
        ],
      },
    ],
  },
  {
    id: "account-registration-and-security",
    number: "4",
    title: "Account Registration and Security",
    body: [],
    subsections: [
      {
        id: "account-creation",
        number: "4.1",
        title: "Account Creation",
        body: [
          p(
            "You may create an account on TLS using an email address and password or through Google Sign-In. Where required, you will complete OTP verification and email verification before gaining full access to the Platform. Each individual or entity may hold only one active account on the Platform.",
          ),
        ],
      },
      {
        id: "account-security",
        number: "4.2",
        title: "Account Security",
        body: [
          p(
            "You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must not share your credentials with any other person. You agree to notify TLS immediately at thelegalspace01@gmail.com if you become aware of any unauthorised use of your account or any security breach affecting your credentials. TLS will not be liable for any loss or damage arising from your failure to maintain the security of your account.",
          ),
        ],
      },
      {
        id: "account-types",
        number: "4.3",
        title: "Account Types",
        body: [
          p(
            "TLS offers three account types: Lawyer, Law Firm, and Client. Each account type has its own permissions, features, and verification requirements. You must register under the account type that accurately reflects your identity and intended use of the Platform.",
          ),
        ],
      },
    ],
  },
  {
    id: "lawyer-verification",
    number: "5",
    title: "Lawyer Verification",
    body: [
      p(
        "TLS takes the integrity of its professional community seriously. All lawyers registering on the Platform are required to submit a valid Call to Bar certificate and complete a liveness check as part of the onboarding process. TLS reviews these submissions and reserves the right to reject or suspend any lawyer account where credentials cannot be verified or are found to be invalid.",
      ),
      p(
        "Submission of false, forged, or misleading credentials is a serious breach of these Terms and may result in immediate and permanent termination of your account. TLS reserves the right to report such conduct to the appropriate regulatory authorities, including the Nigerian Bar Association.",
      ),
      p(
        "Completion of the verification process does not constitute endorsement by TLS of any lawyer's skills, competence, or suitability for any particular legal matter. Users are encouraged to exercise their own judgment when selecting legal representation.",
      ),
    ],
  },
  {
    id: "memberships-and-payments",
    number: "6",
    title: "Memberships and Payments",
    body: [],
    subsections: [
      {
        id: "membership-plans",
        number: "6.1",
        title: "Membership Plans",
        body: [
          p(
            "TLS offers membership plans that unlock additional features on the Platform. The features available under each membership tier are described on the Platform and are subject to change. Law firms may add up to seven member lawyers under a single firm account.",
          ),
        ],
      },
      {
        id: "payment-processing",
        number: "6.2",
        title: "Payment Processing",
        body: [
          p(
            "All payments on the Platform are processed through Paystack, our third-party payment processor. By making a payment on the Platform, you agree to Paystack's terms and conditions. TLS does not store your card details. All financial transactions are subject to the terms imposed by Paystack.",
          ),
        ],
      },
      {
        id: "membership-fees-and-renewals",
        number: "6.3",
        title: "Membership Fees and Renewals",
        body: [
          p(
            "Membership fees are as published on the Platform from time to time. Unless otherwise stated, memberships are recurring and will renew automatically at the end of each billing cycle. It is your responsibility to manage your subscription, including cancellation, through your account settings before the renewal date.",
          ),
        ],
      },
      {
        id: "refund-policy-memberships",
        number: "6.4",
        title: "Refund Policy \u2014 Memberships",
        body: [
          p(
            "All membership payments are non-refundable. Once a membership payment has been processed, TLS will not issue a refund for any reason, including early cancellation, non-use, or dissatisfaction with the Platform. By subscribing to a membership, you acknowledge and accept this policy.",
          ),
        ],
      },
      {
        id: "event-publication-fees",
        number: "6.5",
        title: "Event Publication Fees",
        body: [
          p(
            "TLS charges a fee for the publication of events on the Platform. Event publication fees are non-refundable once an event has been published. However, where TLS is unable to verify the legitimacy of an event or has reasonable grounds to doubt the accuracy or appropriateness of an event submission, TLS will contact the event organiser directly. Where a resolution cannot be reached and the event is not published, a refund will be issued. TLS's determination in such matters is final.",
          ),
        ],
      },
      {
        id: "price-changes",
        number: "6.6",
        title: "Price Changes",
        body: [
          p(
            "TLS reserves the right to modify its pricing at any time. Where a price change affects an existing subscription, we will provide reasonable advance notice through the Platform or by email. Your continued use of the Platform following such notice constitutes your acceptance of the revised pricing.",
          ),
        ],
      },
    ],
  },
  {
    id: "platform-features-and-permitted-use",
    number: "7",
    title: "Platform Features and Permitted Use",
    body: [],
    subsections: [
      {
        id: "ai-powered-lawyer-matching",
        number: "7.1",
        title: "AI-Powered Lawyer Matching",
        body: [
          p(
            "TLS provides an AI-powered matching feature that enables clients to describe their legal issue and receive a recommendation of lawyers on the Platform best suited to assist them. The matching system draws on publicly available data and the professional profiles of lawyers who hold an active Professional Membership. Clients do not have the ability to directly browse all lawyer profiles or initiate direct contact with a lawyer outside of the matching process.",
          ),
          p(
            "The AI matching feature is an assistive tool only. TLS does not guarantee the accuracy, completeness, or suitability of any match. The final decision to engage any lawyer rests entirely with the client, and any engagement is a matter solely between the client and the lawyer.",
          ),
        ],
      },
      {
        id: "messaging",
        number: "7.2",
        title: "Messaging",
        body: [
          p(
            "Once a client has been matched with a lawyer through the AI matching feature, the Platform enables direct messaging between the two parties. Users may send text messages, documents, images, PDFs, and other files through the messaging feature. You are solely responsible for the content of any messages you send and any files you share. TLS is not a party to any communication between a lawyer and a client and does not monitor message content except where required for safety, security, or legal compliance purposes.",
          ),
        ],
      },
      {
        id: "community-features",
        number: "7.3",
        title: "Community Features",
        body: [
          p(
            "The TLS community allows users to create posts, follow lawyers, report content, and engage with the professional legal community on the Platform. Certain community features are available only to users with an active Professional Membership. Community participation is subject to the conduct standards set out in Section 8 of these Terms.",
          ),
        ],
      },
      {
        id: "permitted-use",
        number: "7.4",
        title: "Permitted Use",
        body: [
          p(
            "You may use the Platform only for lawful purposes and in accordance with these Terms. You agree to use the Platform in a manner consistent with its intended purpose as a legal technology and professional networking platform.",
          ),
        ],
      },
    ],
  },
  {
    id: "prohibited-conduct",
    number: "8",
    title: "Prohibited Conduct",
    body: [
      p("You agree that you will not, under any circumstances:"),
      list([
        "Use the Platform for any purpose that is unlawful, fraudulent, or harmful to others.",
        "Submit false, misleading, or fabricated credentials or profile information.",
        "Impersonate any person, entity, or professional qualification.",
        "Use the Platform to solicit clients or provide legal services through channels outside the Platform in a manner that deliberately circumvents TLS's systems or membership requirements.",
        "Upload, post, or transmit content that is defamatory, obscene, threatening, harassing, discriminatory, or otherwise objectionable.",
        "Upload or share any content that infringes the intellectual property rights of any third party.",
        "Send unsolicited communications, spam, or repeated requests that serve no legitimate purpose.",
        "Use automated scripts, bots, or other automated means to access or interact with the Platform.",
        "Attempt to gain unauthorised access to any part of the Platform or any other user's account.",
        "Engage in any conduct that disrupts, damages, or interferes with the operation of the Platform or the experience of other users.",
        "Use the Platform to facilitate any activity that would constitute a criminal offence or give rise to civil liability.",
      ]),
    ],
  },
  {
    id: "content-and-intellectual-property",
    number: "9",
    title: "Content and Intellectual Property",
    body: [],
    subsections: [
      {
        id: "your-content",
        number: "9.1",
        title: "Your Content",
        body: [
          p(
            "You retain full ownership of all Content you upload, post, or share on the Platform. By submitting Content to the Platform, you grant TLS a limited, non-exclusive, royalty-free licence to display, store, and distribute that Content on the Platform for the purpose of operating and delivering the Platform's features to you and other users. This licence exists only for as long as your account remains active. Upon deletion of your account, TLS's right to display your Content will cease, subject to any retention obligations described in our Privacy Policy.",
          ),
          p(
            "You represent and warrant that you have all necessary rights to the Content you submit and that your Content does not infringe the rights of any third party.",
          ),
        ],
      },
      {
        id: "tls-intellectual-property",
        number: "9.2",
        title: "TLS Intellectual Property",
        body: [
          p(
            "All intellectual property on the Platform that is not User Content \u2014 including but not limited to the TLS name, logo, branding, design, software, technology, and written materials \u2014 is owned by or licensed to TLS and is protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use TLS's intellectual property for any purpose outside of your use of the Platform.",
          ),
        ],
      },
      {
        id: "feedback",
        number: "9.3",
        title: "Feedback",
        body: [
          p(
            "If you provide TLS with feedback, suggestions, or ideas regarding the Platform, you grant TLS the right to use that feedback for any purpose without any obligation to compensate you.",
          ),
        ],
      },
    ],
  },
  {
    id: "third-party-services-and-links",
    number: "10",
    title: "Third-Party Services and Links",
    body: [
      p(
        "The Platform integrates with and may contain links to third-party services, including Paystack for payment processing, Google Gemini for AI functionality, and WhatsApp for notifications. These third-party services are governed by their own terms and privacy policies. TLS is not responsible for the practices, content, or availability of any third-party service, and your use of such services is at your own risk.",
      ),
      p(
        "The inclusion of any third-party link or integration does not constitute an endorsement by TLS of that service or its operators.",
      ),
    ],
  },
  {
    id: "disclaimers",
    number: "11",
    title: "Disclaimers",
    body: [],
    subsections: [
      {
        id: "no-legal-advice",
        number: "11.1",
        title: "No Legal Advice",
        body: [
          p(
            "TLS is a technology platform. Nothing on the Platform \u2014 including any content generated by the AI matching feature, any lawyer profiles, or any community posts \u2014 constitutes legal advice. The AI matching feature provides recommendations based on professional profile data and publicly available information; it is not a substitute for qualified legal counsel. Any legal advice you receive is provided by the individual lawyer you engage and is entirely their professional responsibility.",
          ),
        ],
      },
      {
        id: "no-endorsement-of-lawyers",
        number: "11.2",
        title: "No Endorsement of Lawyers",
        body: [
          p(
            "TLS does not endorse, recommend, or vouch for the competence, quality, or suitability of any lawyer or law firm listed on the Platform. Verification of credentials confirms that a lawyer has been called to the Bar; it does not assess their skill, experience, or fitness for any specific legal matter.",
          ),
        ],
      },
      {
        id: "platform-availability",
        number: "11.3",
        title: "Platform Availability",
        body: [
          p(
            "TLS provides the Platform on an \u201Cas is\u201D and \u201Cas available\u201D basis. We do not guarantee that the Platform will be uninterrupted, error-free, or free from security vulnerabilities. We reserve the right to modify, suspend, or discontinue any feature or the Platform as a whole at any time, with or without notice.",
          ),
        ],
      },
      {
        id: "limitation-of-liability",
        number: "11.4",
        title: "Limitation of Liability",
        body: [
          p(
            "To the fullest extent permitted by applicable law, TLS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform, including damages for loss of data, loss of revenue, or loss of business opportunity, even if TLS has been advised of the possibility of such damages. TLS's total liability to you for any claim arising out of or in connection with these Terms or the Platform shall not exceed the amount you have paid to TLS in the three months preceding the event giving rise to the claim.",
          ),
        ],
      },
    ],
  },
  {
    id: "account-suspension-and-termination",
    number: "12",
    title: "Account Suspension and Termination",
    body: [],
    subsections: [
      {
        id: "termination-by-you",
        number: "12.1",
        title: "Termination by You",
        body: [
          p(
            "You may delete your account at any time from within the application. Deletion of your account will terminate your access to the Platform. Membership fees already paid will not be refunded upon voluntary termination.",
          ),
        ],
      },
      {
        id: "suspension-or-termination-by-tls",
        number: "12.2",
        title: "Suspension or Termination by TLS",
        body: [
          p(
            "TLS reserves the right to suspend or permanently terminate your account at any time, with or without prior notice, where:",
          ),
          list([
            "You have submitted spam, repeated unsolicited requests, or have demonstrated a pattern of cancelling in bad faith that disrupts the Platform or other users.",
            "You have been the subject of multiple verified reports from other users regarding your conduct on the Platform.",
            "You have submitted false, forged, or misleading credentials during or after the verification process.",
            "You have violated any provision of these Terms or any applicable law.",
            "TLS determines in its reasonable discretion that your continued presence on the Platform poses a risk to other users, the Platform's integrity, or TLS's reputation.",
          ]),
          p(
            "Where possible and where circumstances permit, TLS will notify you of the grounds for suspension or termination. However, TLS is not obligated to provide advance notice where the breach is serious, where there is a risk of harm, or where doing so would be contrary to applicable law.",
          ),
        ],
      },
      {
        id: "effect-of-termination",
        number: "12.3",
        title: "Effect of Termination",
        body: [
          p(
            "Upon termination of your account, your right to access and use the Platform ceases immediately. TLS may retain certain data following termination in accordance with our Privacy Policy and applicable legal obligations.",
          ),
        ],
      },
    ],
  },
  {
    id: "dispute-resolution-between-users",
    number: "13",
    title: "Dispute Resolution Between Users",
    body: [
      p(
        "TLS is a technology platform and is not a party to any relationship, agreement, or dispute between a lawyer and a client that originates from or is facilitated through the Platform. Any dispute arising between a lawyer and a client \u2014 including disputes about the quality of legal services, fees, or professional conduct \u2014 is a matter entirely between those parties.",
      ),
      p(
        "TLS does not mediate, arbitrate, or adjudicate disputes between users. Users are encouraged to resolve disputes directly and, where appropriate, through the relevant professional regulatory bodies, including the Nigerian Bar Association, or through applicable legal processes.",
      ),
      p(
        "Users may report conduct that violates these Terms using the reporting features available on the Platform. TLS will review such reports and take action where a violation of these Terms is found, but such action does not constitute legal or professional adjudication of the underlying dispute.",
      ),
    ],
  },
  {
    id: "governing-law-and-jurisdiction",
    number: "14",
    title: "Governing Law and Jurisdiction",
    body: [
      p(
        "These Terms are governed by and shall be construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. The Platform is operated from Nigeria and is primarily intended for users in Nigeria, though we welcome users from other jurisdictions.",
      ),
      p(
        "Where you are accessing the Platform from outside Nigeria, you do so on your own initiative and are responsible for compliance with the laws of your local jurisdiction to the extent they apply. Nothing in these Terms limits TLS's ability to seek injunctive or other equitable relief in any jurisdiction where necessary to protect its rights.",
      ),
      p(
        "Any dispute arising out of or in connection with these Terms that cannot be resolved amicably shall be subject to the exclusive jurisdiction of the courts of Nigeria.",
      ),
    ],
  },
  {
    id: "changes-to-these-terms",
    number: "15",
    title: "Changes to These Terms",
    body: [
      p(
        "TLS reserves the right to update or modify these Terms at any time. When we make material changes, we will notify you through the Platform and/or by email to the address associated with your account, and we will update the effective date at the top of this document.",
      ),
      p(
        "Your continued use of the Platform following the publication of revised Terms constitutes your acceptance of those changes. If you do not agree with the revised Terms, you must cease using the Platform and, if you wish, delete your account.",
      ),
    ],
  },
  {
    id: "severability",
    number: "16",
    title: "Severability",
    body: [
      p(
        "If any provision of these Terms is found to be unlawful, void, or unenforceable under applicable law, that provision shall be deemed severable from the remainder of these Terms and shall not affect the validity and enforceability of the remaining provisions.",
      ),
    ],
  },
  {
    id: "entire-agreement",
    number: "17",
    title: "Entire Agreement",
    body: [
      p(
        "These Terms, together with our Privacy Policy and any other policies published on the Platform, constitute the entire agreement between you and TLS with respect to your use of the Platform and supersede all prior agreements, representations, and understandings relating to the same subject matter.",
      ),
    ],
  },
  {
    id: "contact-information",
    number: "18",
    title: "Contact Information",
    body: [
      p("If you have any questions about these Terms or your use of the Platform, please contact us:"),
      p("The Legal Space"),
      p("Website: thelegalspace.com"),
      p("Email: thelegalspace01@gmail.com"),
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

export default function TermsOfUsePage() {
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
            Terms Of Services
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
              Questions about these Terms?{" "}
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