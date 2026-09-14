"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

/**
 * MembershipTermsPage
 * ---------------------
 * Sits below the existing navbar and above the existing footer.
 * Shares the same type + color tokens as PrivacyPolicyPage.tsx and
 * VerificationPolicyPage.tsx so all three legal pages read as one product.
 *
 * Same "On this page" scroll-spy nav pattern: sticky sidebar on desktop,
 * collapsible jump-to dropdown on mobile.
 *
 * Membership Terms adds one more wrinkle over Verification Policy: Section
 * 5 has two lettered subsections (Individual Lawyers / Law Firms), and one
 * list item ("practice areas") has its own nested sub-list. The BodyBlock
 * list items therefore accept either a plain string or a { text, sub }
 * shape for that one case.
 */

type ListItem = string | { text: string; sub: string[] };

type BodyBlock =
  | { type: "p"; text: string }
  | { type: "list"; ordered?: boolean; items: ListItem[] };

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
const list = (items: ListItem[], ordered = false): BodyBlock => ({
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
        "These Membership Terms (\u201CTerms\u201D) govern the Community Membership and Professional Membership plans offered by The Legal Space (\u201CTLS\u201D, \u201Cwe\u201D, \u201Cour\u201D, or \u201Cus\u201D). By registering for or subscribing to a membership plan, you agree to be bound by these Terms, together with our Terms of Service, Privacy Policy, and any other applicable policies published by TLS.",
      ),
      p(
        "Membership provides users with access to features and services based on the plan selected. Certain features are available only to Professional Members, while others are available to all users through the Community Membership.",
      ),
    ],
  },
  {
    id: "membership-plans",
    number: "2",
    title: "Membership Plans",
    body: [
      p("TLS currently offers two membership plans:"),
      list(["Community Membership (Free)", "Professional Membership (Paid)"]),
      p("Membership benefits differ depending on whether the account is registered as an individual lawyer or a law firm."),
      p("TLS may introduce additional membership plans or modify existing plans in the future. Any such changes will be communicated in accordance with these Terms."),
    ],
  },
  {
    id: "community-membership",
    number: "3",
    title: "Community Membership",
    body: [
      p("Community Membership is available at no cost and is intended for lawyers and law firms wishing to establish their presence on The Legal Space."),
      p("Community Members may access a range of core platform features, including:"),
      list([
        "Professional profile creation.",
        "Publication of articles.",
        "Community visibility.",
        "Access to public events.",
        "Access to selected TLS services.",
      ]),
      p("Community Membership does not include access to premium features reserved for Professional Members."),
    ],
  },
  {
    id: "professional-membership",
    number: "4",
    title: "Professional Membership",
    body: [
      p("Professional Membership is a paid subscription designed for legal professionals and law firms seeking enhanced visibility and access to premium tools and services available on TLS."),
      p("Professional Membership is billed every six (6) months."),
      p("Subscription fees are displayed before purchase and must be paid using the payment methods supported by TLS."),
      p("Professional Membership remains active until the end of the applicable billing period unless cancelled in accordance with these Terms."),
    ],
  },
  {
    id: "professional-membership-features",
    number: "5",
    title: "Professional Membership Features",
    body: [],
    subsections: [
      {
        id: "individual-lawyers",
        number: "A",
        title: "Individual Lawyers",
        body: [
          p("Professional Membership for individual lawyers includes:"),
          list([
            "Everything included in Community Membership.",
            "Professional profile enhancements.",
            {
              text: "Ability to list up to two (2) practice areas, consisting of:",
              sub: ["One (1) Primary Practice Area.", "One (1) Secondary Practice Area."],
            },
            "Access to client leads.",
            "Direct messaging.",
            "TLS Research.",
            "TLS Library.",
            "TLS News.",
            "Priority visibility within the platform.",
            "Professional opportunities made available through TLS.",
            "Other premium features introduced from time to time.",
          ]),
        ],
      },
      {
        id: "law-firms",
        number: "B",
        title: "Law Firms",
        body: [
          p("Professional Membership for law firms includes:"),
          list([
            "Everything included in Community Membership.",
            "Firm profile and branding.",
            "Ability to list up to seven (7) practice areas.",
            "Access to client leads.",
            "Direct messaging.",
            "TLS Research.",
            "TLS Library.",
            "TLS News.",
            "Priority visibility across the platform.",
            "Professional opportunities.",
            "Additional premium tools designed for law firms as introduced by TLS.",
          ]),
          p("Law firms receive expanded profile capabilities to better represent the firm's areas of practice and professional identity."),
        ],
      },
    ],
  },
  {
    id: "subscription-fees",
    number: "6",
    title: "Subscription Fees",
    body: [
      p("Professional Membership requires payment of the subscription fee displayed at the time of purchase."),
      p("As of the Effective Date of these Terms:"),
      list([
        "Professional Membership (Lawyer): Pricing as displayed within the platform.",
        "Professional Membership (Law Firm): Pricing as displayed within the platform.",
        "Community Membership: Free.",
      ]),
      p("TLS reserves the right to revise subscription fees at any time. Any changes will apply prospectively and will not affect an active subscription until its next renewal."),
    ],
  },
  {
    id: "billing-and-renewal",
    number: "7",
    title: "Billing and Renewal",
    body: [
      p("Professional Membership subscriptions renew automatically at the end of each six-month billing cycle unless automatic renewal has been disabled or the subscription has been cancelled before renewal."),
      p("By subscribing, you authorise TLS and its payment processor to charge the applicable subscription fee using your selected payment method."),
      p("It is your responsibility to ensure that your payment information remains valid and up to date."),
      p("If a renewal payment cannot be processed, TLS may suspend access to Professional Membership benefits until payment has been successfully completed."),
    ],
  },
  {
    id: "payment-processing",
    number: "8",
    title: "Payment Processing",
    body: [
      p("Subscription payments are securely processed through TLS's authorised payment providers."),
      p("TLS does not process payments manually and relies on third-party payment processors to facilitate secure transactions."),
      p("By making a payment, you also agree to the applicable terms and conditions of the payment provider."),
    ],
  },
  {
    id: "upgrading-membership",
    number: "9",
    title: "Upgrading Membership",
    body: [
      p("Community Members may upgrade to Professional Membership at any time through their account settings."),
      p("Professional Membership benefits become available after successful payment and activation of the subscription."),
    ],
  },
  {
    id: "downgrading-or-cancelling-membership",
    number: "10",
    title: "Downgrading or Cancelling Membership",
    body: [
      p("Professional Members may cancel their subscription at any time."),
      p("Cancellation prevents future renewals but does not entitle the member to a refund for the remaining portion of the current billing period unless otherwise required by applicable law."),
      p("Upon expiry of the subscription, the account will revert to Community Membership."),
      p("Access to Professional-only features will cease once the Professional Membership expires."),
    ],
  },
  {
    id: "changes-to-membership-benefits",
    number: "11",
    title: "Changes to Membership Benefits",
    body: [
      p("TLS continually improves its platform."),
      p("Accordingly, we may add, modify, replace, or remove membership features from time to time."),
      p("Where changes materially affect a paid membership, TLS will provide reasonable notice where practicable."),
    ],
  },
  {
    id: "acceptable-use",
    number: "12",
    title: "Acceptable Use",
    body: [
      p("Membership benefits are personal to the registered account holder and may not be transferred, sold, shared, or assigned to another person or organisation except where expressly permitted by TLS."),
      p("Users must not misuse membership benefits or attempt to obtain access to premium features through unauthorised means."),
    ],
  },
  {
    id: "suspension-or-termination",
    number: "13",
    title: "Suspension or Termination",
    body: [
      p("TLS reserves the right to suspend or terminate a membership where:"),
      list([
        "These Terms have been violated.",
        "Fraudulent payment activity is detected.",
        "Verification requirements are no longer satisfied.",
        "The account has been used for unlawful or prohibited purposes.",
        "Continued access would create legal, security, or operational risks.",
      ]),
      p("Suspension or termination does not automatically entitle the member to a refund."),
    ],
  },
  {
    id: "refunds",
    number: "14",
    title: "Refunds",
    body: [
      p("Subscription fees are generally non-refundable once payment has been successfully processed."),
      p("Refunds may be provided only where required by applicable law or where TLS determines, in its sole discretion, that exceptional circumstances justify a refund."),
    ],
  },
  {
    id: "changes-to-these-membership-terms",
    number: "15",
    title: "Changes to these Membership Terms",
    body: [
      p("TLS may revise these Membership Terms from time to time."),
      p("The latest version will always be available through the platform."),
      p("Continued use of Professional Membership after revised Terms become effective constitutes acceptance of those updated Terms."),
    ],
  },
  {
    id: "contact-us",
    number: "16",
    title: "Contact Us",
    body: [
      p("If you have any questions regarding these Membership Terms or your subscription, please contact us:"),
      p("The Legal Space (TLS)"),
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

function ListItems({ items }: { items: ListItem[] }) {
  return (
    <>
      {items.map((item, j) =>
        typeof item === "string" ? (
          <li key={j}>{item}</li>
        ) : (
          <li key={j}>
            {item.text}
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {item.sub.map((subItem, k) => (
                <li key={k}>{subItem}</li>
              ))}
            </ul>
          </li>
        ),
      )}
    </>
  );
}

function BodyBlocks({ blocks }: { blocks: BodyBlock[] }) {
  if (blocks.length === 0) return null;
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
            <ListItems items={block.items} />
          </ol>
        ) : (
          <ul
            key={i}
            className="list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-[#3A3934]"
          >
            <ListItems items={block.items} />
          </ul>
        ),
      )}
    </div>
  );
}

export default function MembershipTermsPage() {
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
            Membership Terms
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
                      <span className="mr-2 text-[#8A887E]">{sub.number}.</span>
                      {sub.title}
                    </h3>
                    <BodyBlocks blocks={sub.body} />
                  </div>
                ))}
              </article>
            ))}

            <p className="mt-4 text-[13px] text-[#8A887E]">
              Questions about membership?{" "}
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