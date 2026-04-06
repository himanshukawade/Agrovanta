"use client";


import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageProvider";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

const steps: { en: Step; hi: Step }[] = [
  {
    en: {
      number: "01",
      title: "Register Farms & Livestock",
      description:
        "Farm owners register livestock details including species, age, and identification data.",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    hi: {
      number: "01",
      title: "फार्म और पशुधन पंजीकरण",
      description:
        "फार्म मालिक पशुधन के विवरण जैसे प्रजाति, आयु और पहचान संबंधी जानकारी दर्ज करते हैं।",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
  },
  {
    en: {
      number: "02",
      title: "Log Antimicrobial Usage",
      description:
        "Veterinarians or farmers record drug administration details such as compound, dosage, and treatment duration.",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
    hi: {
      number: "02",
      title: "एंटीमाइक्रोबियल उपयोग दर्ज करें",
      description:
        "पशु चिकित्सक या किसान दवा का नाम, मात्रा और उपचार अवधि सहित सभी विवरण दर्ज करते हैं।",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
  },
  {
    en: {
      number: "03",
      title: "Automated Compliance Monitoring",
      description:
        "The system calculates withdrawal periods, estimates residue risk, and flags potential violations before products enter the supply chain.",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
    hi: {
      number: "03",
      title: "स्वचालित अनुपालन मॉनिटरिंग",
      description:
        "सिस्टम वापसी अवधि की गणना करता है, अवशेष जोखिम का अनुमान लगाता है और उत्पाद सप्लाई चेन में जाने से पहले संभावित उल्लंघनों को फ़्लैग करता है।",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  },
];

const STEP_DURATION = 4000;
const TRANSITION_DURATION = 0.6;

const Steps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "hi";

  const headerTexts = {
    en: {
      badge: "How It Works",
      title: "Simple. Structured. Compliant.",
      subtitle: "Three steps to complete antimicrobial compliance",
      ariaLabel: "How it works",
      stepText: "Step",
      ofText: "of",
    },
    hi: {
      badge: "कैसे काम करता है",
      title: "सरल. संरचित. अनुपालक.",
      subtitle: "एंटीमाइक्रोबियल अनुपालन पूरा करने के तीन चरण",
      ariaLabel: "यह कैसे काम करता है",
      stepText: "चरण",
      ofText: "में से",
    },
  }[locale];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative w-full min-h-[600px] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-label={headerTexts.ariaLabel}
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            {headerTexts.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {headerTexts.title.split(". ")[0]}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {headerTexts.title.split(". ")[1] || ""}
            </span>
          </h2>
          <p className="mt-4 text-white/60 text-lg">
            {headerTexts.subtitle}
          </p>
        </motion.header>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className="group relative h-2 w-16 md:w-24 rounded-full bg-white/10 overflow-hidden transition-all duration-300 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label={`${headerTexts.stepText} ${index + 1}`}
              aria-current={currentStep === index ? "step" : undefined}
            >
              {currentStep === index && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: STEP_DURATION / 1000, ease: "linear" }}
                />
              )}
              {currentStep > index && (
                <div className="absolute inset-0 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Step Cards */}
        <div className="relative h-[360px] md:h-[300px]">
          <AnimatePresence mode="wait">
            <motion.article
              key={currentStep}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: TRANSITION_DURATION,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >
              <div className="h-full p-8 md:p-12 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <span className="text-7xl md:text-8xl font-bold bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {steps[currentStep][locale].number}
                    </span>
                    <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                      <svg
                        className="w-8 h-8 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={steps[currentStep][locale].icon}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                      {steps[currentStep][locale].title}
                    </h3>
                    <p className="text-white/60 text-lg leading-relaxed">
                      {steps[currentStep][locale].description}
                    </p>

                    {/* Step indicator dots */}
                    <div className="flex items-center gap-2 mt-8">
                      {steps.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentStep
                              ? "w-8 bg-gradient-to-r from-blue-500 to-cyan-500"
                              : "w-2 bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Step Navigation Hints */}
        <div className="flex justify-center mt-8">
          <p className="text-sm text-white/40">
            {headerTexts.stepText} {currentStep + 1} {headerTexts.ofText}{" "}
            {steps.length}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Steps;

