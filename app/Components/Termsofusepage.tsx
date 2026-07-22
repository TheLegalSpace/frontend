"use client";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white px-6 pt-28 pb-12 md:px-12 xl:px-0">
      <div className="max-w-360 mx-auto">

        {/* Effective date */}
        <p className="text-center text-[13px] text-blue-600 mb-3">
          Effective Date: 18 July 2025 | Version 1.0
        </p>

        {/* Title */}
        <h1 className="text-[36px] font-['Instrument_Serif'] text-center text-gray-900 mb-10">
          Terms Of Use
        </h1>

        {/* ── 1. Introduction ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">1. Introduction</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            These Terms of Use ("Terms") govern your access to and use of The Legal Space platform ("TLS", "we", "us", or "our"), including our website at thelegalspace.com and our mobile application (collectively, the "Platform"). By creating an account, accessing, or using the Platform in any way, you agree to be bound by these Terms in full. If you do not agree with any part of these Terms, you must not use the Platform.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS is a Nigerian legal technology platform designed to connect lawyers, law firms, and clients within a structured professional community. We provide tools for professional visibility, community engagement, lawyer–client matching, messaging, and related legal technology services.
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            These Terms constitute a legally binding agreement between you and TLS. We encourage you to read them carefully before using the Platform.
          </p>
        </section>

        {/* ── 2. Definitions ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">2. Definitions</h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px] text-gray-700 leading-7">
            <li>"Platform" means the TLS website at thelegalspace.com and the TLS mobile application, collectively.</li>
            <li>"User" means any individual or entity that creates an account on or accesses the Platform, including lawyers, law firms, and clients.</li>
            <li>"Lawyer" means an individual legal practitioner registered on the Platform as a professional user.</li>
            <li>"Law Firm" means a legal practice or organisation registered on the Platform as a firm account.</li>
            <li>"Client" means an individual registered on the Platform for the purpose of finding and connecting with legal professionals.</li>
            <li>"Membership" means a paid subscription plan that unlocks additional features on the Platform, including Professional Membership.</li>
            <li>"Content" means any text, images, documents, files, posts, messages, or other material uploaded, posted, or transmitted through the Platform by a User.</li>
            <li>"AI Matching" means the artificial intelligence feature on the Platform that matches clients with lawyers based on the client's legal issue and the lawyer's professional profile.</li>
            <li>"Verification" means TLS's process of confirming a lawyer's professional credentials, including their Call to Bar certificate and liveness check.</li>
          </ul>
        </section>

        {/* ── 3. Eligibility ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">3. Eligibility</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">3.1 General Eligibility</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            To use the Platform, you must be of legal capacity to enter into a binding agreement under the laws of your jurisdiction. You must not be prohibited from using the Platform under any applicable law.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">3.2 Lawyers and Law Firms</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            To register as a lawyer or law firm on the Platform, you must be a qualified legal practitioner who has been duly called to the Bar in your jurisdiction. TLS requires submission of your Call to Bar certificate and completion of a liveness check as part of the registration process. By registering as a lawyer, you represent and warrant that the credentials you submit are genuine, current, and accurately reflect your professional standing.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">3.3 Clients</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            Clients must be individuals of legal capacity seeking legal information or services. By registering as a client, you represent that you are an adult capable of entering into legal agreements.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">3.4 Accurate Information</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            You represent and warrant that all information you provide during registration and throughout your use of the Platform is true, accurate, current, and complete. You agree to update your information promptly if it changes. TLS reserves the right to suspend or terminate any account where information is found to be false, misleading, or incomplete.
          </p>
        </section>

        {/* ── 4. Account Registration and Security ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">4. Account Registration and Security</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">4.1 Account Creation</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            You may create an account on TLS using an email address and password or through Google Sign-In. Where required, you will complete OTP verification and email verification before gaining full access to the Platform. Each individual or entity may hold only one active account on the Platform.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">4.2 Account Security</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must not share your credentials with any other person. You agree to notify TLS immediately at{" "}
            <a href="mailto:thelegalspace01@gmail.com" className="text-blue-600 hover:underline">
              thelegalspace01@gmail.com
            </a>{" "}
            if you become aware of any unauthorised use of your account or any security breach affecting your credentials. TLS will not be liable for any loss or damage arising from your failure to maintain the security of your account.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">4.3 Account Types</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            TLS offers three account types: Lawyer, Law Firm, and Client. Each account type has its own permissions, features, and verification requirements. You must register under the account type that accurately reflects your identity and intended use of the Platform.
          </p>
        </section>

        {/* ── 5. Lawyer Verification ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">5. Lawyer Verification</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS takes the integrity of its professional community seriously. All lawyers registering on the Platform are required to submit a valid Call to Bar certificate and complete a liveness check as part of the onboarding process. TLS reviews these submissions and reserves the right to reject or suspend any lawyer account where credentials cannot be verified or are found to be invalid.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            Submission of false, forged, or misleading credentials is a serious breach of these Terms and may result in immediate and permanent termination of your account. TLS reserves the right to report such conduct to the appropriate regulatory authorities, including the Nigerian Bar Association.
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            Completion of the verification process does not constitute endorsement by TLS of any lawyer's skills, competence, or suitability for any particular legal matter. Users are encouraged to exercise their own judgment when selecting legal representation.
          </p>
        </section>

        {/* ── 6. Memberships and Payments ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">6. Memberships and Payments</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">6.1 Membership Plans</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            TLS offers membership plans that unlock additional features on the Platform. The features available under each membership tier are described on the Platform and are subject to change. Law firms may add up to seven member lawyers under a single firm account.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">6.2 Payment Processing</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            All payments on the Platform are processed through Paystack, our third-party payment processor. By making a payment on the Platform, you agree to Paystack's terms and conditions. TLS does not store your card details. All financial transactions are subject to the terms imposed by Paystack.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">6.3 Membership Fees and Renewals</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            Membership fees are as published on the Platform from time to time. Unless otherwise stated, memberships are recurring and will renew automatically at the end of each billing cycle. It is your responsibility to manage your subscription, including cancellation, through your account settings before the renewal date.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">6.4 Refund Policy — Memberships</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            All membership payments are non-refundable. Once a membership payment has been processed, TLS will not issue a refund for any reason, including early cancellation, non-use, or dissatisfaction with the Platform. By subscribing to a membership, you acknowledge and accept this policy.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">6.5 Event Publication Fees</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            TLS charges a fee for the publication of events on the Platform. Event publication fees are non-refundable once an event has been published. However, where TLS is unable to verify the legitimacy of an event or has reasonable grounds to doubt the accuracy or appropriateness of an event submission, TLS will contact the event organiser directly. Where a resolution cannot be reached and the event is not published, a refund will be issued. TLS's determination in such matters is final.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">6.6 Price Changes</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            TLS reserves the right to modify its pricing at any time. Where a price change affects an existing subscription, we will provide reasonable advance notice through the Platform or by email. Your continued use of the Platform following such notice constitutes your acceptance of the revised pricing.
          </p>
        </section>

        {/* ── 7. Platform Features and Permitted Use ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">7. Platform Features and Permitted Use</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">7.1 AI-Powered Lawyer Matching</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS provides an AI-powered matching feature that enables clients to describe their legal issue and receive a recommendation of lawyers on the Platform best suited to assist them. The matching system draws on publicly available data and the professional profiles of lawyers who hold an active Professional Membership. Clients do not have the ability to directly browse all lawyer profiles or initiate direct contact with a lawyer outside of the matching process.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            The AI matching feature is an assistive tool only. TLS does not guarantee the accuracy, completeness, or suitability of any match. The final decision to engage any lawyer rests entirely with the client, and any engagement is a matter solely between the client and the lawyer.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">7.2 Messaging</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            Once a client has been matched with a lawyer through the AI matching feature, the Platform enables direct messaging between the two parties. Users may send text messages, documents, images, PDFs, and other files through the messaging feature. You are solely responsible for the content of any messages you send and any files you share. TLS is not a party to any communication between a lawyer and a client and does not monitor message content except where required for safety, security, or legal compliance purposes.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">7.3 Community Features</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            The TLS community allows users to create posts, follow lawyers, report content, and engage with the professional legal community on the Platform. Certain community features are available only to users with an active Professional Membership. Community participation is subject to the conduct standards set out in Section 8 of these Terms.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">7.4 Permitted Use</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            You may use the Platform only for lawful purposes and in accordance with these Terms. You agree to use the Platform in a manner consistent with its intended purpose as a legal technology and professional networking platform.
          </p>
        </section>

        {/* ── 8. Prohibited Conduct ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">8. Prohibited Conduct</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            You agree that you will not, under any circumstances:
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            Use the Platform for any purpose that is unlawful, fraudulent, or harmful to others; submit false, misleading, or fabricated credentials or profile information; impersonate any person, entity, or professional qualification; use the Platform to solicit clients or provide legal services through channels outside the Platform in a manner that deliberately circumvents TLS's systems or membership requirements; upload, post, or transmit content that is defamatory, obscene, threatening, harassing, discriminatory, or otherwise objectionable; upload or share any content that infringes the intellectual property rights of any third party; send unsolicited communications, spam, or repeated requests that serve no legitimate purpose; use automated scripts, bots, or other automated means to access or interact with the Platform; attempt to gain unauthorised access to any part of the Platform or any other user's account; engage in any conduct that disrupts, damages, or interferes with the operation of the Platform or the experience of other users; or use the Platform to facilitate any activity that would constitute a criminal offence or give rise to civil liability.
          </p>
        </section>

        {/* ── 9. Content and Intellectual Property ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">9. Content and Intellectual Property</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">9.1 Your Content</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            You retain full ownership of all Content you upload, post, or share on the Platform. By submitting Content to the Platform, you grant TLS a limited, non-exclusive, royalty-free licence to display, store, and distribute that Content on the Platform for the purpose of operating and delivering the Platform's features to you and other users. This licence exists only for as long as your account remains active. Upon deletion of your account, TLS's right to display your Content will cease, subject to any retention obligations described in our Privacy Policy.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            You represent and warrant that you have all necessary rights to the Content you submit and that your Content does not infringe the rights of any third party.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">9.2 TLS Intellectual Property</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            All intellectual property on the Platform that is not User Content — including but not limited to the TLS name, logo, branding, design, software, technology, and written materials — is owned by or licensed to TLS and is protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use TLS's intellectual property for any purpose outside of your use of the Platform.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">9.3 Feedback</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            If you provide TLS with feedback, suggestions, or ideas regarding the Platform, you grant TLS the right to use that feedback for any purpose without any obligation to compensate you.
          </p>
        </section>

        {/* ── 10. Third-Party Services and Links ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">10. Third-Party Services and Links</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            The Platform integrates with and may contain links to third-party services, including Paystack for payment processing, Google Gemini for AI functionality, and WhatsApp for notifications. These third-party services are governed by their own terms and privacy policies. TLS is not responsible for the practices, content, or availability of any third-party service, and your use of such services is at your own risk.
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            The inclusion of any third-party link or integration does not constitute an endorsement by TLS of that service or its operators.
          </p>
        </section>

        {/* ── 11. Disclaimers ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">11. Disclaimers</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">11.1 No Legal Advice</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            TLS is a technology platform. Nothing on the Platform — including any content generated by the AI matching feature, any lawyer profiles, or any community posts — constitutes legal advice. The AI matching feature provides recommendations based on professional profile data and publicly available information; it is not a substitute for qualified legal counsel. Any legal advice you receive is provided by the individual lawyer you engage and is entirely their professional responsibility.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">11.2 No Endorsement of Lawyers</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            TLS does not endorse, recommend, or vouch for the competence, quality, or suitability of any lawyer or law firm listed on the Platform. Verification of credentials confirms that a lawyer has been called to the Bar; it does not assess their skill, experience, or fitness for any specific legal matter.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">11.3 Platform Availability</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            TLS provides the Platform on an "as is" and "as available" basis. We do not guarantee that the Platform will be uninterrupted, error-free, or free from security vulnerabilities. We reserve the right to modify, suspend, or discontinue any feature or the Platform as a whole at any time, with or without notice.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">11.4 Limitation of Liability</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            To the fullest extent permitted by applicable law, TLS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform, including damages for loss of data, loss of revenue, or loss of business opportunity, even if TLS has been advised of the possibility of such damages. TLS's total liability to you for any claim arising out of or in connection with these Terms or the Platform shall not exceed the amount you have paid to TLS in the three months preceding the event giving rise to the claim.
          </p>
        </section>

        {/* ── 12. Account Suspension and Termination ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">12. Account Suspension and Termination</h2>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">12.1 Termination by You</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            You may delete your account at any time from within the application. Deletion of your account will terminate your access to the Platform. Membership fees already paid will not be refunded upon voluntary termination.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">12.2 Suspension or Termination by TLS</h3>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS reserves the right to suspend or permanently terminate your account at any time, with or without prior notice, where:
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            You have submitted spam, repeated unsolicited requests, or have demonstrated a pattern of cancelling in bad faith that disrupts the Platform or other users; you have been the subject of multiple verified reports from other users regarding your conduct on the Platform; you have submitted false, forged, or misleading credentials during or after the verification process; you have violated any provision of these Terms or any applicable law; or TLS determines in its reasonable discretion that your continued presence on the Platform poses a risk to other users, the Platform's integrity, or TLS's reputation.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-4">
            Where possible and where circumstances permit, TLS will notify you of the grounds for suspension or termination. However, TLS is not obligated to provide advance notice where the breach is serious, where there is a risk of harm, or where doing so would be contrary to applicable law.
          </p>

          <h3 className="text-[14px] font-semibold text-gray-900 mb-2">12.3 Effect of Termination</h3>
          <p className="text-[14px] text-gray-700 leading-7">
            Upon termination of your account, your right to access and use the Platform ceases immediately. TLS may retain certain data following termination in accordance with our Privacy Policy and applicable legal obligations.
          </p>
        </section>

        {/* ── 13. Dispute Resolution Between Users ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">13. Dispute Resolution Between Users</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS is a technology platform and is not a party to any relationship, agreement, or dispute between a lawyer and a client that originates from or is facilitated through the Platform. Any dispute arising between a lawyer and a client — including disputes about the quality of legal services, fees, or professional conduct — is a matter entirely between those parties.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS does not mediate, arbitrate, or adjudicate disputes between users. Users are encouraged to resolve disputes directly and, where appropriate, through the relevant professional regulatory bodies, including the Nigerian Bar Association, or through applicable legal processes.
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            Users may report conduct that violates these Terms using the reporting features available on the Platform. TLS will review such reports and take action where a violation of these Terms is found, but such action does not constitute legal or professional adjudication of the underlying dispute.
          </p>
        </section>

        {/* ── 14. Governing Law and Jurisdiction ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">14. Governing Law and Jurisdiction</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            These Terms are governed by and shall be construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. The Platform is operated from Nigeria and is primarily intended for users in Nigeria, though we welcome users from other jurisdictions.
          </p>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            Where you are accessing the Platform from outside Nigeria, you do so on your own initiative and are responsible for compliance with the laws of your local jurisdiction to the extent they apply. Nothing in these Terms limits TLS's ability to seek injunctive or other equitable relief in any jurisdiction where necessary to protect its rights.
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            Any dispute arising out of or in connection with these Terms that cannot be resolved amicably shall be subject to the exclusive jurisdiction of the courts of Nigeria.
          </p>
        </section>

        {/* ── 15. Changes to These Terms ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">15. Changes to These Terms</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            TLS reserves the right to update or modify these Terms at any time. When we make material changes, we will notify you through the Platform and/or by email to the address associated with your account, and we will update the effective date at the top of this document.
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            Your continued use of the Platform following the publication of revised Terms constitutes your acceptance of those changes. If you do not agree with the revised Terms, you must cease using the Platform and, if you wish, delete your account.
          </p>
        </section>

        {/* ── 16. Severability ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">16. Severability</h2>
          <p className="text-[14px] text-gray-700 leading-7">
            If any provision of these Terms is found to be unlawful, void, or unenforceable under applicable law, that provision shall be deemed severable from the remainder of these Terms and shall not affect the validity and enforceability of the remaining provisions.
          </p>
        </section>

        {/* ── 17. Entire Agreement ── */}
        <section className="mb-7">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">17. Entire Agreement</h2>
          <p className="text-[14px] text-gray-700 leading-7">
            These Terms, together with our Privacy Policy and any other policies published on the Platform, constitute the entire agreement between you and TLS with respect to your use of the Platform and supersede all prior agreements, representations, and understandings relating to the same subject matter.
          </p>
        </section>

        {/* ── 18. Contact Information ── */}
        <section className="mb-12">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">18. Contact Information</h2>
          <p className="text-[14px] text-gray-700 leading-7 mb-3">
            If you have any questions about these Terms or your use of the Platform, please contact us:
          </p>
          <p className="text-[14px] text-gray-700 leading-7">
            Platform: The Legal Space<br />
            Website: thelegalspace.com<br />
            Email:{" "}
            <a href="mailto:thelegalspace01@gmail.com" className="text-blue-600 hover:underline">
              thelegalspace01@gmail.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}