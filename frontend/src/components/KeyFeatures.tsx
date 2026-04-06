"use client";


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageProvider";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: { en: Feature; hi: Feature }[] = [
  {
    en: {
      id: 1,
      title: "Real-Time Withdrawal Monitoring",
      description:
        "Automatically determines whether milk or meat is safe for consumption based on scientifically validated withdrawal timelines.",
      icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    },
    hi: {
      id: 1,
      title: "रीयल‑टाइम वापसी अवधि मॉनिटरिंग",
      description:
        "वैज्ञानिक रूप से सत्यापित वापसी समयरेखाओं के आधार पर स्वचालित रूप से तय करता है कि दूध या मांस उपभोग के लिए सुरक्षित है या नहीं।",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  },
  {
    en: {
      id: 2,
      title: "MRL Risk Prediction Engine",
      description:
        "Estimates antimicrobial residue levels using pharmacokinetic decay modeling to predict Maximum Residue Limit (MRL) compliance.",
      icon: (
      <svg
        className="w-6 h-6"
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
    ),
    },
    hi: {
      id: 2,
      title: "MRL जोखिम पूर्वानुमान इंजन",
      description:
        "फार्माकोकाइनेटिक डिके मॉडलिंग का उपयोग करके एंटीमाइक्रोबियल अवशेष स्तर का अनुमान लगाता है और अधिकतम अवशेष सीमा (MRL) अनुपालन की भविष्यवाणी करता है।",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
    },
  },
  {
    en: {
      id: 3,
      title: "AMU Pattern Detection",
      description:
        "Identifies abnormal antimicrobial usage trends at the farm level through behavioral and statistical anomaly detection.",
      icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    },
    hi: {
      id: 3,
      title: "AMU पैटर्न डिटेक्शन",
      description:
        "व्यवहारिक तथा सांख्यिकीय विसंगति पहचान के माध्यम से फार्म स्तर पर एंटीमाइक्रोबियल उपयोग के असामान्य पैटर्न की पहचान करता है।",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
  },
  {
    en: {
      id: 4,
      title: "Role-Based Access Control",
      description:
        "Separate dashboards and permissions for Farmers, Veterinarians, Inspectors, and Administrators to ensure structured data governance.",
      icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    },
    hi: {
      id: 4,
      title: "भूमिका‑आधारित एक्सेस नियंत्रण",
      description:
        "किसान, पशु चिकित्सक, निरीक्षक और प्रशासक के लिए अलग‑अलग डैशबोर्ड और अनुमतियाँ, ताकि डेटा गवर्नेंस सुव्यवस्थित रहे।",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  },
  {
    en: {
      id: 5,
      title: "Regulatory Reporting & Export Tools",
      description:
        "Generate compliance-ready reports for auditing, traceability, and regulatory submission in standardized formats.",
      icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    },
    hi: {
      id: 5,
      title: "रेगुलेटरी रिपोर्टिंग और एक्सपोर्ट टूल्स",
      description:
        "ऑडिट, ट्रेसबिलिटी और विनियामक सबमिशन के लिए मानकीकृत प्रारूपों में अनुपालन‑तैयार रिपोर्ट तैयार करता है।",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  },
];

interface FeatureTileProps {
  feature: Feature;
  isActive: boolean;
  onClick: () => void;
}

function FeatureTile({ feature, isActive, onClick }: FeatureTileProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        backdrop-blur-md border
        ${
          isActive
            ? "bg-white/20 border-emerald-500 shadow-lg shadow-emerald-500/20"
            : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30"
        }
      `}
      whileHover={{ scale: isActive ? 1.02 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            p-3 rounded-lg transition-colors duration-300
            ${isActive ? "bg-emerald-500 text-white" : "bg-white/10 text-emerald-400"}
          `}
        >
          {feature.icon}
        </div>
        <span
          className={`
            font-medium text-base transition-colors duration-300
            ${isActive ? "text-white" : "text-white/80"}
          `}
        >
          {feature.title}
        </span>
      </div>
    </motion.button>
  );
}

interface DescriptionPanelProps {
  feature: Feature;
}

function DescriptionPanel({ feature }: DescriptionPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={feature.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <div
          className="
            h-full p-8 rounded-2xl
            bg-white/10 backdrop-blur-lg border border-white/20
            shadow-xl
          "
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-lg text-white/70 leading-relaxed"
          >
            {feature.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <div className="flex items-center gap-2 text-emerald-400">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium">
                Enterprise-grade security
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 mt-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium">Real-time analytics</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function KeyFeatures() {
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "hi";
  const [activeFeature, setActiveFeature] = useState<Feature>(features[0][
    "en"
  ]);

  const headerTexts = {
    en: {
      badge: "Features",
      title: "Core System Capabilities",
      subtitle: "Powerful tools designed to ensure food safety and regulatory compliance",
    },
    hi: {
      badge: "विशेषताएँ",
      title: "मुख्य सिस्टम क्षमताएँ",
      subtitle:
        "खाद्य सुरक्षा और विनियामक अनुपालन सुनिश्चित करने के लिए बनाए गए मज़बूत टूल",
    },
  }[locale];

  return (
    <section className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4"
          >
            {headerTexts.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            {headerTexts.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            {headerTexts.subtitle}
          </motion.p>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Feature Tiles */}
          <div className="flex flex-col gap-4">
            {features.map((featurePair) => {
              const feature = featurePair[locale];
              return (
                <FeatureTile
                  key={feature.id}
                  feature={feature}
                  isActive={activeFeature.id === feature.id}
                  onClick={() => setActiveFeature(feature)}
                />
              );
            })}
          </div>

          {/* Description Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <DescriptionPanel feature={activeFeature} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

