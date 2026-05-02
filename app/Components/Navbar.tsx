// components/Navbar.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-42 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="The Legal Space"
            width={112}
            height={32}
            className="h-8 w-auto"
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Lawyer Login
            </button>
            <button className="text-sm bg-[#1A56DB] text-white px-4 py-2.5 rounded-lg hover:bg-[#1648b8] transition-colors">
              Find a Lawyer
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-3 border-t border-gray-100 mt-4">
            <button className="block w-full text-left text-sm text-gray-700 py-2">
              Lawyer Login
            </button>
            <button className="block w-full text-sm bg-[#1A56DB] text-white px-4 py-2.5 rounded-lg text-center">
              Find a Lawyer
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
