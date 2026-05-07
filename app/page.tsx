import Image from "next/image";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import HowItWorks from "./Components/HowItWorks";
import InfoSection from "./Components/InfoSection";
import Features from "./Components/Features";
import LegalInsights from "./Components/LegalInsights";
import HeroCTA from "./Components/HeroCTA";
import Footer from "./Components/Footer";
import UseCaseSection from "./Components/UseCaseSection";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />
      <InfoSection />
      <Features />
      <LegalInsights />
      <UseCaseSection />
      <HeroCTA />
      <Footer />
    </div>
  );
}
