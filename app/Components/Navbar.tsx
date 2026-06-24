"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  {
    label: "Resources",
    href: "#resources",
    dropdown: [
      { label: "Articles", href: "#resources" },
      { label: "Events", href: "#resources" },
      { label: "TLS Research", href: "#resources" },
      { label: "Legal News", href: "#resources" },
    ],
  },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ's", href: "#faqs" },
];

function scrollToSection(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 90;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const usePathName = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loginType = (type: "lawyer" | "user") => {
    localStorage.setItem("loginType", type);
    if (usePathName === "/signin") {
      window.location.reload();
      return;
    }
    router.replace("/signin");
  };

  return (
    <>
      {/* Floating navbar wrapper */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1440px] z-50 font-dmSans px-0 sm:px-0 lg:px-12 xl:p-0">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`flex items-center justify-between px-5 py-3 rounded-[999px] z-5000 border border-[#E5E7EB] transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 nav-glass"
              : "bg-white/90 backdrop-blur-sm shadow-md shadow-black/4"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="The Legal Space"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1 navLink">
            {navLinks.map((link) =>
              link.dropdown ? (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setResourcesOpen(true)}
                  onMouseLeave={() => setResourcesOpen(false)}
                >
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-dmSans"
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {resourcesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5 z-50"
                      >
                        {link.dropdown.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              scrollToSection(item.href);
                              setResourcesOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-dmSans"
                  >
                    {link.label}
                  </button>
                </li>
              ),
            )}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2 ctaLink">
            <button
              onClick={() => loginType("lawyer")}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Lawyer Login
            </button>
            <button
              onClick={() => loginType("user")}
              className="text-sm bg-[#1A56DB] text-white px-4 py-2.5 rounded-xl hover:bg-[#1648b8] transition-colors font-medium shadow-sm"
            >
              Find a lawyer
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hamBtn md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-3"
            >
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    scrollToSection(link.href);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-[#E5E7EB] mt-2 pt-2 space-y-1">
                <button
                  onClick={() => loginType("lawyer")}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Lawyer Login
                </button>
                <button
                  onClick={() => loginType("user")}
                  className="block w-full text-center bg-[#1A56DB] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#1648b8] transition-colors"
                >
                  Find a Lawyer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}