// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 md:py-8 px-4 sm:px-6 lg:px-12 xl:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="The Legal Space"
            width={112}
            height={32}
            className="h-7 md:h-8 w-auto"
          />
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-900 font-medium text-center">
          © 2026 TheLegalSpace. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-gray-900 font-medium hover:text-[#1A56DB] transition-colors duration-200"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-gray-900 font-medium hover:text-[#1A56DB] transition-colors duration-200"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}