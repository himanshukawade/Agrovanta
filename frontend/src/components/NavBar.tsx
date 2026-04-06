


"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage, type SupportedLanguage } from "./LanguageProvider";

const NavBar = () => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!localStorage.getItem("agrovanta_token"));
  }, [pathname]);

  const hideAuthButtons = ["/signin", "/signup"].includes(pathname);

  const handleSignOut = () => {
    localStorage.removeItem("agrovanta_token");
    localStorage.removeItem("agrovanta_user");
    router.push("/");
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "mr", label: "मराठी (Marathi)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "gu", label: "ગુજરાતી (Gujarati)" },
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", label: "മലയാളം (Malayalam)" },
    { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  ] as const;

  const navTexts: Record<"en" | "hi" | "mr", { home: string, about: string, contacts: string, dashboard: string, settings: string, signIn: string, signOut: string }> = {
    en: {
      home: "Home",
      about: "About",
      contacts: "Contacts",
      dashboard: "Dashboard",
      settings: "Settings",
      signIn: "Sign In",
      signOut: "Sign Out",
    },
    hi: {
      home: "होम",
      about: "हमारे बारे में",
      contacts: "संपर्क",
      dashboard: "डैशबोर्ड",
      settings: "सेटिंग्स",
      signIn: "साइन इन",
      signOut: "साइन आउट",
    },
    mr: {
      home: "मुख्यपृष्ठ",
      about: "आमच्याबद्दल",
      contacts: "संपर्क",
      dashboard: "डॅशबोर्ड",
      settings: "सेटिंग्ज",
      signIn: "लॉग इन करा",
      signOut: "लॉग आउट",
    },
  };

  const texts = ["en", "hi", "mr"].includes(language) ? navTexts[language as "en" | "hi" | "mr"] : navTexts.en;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-5 lg:px-10 lg:py-6 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Agrovanta</h1>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-4 lg:gap-8">
          {[
            {
              name: mounted && isLoggedIn ? texts.dashboard : texts.home,
              path: mounted && isLoggedIn ? "/dashboard" : "/",
              icon: mounted && isLoggedIn
                ? "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
              show: true,
            },
            {
              name: texts.about,
              path: "/about",
              icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              show: true,
            },
            {
              name: texts.contacts,
              path: "/contact",
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              show: true,
            },
            {
              name: texts.settings,
              path: "/settings",
              icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z",
              show: mounted && isLoggedIn,
            },
          ].filter(item => item.show).map((item) => (
            <motion.li
              key={item.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={item.path}
                className="flex items-center gap-2.5 text-white/80 text-lg font-medium hover:text-emerald-400 cursor-pointer transition-colors duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.name}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Right side: Language selector + Sign In */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as SupportedLanguage)
              }
              className="bg-white/5 border border-white/20 text-white text-base rounded-xl px-4 py-3 pr-10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/70"
            >
              {languages.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-slate-900 text-white"
                >
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60 text-xs">
              ▼
            </span>
          </div>

          {!hideAuthButtons && (
            <motion.button
              onClick={mounted && isLoggedIn ? handleSignOut : () => router.push("/signin")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2.5 text-white whitespace-nowrap px-5 lg:px-7 py-3 cursor-pointer rounded-xl text-base lg:text-lg font-semibold shadow-lg transition-shadow duration-300 ${
                mounted && isLoggedIn
                  ? "bg-white/10 border border-white/20 hover:bg-white/15"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mounted && isLoggedIn
                    ? "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    : "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  }
                />
              </svg>
              {mounted && isLoggedIn ? texts.signOut : texts.signIn}
            </motion.button>
          )}
        </div>
      </motion.nav>
    </div>
  );
};

export default NavBar;
