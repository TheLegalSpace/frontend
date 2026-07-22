"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

/**
 * PrivacyPolicyPage
 * ------------------
 * Sits below the existing navbar and above the existing footer.
 * Shares the same type + color tokens as SupportTicketForm.tsx so the two
 * pages read as one product.
 *
 * Signature element: a numbered "On this page" nav that scroll-spies the
 * active section. With 17 real sections in the source doc, a jump list is
 * a functional necessity here, not decoration — the numbering already
 * carries real sequence in a legal doc, so it's honest to lean on it.
 * Sticky sidebar on desktop, a collapsible jump-to dropdown on mobile.
 *
 * CONTENT: the sections below are placeholder copy shaped like the real
 * policy (same headings, same 1 / 1.1 numbering) so you can see the
 * typography and spacing render correctly. Swap `POLICY_SECTIONS` for the
 * full legal text — probably sourced from a CMS or markdown file rather
 * than hardcoded, given the length.
 */

type SubsectionUser = {
  role: string;
  // number: string;
  // title: string;
  body: string;
  // users: ;
};
type Subsection = {
  id: string;
  number: string;
  title: string;
  body: string[];
  users: SubsectionUser[];
};
type Section = {
  id: string;
  number: string;
  title: string;
  body: string[];
  subsections?: Subsection[];
};

const EFFECTIVE_DATE = "10 July 2025";
const VERSION = "1.0";

const POLICY_SECTIONS: Section[] = [
  {
    id: "introduction",
    number: "1",
    title: "Introduction",
    body: [
      "The Legal Space (\u201CTLS\u201D, \u201Cwe\u201D, \u201Cus\u201D, or \u201Cour\u201D) is a Nigerian legal technology platform that connects lawyers, law firms, and clients within a structured professional community. We are committed to protecting the privacy of everyone who uses our platform and to handling personal information with the highest degree of care, transparency, and respect.",
      "This Privacy Policy describes what information we collect when you access or use the TLS website at thelegalspace.com and the TLS mobile application, why we collect it, how we use and protect it, and the rights you have in relation to it. It applies to all users of the platform, regardless of whether you are a lawyer, a law firm, or a client.",
      "By creating an account, accessing, or using the Platform, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein. If you do not agree with any part of this Policy, you should discontinue use of the Platform.",
    ],
  },
  {
    id: "scope",
    number: "2",
    title: "Scope of this Privacy Policy",
    body: [
      "This Privacy Policy applies to all personal information processed by TLS in connection with the Platform. It covers all individuals who create an account on the Platform, including lawyers, law firms, and clients; visitors to the TLS website who do not register but whose data may be collected through cookies or similar technologies; and all interactions with the Platform, including registration, profile management, messaging, community participation, membership subscription, and event-related payments.",
      "This Policy does not apply to third-party websites, applications, or services that may be linked to or from our Platform. We are not responsible for the privacy practices of those third parties, and we encourage you to review their respective privacy policies before sharing any personal information.",
    ],
  },
  {
    id: "definitions",
    number: "3",
    title: "Definitions",
    body: [
      '"Personal Data" or "Personal Information" means any information relating to an identified or identifiable individual. This includes names, contact details, government-issued identification numbers, professional credentials, and any other information that can, directly or indirectly, be used to identify a person',
      '"Processing" means any operation or set of operations performed on personal data, including collection, recording, organisation, structuring, storage, adaptation, retrieval, use, disclosure, or deletion.',
      '"Platform" means the TLS website located at thelegalspace.com and the TLS mobile application, collectively.',
      '"User" means any individual or entity that accesses or uses the Platform, including lawyers, law firms, and clients.',
      '"Lawyer" means an individual legal practitioner who registers on the Platform as a professional user.',
      '"Law Firm" means a legal practice or organisation that registers on the Platform as a firm account.',
      '"Client" means an individual who registers on the Platform for the purpose of finding, connecting with, or engaging legal services.',
      '"Membership" means a paid subscription tier that unlocks additional features on the Platform.',
      '"NDPA" means the Nigeria Data Protection Act 2023.',
      '"NDPC" means the Nigeria Data Protection Commission.',
    ],
  },
  {
    id: "information-we-collect",
    number: "4",
    title: "Information We Collect",
    body: [
      "The nature and extent of information we collect varies depending on the type of account you create and how you use the platform.",
    ],
    subsections: [
      {
        id: "information-you-provide",
        number: "4.1",
        title: "Information You Provide to Us",
        body: [
          "When you register for and use the platform, you provide us with personal information directly \u2014 including your full legal name, email address, phone number, password, and (where relevant) national identification and professional credential details for lawyers and law firms.",
          "All Users (Lawyers, Law Firms, and Clients)",
          "Upon registration and during use of the Platform, all users provide, at minimum, their full legal name, email address, phone number, password (stored in hashed, non-recoverable form), profile photograph, and location (city and/or state).",
        ],
        users: [
          {
            role: "Lawyers",
            body: "In addition to the information above, lawyers provide professional details including their bio and professional summary, practice areas, Call to Bar details (year and jurisdiction), firm name where applicable, National Identification Number (NIN), and CAC or business registration information where applicable.",
          },
          {
            role: "Law Firms",
            body: "Law firms provide organisational information including the firm name, CAC registration details, business address, contact information for the firm, and details of member lawyers added to the firm account, up to a maximum of seven members.",
          },
          {
            role: "User-Uploaded Content",
            body: "Users may upload content to the Platform, including profile pictures, documents, images, PDFs, and other files shared through the messaging or community features. Any such content is stored on our servers and is associated with your account.",
          },
          {
            role: "Community Content",
            body: "Where you participate in the TLS community, we collect the content you post, any reports you submit regarding other users or content, and records of accounts you follow.",
          },
          {
            role: "Payment and Transaction Information",
            body: "When you make a payment on the Platform — whether for a membership subscription or for event publication — the transaction is processed through Paystack, our third-party payment processor. TLS does not store your card details. We receive and retain only transactional records such as the amount paid, the date of the transaction, and a reference identifier provided by Paystack. Please refer to Paystack's privacy policy for details of how your payment data is handled on their end.",
          },
        ],
      },
      {
        id: "information-automatically-collected",
        number: "4.2",
        title: "Information Collected Automatically",
        body: [
          "When you access and use the platform, certain information is automatically collected via cookies and similar technologies, including your device type, browser type, IP address, pages visited, and session duration.",
        ],
        users: [],
      },
    ],
  },
  {
    id: "how-we-use-your-information",
    number: "5",
    title: "How We Use Your Information",
    body: [
      "We use your registration information to create and manage your account, verify your identity, maintain your profile, and provide you with access to platform features \u2014 including matching lawyers and clients, processing payments, and enabling secure communication.",
    ],
    subsections: [
      {
        id: "Account Creation and Management",
        number: "5.1",
        title: "Account Creation and Management",
        body: [
          "When you register for and use the platform, you provide us with personal information directly \u2014 including your full legal name, email address, phone number, password, and (where relevant) national identification and professional credential details for lawyers and law firms.",
          "All Users (Lawyers, Law Firms, and Clients)",
          "Upon registration and during use of the Platform, all users provide, at minimum, their full legal name, email address, phone number, password (stored in hashed, non-recoverable form), profile photograph, and location (city and/or state).",
        ],
        users: [],
      },
      {
        id: "Platform Features and Services",
        number: "5.2",
        title: "Platform Features and Services",
        body: [
          "Your information enables us to deliver the core features of the Platform, including lawyer-client matching, direct messaging, community participation, content creation, and event-related services. Your practice areas, location, and professional credentials are used by our AI-powered matching system to connect clients with lawyers best suited to their legal needs.",
        ],
        users: [],
      },
      {
        id: "AI-Powered Lawyer Matching",
        number: "5.3",
        title: "AI-Powered Lawyer Matching",
        body: [
          "TLS uses an AI-assisted matching feature that helps clients identify lawyers suited to their specific legal needs. This system uses information you have provided in your profile — such as practice areas, location, and professional credentials — to generate recommendations. The AI layer uses publicly available data gathered from the web, supplemented by profile data you provide on the Platform, to present contextually relevant information about lawyers. TLS does not store any information entered into the AI web tool beyond what is held in your TLS profile.",
        ],
        users: [],
      },
      {
        id: "Communications",
        number: "5.4",
        title: "Communications",
        body: [
          "We use your contact information to send you system notifications, in-app alerts, email communications, and WhatsApp messages relating to your account activity, membership status, and platform updates. These communications are operational in nature and are necessary for the functioning of your account. You will receive transactional and service-related messages even if you have not opted into marketing communications.",
        ],
        users: [],
      },
      {
        id: "Payments and Billing",
        number: "5.5",
        title: "Payments and Billing",
        body: [
          "We use your contact information to send you system notifications, in-app alerts, email communications, and WhatsApp messages relating to your account activity, membership status, and platform updates. These communications are operational in nature and are necessary for the functioning of your account. You will receive transactional and service-related messages even if you have not opted into marketing communications.",
        ],
        users: [],
      },
      {
        id: "Safety, Security, and Integrity",
        number: "5.6",
        title: "Safety, Security, and Integrity",
        body: [
          "We use account data and activity logs to detect and prevent fraudulent activity, monitor for policy violations, investigate reports submitted by users, enforce our Terms of Service, and maintain the security and integrity of the Platform. This includes reviewing content reported by users and taking appropriate action where violations are found.",
        ],
        users: [],
      },
      {
        id: "Platform Improvement and Debugging",
        number: "5.7",
        title: "Platform Improvement and Debugging",
        body: [
          "Technical logs and system data collected through our infrastructure are used to identify errors, resolve technical issues, and improve the performance and reliability of the Platform. Our error-tracking and debugging setup is powered by server-side logging provided through Vercel.",
        ],
        users: [],
      },
    ],
  },
  {
    id: "legal-bases",
    number: "6",
    title: "Legal Bases for Processing",
    body: [
      "In jurisdictions that require a lawful basis for processing personal data — including under the Nigeria Data Protection Act 2023 and GDPR-aligned frameworks — TLS relies on the following legal bases:",
      "Performance of a contract: The majority of our processing is necessary to deliver the services you have requested by creating an account and using the Platform. This includes profile management, messaging, community features, and payment processing.",
      "Legitimate interests: We process certain data — such as technical logs and system diagnostics — to maintain and improve the Platform, detect security threats, and protect the interests of our users and our business. We have assessed that these interests are not overridden by the rights of our users.",
      "Legal obligation: Where required by law, we may process personal data to comply with a legal obligation, including responding to valid law enforcement requests or regulatory requirements.",
      "Consent: Where we rely on consent for any specific processing activity — such as optional marketing communications — we will obtain that consent clearly and provide a mechanism to withdraw it at any time.",
    ],
  },
  {
    id: "ai-and-automated-processing",
    number: "7",
    title: "AI and Automated Processing",
    body: [
      "TLS incorporates an AI-powered feature designed to assist clients in identifying lawyers who match their legal needs. This feature uses a combination of the professional profile information provided by lawyers on the Platform and publicly available web data to generate contextual information and recommendations. This AI functionality is powered through integration with Google Gemini. Queries submitted through the AI layer may be processed by Google's systems. TLS does not retain inputs to the AI tool beyond the session in which they are entered, and no client query history is stored on TLS servers. Lawyers' profile information, which is publicly displayed on the Platform, may be referenced by the AI system in formulating responses.",
      "The AI matching system does not make automated decisions that produce legal or similarly significant effects on users. It serves as an assistive recommendation tool, and all final decisions — including choosing a lawyer and engaging their services — rest with the user. You are not subject to any automated decision-making process that would affect your legal rights without human review.",
      "As our AI features evolve, we will update this section to accurately reflect any changes to how AI is used on the Platform.",
    ],
  },
  {
    id: "cookies-and-similar-technologies",
    number: "8",
    title: "Cookies and Similar Technologies",
    body: [
      "TLS uses cookies on our website at thelegalspace.com. Cookies are small text files stored on your browser when you visit a website. We use cookies for session management, to maintain your login state and enable you to navigate the Platform without needing to re-authenticate on every page; for security, to protect against fraudulent activity and unauthorised access attempts; and for performance, to collect anonymised data about how our website is used so that we can improve its functionality and user experience.",
      "At present, our cookie use is limited to our website. Our mobile application does not use browser cookies; however, equivalent device-level identifiers may be used for session and authentication purposes.",
      "You can control the use of cookies through your browser settings. Disabling certain cookies may affect your ability to use some features of the TLS website. Where required by applicable law, we will request your consent before placing non-essential cookies.",
    ],
  },
  {
    id: "third-party-services",
    number: "9",
    title: "Third-Party Services",
    body: [
      "To operate and deliver the Platform, TLS works with carefully selected third-party service providers. Each of these providers processes personal data on our behalf and under appropriate data protection arrangements.",
      "Supabase: We use Supabase as our backend infrastructure and database service. Personal data stored on the Platform — including user profiles, messages, and uploaded content — is held within Supabase's infrastructure. Supabase operates in compliance with international data protection standards.",
      "Paystack: All payment processing on the Platform is handled by Paystack. When you make a payment, your card and payment details are processed directly by Paystack. TLS does not receive or store full card details. Paystack's privacy policy governs the handling of your financial data.",
      "Google Gemini: Our AI matching feature is powered in part by Google Gemini. Information submitted through AI queries on the Platform may be processed by Google's systems. We encourage you to review Google's privacy policy for further information.",
      "Vercel: The TLS Platform is hosted on Vercel's infrastructure. Vercel may process certain technical data — including IP addresses and access logs — as part of hosting and delivering our application.",
      "WhatsApp (Meta): Where applicable, we use WhatsApp to deliver notifications to users who have provided a phone number associated with their account. Messages sent via WhatsApp are subject to Meta's privacy policy.",
      "We do not sell your personal data to third parties. We do not share your personal information with advertisers or data brokers. Any sharing with third parties is limited to what is necessary to provide you with the services of the Platform.",
    ],
  },
  {
    id: "data-sharing-and-disclosure",
    number: "10",
    title: "Data Sharing and Disclosure",
    body: [
      "This section describes the circumstances under which TLS may share your personal data with third parties, including service providers, legal authorities, and in connection with business transactions.",
    ],
    subsections: [
      {
        id: "public-profile-information",
        number: "10.1",
        title: "Public Profile Information",
        body: [
          "Certain information on your TLS profile is publicly visible to other users and, where applicable, to the general public via our website. For lawyers, publicly visible information includes your name, profile photo, bio, practice areas, Call to Bar details, location, and firm name. Law firm profiles are similarly visible. Clients' profiles are visible to other authenticated users on the Platform. You should only include in your public profile the information you are comfortable sharing with others.",
        ],
        users: [],
      },
      {
        id: "service-providers",
        number: "10.2",
        title: "Service Providers",
        body: [
          "As described in Section 9, we share data with third-party service providers who assist in delivering the Platform. These providers are contractually obligated to process your data only on our instructions and in accordance with applicable data protection laws.",
        ],
        users: [],
      },
      {
        id: "legal-obligations",
        number: "10.3",
        title: "Legal Obligations",
        body: [
          "We may disclose personal data where required to do so by law, regulation, court order, or valid request from a competent authority. In such cases, we will disclose only the minimum information required and, where legally permissible, will notify affected users.",
        ],
        users: [],
      },
      {
        id: "protection-of-rights",
        number: "10.4",
        title: "Protection of Rights",
        body: [
          "We may disclose information where we believe in good faith that such disclosure is necessary to protect the rights, property, or safety of TLS, our users, or the public — for example, in connection with the investigation of fraud, abuse, or illegal activity on the Platform.",
        ],
        users: [],
      },
      {
        id: "business-transfers",
        number: "10.5",
        title: "Business Transfers",
        body: [
          "In the event that TLS undergoes a merger, acquisition, restructuring, or sale of assets, your personal data may be transferred as part of that transaction. We will notify you in advance of any such transfer and the applicable privacy protections that will govern your data following the transaction.",
        ],
        users: [],
      },
    ],
  },
  {
    id: "international-data-transfers",
    number: "11",
    title: "International Data Transfers",
    body: [
      "TLS is a Nigerian platform and our primary operations are based in Nigeria. However, some of the third-party service providers we work with — including Vercel, Supabase, and Google — may process data on infrastructure located outside Nigeria. Where personal data is transferred outside Nigeria, we take appropriate steps to ensure that such transfers are carried out in compliance with the Nigeria Data Protection Act 2023 and that your data receives a level of protection equivalent to that afforded within Nigeria. This may include reliance on standard contractual clauses, adequacy determinations, or other lawful transfer mechanisms.",
    ],
  },
  {
    id: "data-security",
    number: "12",
    title: "Data Security",
    body: [
      "The security of your personal data is important to us. TLS implements a range of technical and organisational measures designed to protect your information against unauthorised access, loss, destruction, or alteration. These measures include transmission of data over the Platform encrypted using HTTPS/TLS protocols; passwords stored in hashed, non-recoverable form and never stored in plain text; multi-factor authentication implemented through OTP verification to protect user accounts from unauthorised access; role-based access controls so that TLS team members and systems access only the data necessary for their specific function; and row-level security and access policies enforced at the database layer through our Supabase infrastructure.",
      "Despite these measures, no method of data transmission or storage can be guaranteed to be completely secure. We encourage users to take responsibility for their account security by using strong passwords and keeping their login credentials confidential. If you believe your account has been compromised, please contact us immediately at thelegalspace01@gmail.com.",
    ],
  },
  {
    id: "data-retention",
    number: "13",
    title: "Data Retention",
    body: [
      "We retain your personal information for as long as necessary to fulfil the purposes described in this Privacy Policy, to maintain and operate your account, to comply with our legal obligations, to resolve disputes, and to enforce our agreements.",
      "Account and profile information is retained for the duration of your account's existence on the Platform and for a reasonable period thereafter to allow for account recovery and to address any outstanding legal matters. Communication data, including messages sent through the Platform, is retained for as long as is necessary for the provision of the messaging service and to address any complaints or disputes. Payment transaction records are retained for the period required under Nigerian financial and tax regulations, which may be a minimum of six years. Technical logs and debugging data are retained only for as long as needed to address the technical issue to which they relate and are periodically purged.",
      "When your data is no longer required for any of these purposes, we will delete or anonymise it in a secure manner. Where deletion is not immediately possible — for example, where data is held in backup archives — we will isolate it from further processing and delete it as soon as practicable.",
    ],
  },
  {
    id: "your-rights",
    number: "14",
    title: "Your Rights",
    body: [
      "Subject to applicable law, you have the following rights in relation to your personal information held by TLS.",
      "Right of Access: You have the right to request a copy of the personal information we hold about you and to be informed of how it is being used.",
      "Right to Rectification: You have the right to request that we correct any inaccurate or incomplete personal information we hold about you. You can also update most of your profile information directly through your account settings.",
      "Right to Erasure: You have the right to request the deletion of your personal information where it is no longer necessary for the purposes for which it was collected, where you have withdrawn consent, or where the data has been unlawfully processed.",
      "Right to Restriction of Processing: You may request that we temporarily restrict the processing of your data in certain circumstances, such as while we investigate a dispute about its accuracy.",
      "Right to Data Portability: Where processing is based on your consent or the performance of a contract and is carried out by automated means, you may request that we provide your personal information in a structured, commonly used, machine-readable format.",
      "Right to Object: Where we rely on legitimate interests as the basis for processing your data, you have the right to object to that processing. We will assess your objection and cease processing unless we have compelling legitimate grounds that override your rights.",
      "Right to Withdraw Consent: Where we rely on your consent for any processing activity, you may withdraw that consent at any time. Withdrawal of consent will not affect the lawfulness of processing carried out prior to withdrawal.",
      "To exercise any of these rights, please contact us using the details provided in Section 20 of this Policy. We will respond to your request within a reasonable time and in any event within the timeframes required by applicable law. We may need to verify your identity before processing your request. If you are dissatisfied with our response, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) or such other supervisory authority as may be applicable in your jurisdiction.",
    ],
  },
  {
    id: "account-deletion",
    number: "15",
    title: "Account Deletion",
    body: [
      "You may delete your TLS account at any time from within the application. When you initiate account deletion, we will process the request and permanently remove your account and associated profile data from our active systems.",
      "Please note that certain information may be retained after account deletion where we are required to do so by law — for example, financial transaction records. Additionally, information that has been shared with other users — such as messages sent through the Platform — may persist in those users' inboxes. Anonymised or aggregated data derived from your account may also be retained as it can no longer be attributed to you individually.",
      "If you have a pending subscription or upcoming transactions, we recommend managing these before initiating account deletion. For assistance, contact us at thelegalspace01@gmail.com.",
    ],
  },
  {
    id: "childrens-privacy",
    number: "16",
    title: "Children's Privacy",
    body: [
      "The Platform is not designed for or directed at children. TLS caters to two distinct populations: legal practitioners and members of the public seeking legal services.",
      "For lawyers and law firms, registration on the Platform presupposes a Call to Bar qualification. In Nigeria, the typical age at which a legal practitioner is called to the Bar is approximately 23 years or older. We therefore do not expect any legal practitioner user of the Platform to be under the age of 18.",
      "For clients, we do not impose a specific minimum age beyond the general legal standard applicable to entering into contracts and using digital services. However, we expect that users engaging legal services are adults of legal capacity. We do not knowingly collect personal information from minors. If we become aware that a minor has registered on the Platform, we will take steps to delete their account and associated data promptly. If you are a parent or guardian and believe a minor has registered on the Platform, please contact us at thelegalspace01@gmail.com.",
    ],
  },
  {
    id: "marketing-communications",
    number: "17",
    title: "Marketing Communications",
    body: [
      "TLS does not currently send marketing communications, promotional emails, or newsletters. The communications you receive from us are transactional and service-related in nature, including account verification, payment confirmations, membership updates, and platform notifications.",
      "If and when we introduce marketing or promotional communications in the future, we will obtain your explicit consent before sending such messages and will provide you with a clear and easy mechanism to opt out at any time. This Privacy Policy will be updated to reflect any such changes.",
    ],
  },
  {
    id: "platform-notifications",
    number: "18",
    title: "Platform Notifications",
    body: [
      "TLS uses the following channels to send you operational notifications relating to your account and activities on the Platform: email, for account verification, password reset, membership confirmation, and system alerts; in-app notifications, for real-time alerts within the Platform including messages, follow notifications, and platform updates; and WhatsApp, where you have provided a phone number, to deliver certain account and activity notifications.",
      "You can manage your in-app notification preferences through your account settings. Some notifications — such as those relating to account security — are required for the operation of your account and cannot be disabled without affecting your ability to use the Platform.",
    ],
  },
  {
    id: "changes-to-this-privacy-policy",
    number: "19",
    title: "Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, the features and functionality of the Platform, applicable laws, or for other operational or legal reasons. When we make material changes to this Policy, we will notify you through the Platform and/or by email to the address associated with your account, and we will update the effective date at the top of the document.",
      "Your continued use of the Platform after any such update constitutes your acknowledgment of the revised Policy. If you do not agree with the updated Policy, you should cease use of the Platform and, if you wish, delete your account. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.",
    ],
  },
  {
    id: "contact-information",
    number: "20",
    title: "Contact Information",
    body: [
      "If you have any questions, concerns, or requests relating to this Privacy Policy or the way in which we handle your personal information, please contact us using any of the following:",
      "Platform: The Legal Space",
      "Website: thelegalspace.com",
      "Privacy Enquiries: thelegalspace01@gmail.com",
      "General Support: Contact Support",
      "We aim to respond to all privacy-related enquiries within 15 business days. For formal data subject requests — such as requests for access, rectification, or erasure — we will acknowledge receipt promptly and provide a substantive response within the timeframe required by applicable law.",
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

export default function PrivacyPolicyPage() {
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
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium"
            style={{ backgroundColor: TOKENS.accentTint, color: TOKENS.accent }}
          >
            Effective date: {EFFECTIVE_DATE}
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: TOKENS.accent }}
            />
            Version {VERSION}
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-[32px] leading-tight text-[#14140F] sm:text-[42px] lg:text-[48px]">
            Privacy Policy
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
                  <span className="mr-0 ">{section.number}.</span>
                  {section.title}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.body.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-[15px] leading-[1.7] text-[#3A3934]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.subsections?.map((sub) => (
                  <div
                    key={sub.id}
                    id={sub.id}
                    ref={(el) => {
                      sectionRefs.current[sub.id] = el;
                    }}
                    className="scroll-mt-20 mt-6 "
                  >
                    <h3 className="text-[16px] font-medium text-[#14140F]">
                      <span className="mr-2 text-[#8A887E]">{sub.number}</span>
                      {sub.title}
                    </h3>
                    <div className="mt-2 space-y-3">
                      {sub.body.map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-[15px] leading-[1.7] text-[#3A3934]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {sub.users && sub.users.length > 0 && (
                      <>
                        {sub.users.map((user, i) => (
                          <div key={i} className="mt-4 space-y-2">
                            <span className="text-[18px] font-dmSans underline text-[rgba(0, 0, 0, 0.8)]">
                              {user.role}
                            </span>
                            <p className="text-[14px] leading-[1.7] text-#000000CC]">
                              {user.body}
                            </p>
                          </div>
                        ))}{" "}
                      </>
                    )}
                  </div>
                ))}
              </article>
            ))}

            <p className="mt-4 text-[13px] text-[#8A887E]">
              Questions about this policy? Reach us at{" "}
              <a
                href="mailto:privacy@thelegalspace.com"
                className="text-[#2547D0] underline-offset-2 hover:underline"
              >
                privacy@thelegalspace.com
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
