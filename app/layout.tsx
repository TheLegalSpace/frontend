import "./globals.css";
 import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "TheLegalSpace",
  description: "Legal Space",
  keywords: "Legal, Space, LegalSpace, Law, Lawyer",
};

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-page-bg" suppressHydrationWarning>
         <div>{children}</div>
      </body>
    </html>
  );
};

export default MainLayout;
