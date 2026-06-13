// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { DM_Sans, Geist, Inter } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "TheLegalSpace",
  description: "Legal Space",
  keywords: "Legal, Space, LegalSpace, Law, Lawyer",
};

interface MainLayoutProps {
  children: ReactNode;
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmSans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${instrumentSerif.variable} ${dmSans.variable} ${inter.variable} bg-page-bg`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>

        {/* ✅ Inside body, afterInteractive loads after page is ready */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
};

export default MainLayout;
