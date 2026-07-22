"use client";

import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import PrivacyPolicyPage from "../Components/Privacypolicypage";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <PrivacyPolicyPage />
      <Footer visible={false} />
    </>
  );
}
