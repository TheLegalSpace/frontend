"use client";

import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import TermsOfUsePage from "../Components/Termsofusepage";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <TermsOfUsePage />
      <Footer visible={false} />
    </>
  );
}
