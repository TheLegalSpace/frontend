// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next"; // ← Added Viewport import
import { ReactNode } from "react";
import { DM_Sans, Geist, Inter } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import Script from "next/script";

import { ServiceWorkerRegistration } from "./Components/ServiceWorkerRegistration";
// ✅ Metadata export - only non-viewport metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://www.thelegalspace.com"),
  title: {
    default: "The Legal Space",
    template: "%s | The Legal Space",
  },
  description: "Connecting Nigerians to verified lawyers and legal firms",
  keywords: ["Legal", "Lawyers", "Nigeria", "Legal Services"],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: "https://www.thelegalspace.com/",
    title: "The Legal Space",
    description: "Connecting Nigerians to verified lawyers and legal firms",
    siteName: "The Legal Space",
    images: [
      {
        url: "/Preview_img.png",
        width: 1200,
        height: 630,
        alt: "The Legal Space",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Legal Space",
    description: "Connecting Nigerians to verified lawyers and legal firms",
    images: ["/Preview_img.png"],
  },
  // ❌ Remove themeColor and viewport from here
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Legal Space",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any", type: "image/x-icon" },
      { url: "/pwa-192x192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/pwa-512x512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa-192x192.png?v=2", sizes: "192x192" }],
    shortcut: [{ url: "/favicon.ico?v=3" }],
  },
};

// ✅ Separate viewport export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A56DB",
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
        <ServiceWorkerRegistration />
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
