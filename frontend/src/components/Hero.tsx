"use client";



import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

const Hero = () => {
  const { language } = useLanguage();
  const locale = ["en", "hi", "mr"].includes(language) ? language as "en" | "hi" | "mr" : "en";

  const texts = {
    en: {
      badge: "Livestock Safety Platform",
      titleLine1: "Monitor Antimicrobial Usage.",
      titleHighlight: "Ensure MRL Compliance.",
      titleLine2: "Protect Food Safety.",
      description:
        "A digital livestock monitoring platform that tracks antimicrobial usage, predicts residue risks, and prevents Maximum Residue Limit (MRL) violations in milk and meat production.",
      primaryCta: "Get Started",
      secondaryCta: "Learn More",
      statAccuracy: "Accuracy Rate",
      statFarms: "Farms Protected",
      statMonitoring: "Real-time Monitoring",
      complianceStatus: "Compliance Status",
      active: "Active",
    },
    hi: {
      badge: "पशुधन सुरक्षा प्लेटफ़ॉर्म",
      titleLine1: "एंटीमाइक्रोबियल उपयोग की निगरानी करें।",
      titleHighlight: "एमआरएल अनुपालन सुनिश्चित करें।",
      titleLine2: "खाद्य सुरक्षा की रक्षा करें।",
      description:
        "एक डिजिटल प्लेटफ़ॉर्म जो पशुधन में एंटीमाइक्रोबियल उपयोग को ट्रैक करता है, अवशेष जोखिम की भविष्यवाणी करता है और दूध व मांस उत्पादन में अधिकतम अवशेष सीमा (MRL) के उल्लंघन को रोकने में मदद करता है।",
      primaryCta: "शुरू करें",
      secondaryCta: "और जानें",
      statAccuracy: "सटीकता दर",
      statFarms: "सुरक्षित फार्म",
      statMonitoring: "24/7 रीयल‑टाइम मॉनिटरिंग",
      complianceStatus: "अनुपालन स्थिति",
      active: "सक्रिय",
    },
    mr: {
      badge: "पशुधन सुरक्षा प्लॅटफॉर्म",
      titleLine1: "अँटीमाइक्रोबियल वापराचे निरीक्षण करा.",
      titleHighlight: "MRL अनुपालन सुनिश्चित करा.",
      titleLine2: "अन्न सुरक्षेचे रक्षण करा.",
      description:
        "एक डिजिटल पशुधन देखरेख प्लॅटफॉर्म जो अँटीमाइक्रोबियल वापराचा मागोवा घेतो, अवशेषांच्या धोक्यांचा अंदाज लावतो आणि दूध आणि मांस उत्पादनात कमाल अवशेष मर्यादा (MRL) उल्लंघनास प्रतिबंध करतो.",
      primaryCta: "सुरू करा",
      secondaryCta: "अधिक जाणून घ्या",
      statAccuracy: "अचूकता दर",
      statFarms: "सुरक्षित शेते",
      statMonitoring: "24/7 रिअल-टाइम मॉनिटरिंग",
      complianceStatus: "अनुपालन स्थिती",
      active: "सक्रिय",
    },
  }[locale];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 justify-between overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 max-w-2xl"
      >
        {/* Badge */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">
            {texts.badge}
          </span>
        </motion.div>

        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
          {texts.titleLine1}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            {texts.titleHighlight}
          </span>{" "}
          {texts.titleLine2}
        </h1>

        <p className="mt-6 text-xl text-white/60 leading-relaxed">
          {texts.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-4 mt-8">
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 cursor-pointer rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {texts.primaryCta}
            </motion.button>
          </Link>

          <Link href="/about">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 cursor-pointer rounded-xl font-semibold hover:bg-white/15 hover:border-white/30 transition-all duration-300"
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {texts.secondaryCta}
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-8 mt-6 pt-6 border-t border-white/10"
        >
          {[
            { value: "99.9%", label: texts.statAccuracy },
            { value: "500+", label: texts.statFarms },
            { value: "24/7", label: texts.statMonitoring },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-emerald-400">
                {stat.value}
              </div>
              <div className="text-base text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Content - Visual */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex-shrink-0"
      >
        <div className="relative w-80 h-80 lg:w-96 lg:h-96">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-blue-500/30 rounded-3xl blur-2xl" />

          {/* Main card */}
          <div className="relative h-full p-6 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top icons */}
              <div className="flex justify-between">
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <svg
                    className="w-6 h-6 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>

              {/* Center visual */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>

              {/* Bottom status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{texts.complianceStatus}</span>
                <span className="text-emerald-400 font-medium">
                  {texts.active}
                </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;

