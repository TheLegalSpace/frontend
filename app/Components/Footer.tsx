import Image from "next/image"
import Link from "next/link"


export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={112} height={32} />
        </div>

        {/* Copyright */}
        <p className="text-sm text-black font-medium font-['Geist']">
          © 2026 TheLegalSpace. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-black font-medium hover:text-gray-900 transition-colors duration-200 font-['Geist']"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-black font-medium  hover:text-gray-900 transition-colors duration-200 font-['Geist']"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}