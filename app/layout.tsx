import "./globals.css";
 import type { Metadata } from "next";
import { ReactNode } from "react";
import { Geist } from 'next/font/google'
import { Instrument_Serif } from "next/font/google";

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

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${instrumentSerif.variable} bg-page-bg`} suppressHydrationWarning>
         <div>{children}</div>
      </body>
    </html>
  );
};

export default MainLayout;
