"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

// Custom styled dropdown to avoid browser-native white popup
function CustomSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span>{selected?.label ?? value}</span>
        <svg
          className={`w-5 h-5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-slate-800 border border-white/15 shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-base transition-colors ${
                opt.value === value
                  ? "bg-emerald-500/20 text-emerald-300 font-medium"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type FormState = {
  species: string;
  productType: "milk" | "meat";
  compound: string;
  dosageMg: string;
  weightKg: string;
  ageMonths: string;
  treatmentDate: string;
  frequency: string;
};

type ApiResponse = {
  input: {
    species: string;
    product_type: string;
    compound: string;
    dosage_mg: number;
    withdrawal_days: number;
    weight_kg: number;
    age_months: number;
    treatment_date: string;
    frequency: string;
  };
  prediction: {
    probability: number;
    risk_label: "LOW" | "MODERATE" | "HIGH";
    compliant: boolean;
    message: string;
    safe_harvest_date_status: "IN_WITHDRAWAL" | "COMPLIANT";
    withdrawal_days: number;
  };
};

// Default to today for treatment date
const todayStr = new Date().toISOString().split("T")[0];

const defaultForm: FormState = {
  species: "cattle",
  productType: "milk",
  compound: "Oxytetracycline",
  dosageMg: "500",
  weightKg: "500",
  ageMonths: "24",
  treatmentDate: todayStr,
  frequency: "daily",
};

const compounds = [
  "Oxytetracycline",
  "Enrofloxacin",
  "Penicillin G",
] as const;

export default function ResidueRiskForm() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const { language } = useLanguage();
  const locale = ["en", "hi", "mr"].includes(language) ? language as "en" | "hi" | "mr" : "en";

  const t = {
    en: {
      heading: "Residue Risk Estimator",
      subheading: "Simulate an antimicrobial treatment and estimate residue risk against withdrawal guidance.",
      badge: "AI-assisted prediction",
      species: "Species",
      cattle: "Cattle", sheep: "Sheep", goat: "Goat",
      productType: "Product type",
      milk: "Milk", meat: "Meat",
      compound: "Compound",
      dosage: "Dosage (mg)",
      withdrawal: "Withdrawal period (days)",
      weightKg: "Animal weight (kg)",
      ageMonths: "Age (months)",
      treatmentDate: "Treatment date",
      frequency: "Dosage frequency",
      once: "Once (single dose)", daily: "Daily", twice: "Twice daily", weekly: "Weekly",
      calculating: "Calculating...",
      runCheck: "Run risk check",
      reset: "Reset to example scenario",
      predictionSummary: "Prediction summary",
      predictionIntro: "Submit the form to estimate whether milk or meat from the treated animal is likely to be within safe residue limits, based on withdrawal guidance and dose.",
      estimatedRisk: "Estimated residue risk",
      low: "Low", moderate: "Moderate", high: "High",
      riskSuffix: "risk",
      modelScore: "Model risk score:",
      pastWithdrawal: "Past withdrawal period",
      inWithdrawal: "In withdrawal period",
      withdrawalCheckPrefix: "Withdrawal check based on",
      withdrawalCheckSuffix: "day window",
      scenarioInputs: "Scenario inputs",
      speciesLabel: "Species:", productLabel: "Product:", compoundLabel: "Compound:",
      treatmentDetails: "Treatment details",
      dosageLabel: "Dosage:", dosageUnit: "mg",
      withdrawalLabel: "Withdrawal:", daysUnit: "days",
      weightLabel: "Weight:", weightUnit: "kg",
      ageLabel: "Age:", ageUnit: "months",
      dateLabel: "Treated on:",
      freqLabel: "Frequency:",
      emptyState: "Configure a treatment scenario on the left and run a check to see whether the system would flag the batch as safe to move forward or still within a withdrawal period.",
      disclaimer: "This tool is a demonstration of digital workflows for antimicrobial residue risk assessment. It does not replace official MRL tables, laboratory measurements, or veterinary judgment, and should not be used for regulatory decisions in production.",
    },
    hi: {
      heading: "अवशेष जोखिम अनुमानक",
      subheading: "एंटीमाइक्रोबियल उपचार का परिदृश्य बनाएं और वापसी मार्गदर्शन के आधार पर अवशेष जोखिम का अनुमान लगाएँ।",
      badge: "एआई‑सहायता प्राप्त पूर्वानुमान",
      species: "प्रजाति", cattle: "गाय/भैंस", sheep: "भेड़", goat: "बकरी",
      productType: "उत्पाद प्रकार", milk: "दूध", meat: "मांस",
      compound: "यौगिक", dosage: "खुराक (mg)", withdrawal: "वापसी अवधि (दिन)",
      weightKg: "पशु वजन (kg)", ageMonths: "आयु (महीने)",
      treatmentDate: "उपचार की तारीख", frequency: "खुराक की आवृत्ति",
      once: "एक बार (एकल खुराक)", daily: "दैनिक", twice: "दिन में दो बार", weekly: "साप्ताहिक",
      calculating: "गणना हो रही है...", runCheck: "जोखिम जाँच चलाएँ", reset: "उदाहरण परिदृश्य पर रीसेट करें",
      predictionSummary: "पूर्वानुमान सारांश",
      predictionIntro: "फ़ॉर्म जमा करें ताकि यह अनुमान लगाया जा सके कि उपचारित पशु से प्राप्त दूध या मांस सुरक्षित अवशेष सीमा के भीतर है या नहीं।",
      estimatedRisk: "अनुमानित अवशेष जोखिम",
      low: "कम", moderate: "मध्यम", high: "उच्च", riskSuffix: "जोखिम",
      modelScore: "मॉडल जोखिम स्कोर:", pastWithdrawal: "वापसी अवधि समाप्त", inWithdrawal: "वापसी अवधि में",
      withdrawalCheckPrefix: "वापसी जाँच", withdrawalCheckSuffix: "दिन की खिड़की पर आधारित",
      scenarioInputs: "परिदृश्य इनपुट",
      speciesLabel: "प्रजाति:", productLabel: "उत्पाद:", compoundLabel: "यौगिक:",
      treatmentDetails: "उपचार विवरण",
      dosageLabel: "खुराक:", dosageUnit: "mg", withdrawalLabel: "वापसी:", daysUnit: "दिन",
      weightLabel: "वजन:", weightUnit: "kg", ageLabel: "आयु:", ageUnit: "महीने",
      dateLabel: "उपचार की तारीख:", freqLabel: "आवृत्ति:",
      emptyState: "बाएँ तरफ उपचार परिदृश्य कॉन्फ़िगर करें और जाँच चलाएँ।",
      disclaimer: "यह टूल एंटीमाइक्रोबियल अवशेष जोखिम मूल्यांकन के लिए डिजिटल वर्कफ़्लो का एक डेमो है।",
    },
    mr: {
      heading: "अवशेष जोखीम अंदाजक",
      subheading: "प्रतिजैविक उपचाराचे अनुकरण करा आणि माघारी मार्गदर्शनाच्या आधारे अवशेष जोखीम अंदाज करा.",
      badge: "AI-सहाय्यित अंदाज",
      species: "प्रजाती", cattle: "गाय/म्हैस", sheep: "मेंढी", goat: "बकरी",
      productType: "उत्पाद प्रकार", milk: "दूध", meat: "मांस",
      compound: "संयुग", dosage: "डोस (mg)", withdrawal: "माघारी कालावधी (दिवस)",
      weightKg: "प्राण्याचे वजन (kg)", ageMonths: "वय (महिने)",
      treatmentDate: "उपचाराची तारीख", frequency: "डोसची वारंवारता",
      once: "एकदा (एकल डोस)", daily: "दररोज", twice: "दिवसातून दोनदा", weekly: "साप्ताहिक",
      calculating: "गणना होत आहे...", runCheck: "जोखीम तपासणी चालवा", reset: "उदाहरण परिस्थितीवर रीसेट करा",
      predictionSummary: "अंदाज सारांश",
      predictionIntro: "फॉर्म सबमिट करा जेणेकरून उपचारित प्राण्यापासून मिळालेले उत्पाद सुरक्षित आहे का याचे अनुमान लावा.",
      estimatedRisk: "अंदाजित अवशेष जोखीम",
      low: "कमी", moderate: "मध्यम", high: "उच्च", riskSuffix: "जोखीम",
      modelScore: "मॉडेल जोखीम गुण:", pastWithdrawal: "माघारी कालावधी संपला", inWithdrawal: "माघारी कालावधीत",
      withdrawalCheckPrefix: "माघारी तपासणी", withdrawalCheckSuffix: "दिवसांच्या विंडोवर आधारित",
      scenarioInputs: "परिस्थिती इनपुट",
      speciesLabel: "प्रजाती:", productLabel: "उत्पाद:", compoundLabel: "संयुग:",
      treatmentDetails: "उपचार तपशील",
      dosageLabel: "डोस:", dosageUnit: "mg", withdrawalLabel: "माघारी:", daysUnit: "दिवस",
      weightLabel: "वजन:", weightUnit: "kg", ageLabel: "वय:", ageUnit: "महिने",
      dateLabel: "उपचाराची तारीख:", freqLabel: "वारंवारता:",
      emptyState: "डाव्या बाजूला उपचार परिस्थिती कॉन्फिगर करा आणि तपासणी चालवा.",
      disclaimer: "हे साधन प्रतिजैविक अवशेष जोखीम मूल्यांकनासाठी डिजिटल वर्कफ्लोचे प्रदर्शन आहे.",
    },
  }[locale];

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const endpoint = backendBaseUrl
        ? `${backendBaseUrl}/predict-residue`
        : "/api/predict-residue";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          species: form.species,
          product_type: form.productType,
          compound: form.compound,
          dosage_mg: Number(form.dosageMg),
          withdrawal_days: Number(form.withdrawalDays),
          weight_kg: Number(form.weightKg),
          age_months: Number(form.ageMonths),
          treatment_date: form.treatmentDate,
          frequency: form.frequency,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Unexpected server error");
      }

      const data = (await response.json()) as ApiResponse;
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const probabilityPercent =
    result != null ? Math.round(result.prediction.probability * 100) : null;

  const frequencyOptions = [
    { value: "once", label: t.once },
    { value: "daily", label: t.daily },
    { value: "twice", label: t.twice },
    { value: "weekly", label: t.weekly },
  ];

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left: Form */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-br from-emerald-500/40 via-blue-500/30 to-sky-400/30 blur-2xl opacity-40" />
          <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-semibold text-white">{t.heading}</h2>
                <p className="text-base text-white/60 mt-2">{t.subheading}</p>
              </div>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-sm font-medium text-emerald-300">
                {t.badge}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Species + Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-white/80 mb-2">{t.species}</label>
                  <CustomSelect
                    value={form.species}
                    onChange={(val) => handleChange("species", val)}
                    options={[
                      { value: "cattle", label: t.cattle },
                      { value: "sheep", label: t.sheep },
                      { value: "goat", label: t.goat },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-white/80 mb-2">{t.productType}</label>
                  <CustomSelect
                    value={form.productType}
                    onChange={(val) => handleChange("productType", val as FormState["productType"])}
                    options={[
                      { value: "milk", label: t.milk },
                      { value: "meat", label: t.meat },
                    ]}
                  />
                </div>
              </div>

              {/* Row 2: Compound + Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-white/80 mb-2">{t.compound}</label>
                  <CustomSelect
                    value={form.compound}
                    onChange={(val) => handleChange("compound", val)}
                    options={compounds.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-white/80 mb-2">{t.dosage}</label>
                  <input
                    type="number" min={1} step={1} value={form.dosageMg}
                    onChange={(e) => handleChange("dosageMg", e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="500" required
                  />
                </div>
              </div>

              {/* Row 3: Weight + Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-white/80 mb-2">{t.weightKg}</label>
                  <input
                    type="number" min={1} step={1} value={form.weightKg}
                    onChange={(e) => handleChange("weightKg", e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="500" required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-white/80 mb-2">{t.ageMonths}</label>
                  <input
                    type="number" min={0} step={1} value={form.ageMonths}
                    onChange={(e) => handleChange("ageMonths", e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="24" required
                  />
                </div>
              </div>

              {/* Row 4: Frequency (full width, withdrawal is now auto-detected) */}
              <div>
                <label className="block text-base font-medium text-white/80 mb-2">{t.frequency}</label>
                <CustomSelect
                  value={form.frequency}
                  onChange={(val) => handleChange("frequency", val)}
                  options={frequencyOptions}
                />
              </div>

              {/* Row 5: Treatment Date (full width) */}
              <div>
                <label className="block text-base font-medium text-white/80 mb-2">{t.treatmentDate}</label>
                <input
                  type="date"
                  value={form.treatmentDate}
                  max={todayStr}
                  onChange={(e) => handleChange("treatmentDate", e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {t.calculating}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.runCheck}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setForm(defaultForm); setResult(null); setError(null); }}
                  className="text-sm text-white/50 hover:text-white/80 underline-offset-4 hover:underline"
                >
                  {t.reset}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Result */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white/5 border border-white/15 p-6 sm:p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-white mb-3">{t.predictionSummary}</h3>
            <p className="text-base text-white/60 mb-6">{t.predictionIntro}</p>

            {result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white/60 uppercase tracking-wide">{t.estimatedRisk}</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {result.prediction.risk_label === "LOW"
                        ? t.low
                        : result.prediction.risk_label === "MODERATE"
                          ? t.moderate
                          : t.high}{" "}
                      {t.riskSuffix}
                    </p>
                    {probabilityPercent != null && (
                      <p className="text-sm text-white/60 mt-1">
                        {t.modelScore}{" "}
                        <span className="font-semibold text-emerald-300">{probabilityPercent}%</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        result.prediction.compliant
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {result.prediction.safe_harvest_date_status === "COMPLIANT"
                        ? t.pastWithdrawal
                        : t.inWithdrawal}
                    </span>
                    <span className="text-xs text-white/40">
                      {t.withdrawalCheckPrefix} {result.prediction.withdrawal_days} {t.withdrawalCheckSuffix}
                    </span>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.prediction.risk_label === "LOW"
                        ? "bg-emerald-500"
                        : result.prediction.risk_label === "MODERATE"
                          ? "bg-amber-400"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${probabilityPercent ?? 0}%` }}
                  />
                </div>

                <p className="text-xl font-bold text-white/70 leading-relaxed">{result.prediction.message}</p>

                <div className="grid grid-cols-2 gap-3 text-xs text-white/60 pt-2 border-t border-white/10">
                  <div>
                    <p className="font-medium text-white/80 mb-1">{t.scenarioInputs}</p>
                    <p>{t.speciesLabel} <span className="font-semibold text-white">{result.input.species}</span></p>
                    <p>{t.productLabel} <span className="font-semibold text-white">{result.input.product_type}</span></p>
                    <p>{t.compoundLabel} <span className="font-semibold text-white">{result.input.compound}</span></p>
                    <p>{t.weightLabel} <span className="font-semibold text-white">{result.input.weight_kg} {t.weightUnit}</span></p>
                    <p>{t.ageLabel} <span className="font-semibold text-white">{result.input.age_months} {t.ageUnit}</span></p>
                  </div>
                  <div>
                    <p className="font-medium text-white/80 mb-1">{t.treatmentDetails}</p>
                    <p>{t.dosageLabel} <span className="font-semibold text-white">{result.input.dosage_mg} {t.dosageUnit}</span></p>
                    <p>{t.withdrawalLabel} <span className="font-semibold text-white">{result.prediction.withdrawal_days} {t.daysUnit} <span className="text-white/40">(auto)</span></span></p>
                    <p>{t.freqLabel} <span className="font-semibold text-white capitalize">{result.input.frequency}</span></p>
                    <p>{t.dateLabel} <span className="font-semibold text-white">{result.input.treatment_date}</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/15 rounded-2xl p-6 text-base text-white/40 leading-relaxed">
                {t.emptyState}
              </div>
            )}
          </div>

          <p className="text-sm text-white/30 leading-relaxed mt-4">{t.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
