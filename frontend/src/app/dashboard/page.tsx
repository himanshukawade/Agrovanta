"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ResidueRiskForm from "../../components/ResidueRiskForm";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();

  // Protect the route — redirect to sign in if user is not logged in
  useEffect(() => {
    const token = localStorage.getItem("agrovanta_token");
    if (!token) {
      router.replace("/signin");
    }
  }, [router]);

  const userRaw = typeof window !== "undefined" ? localStorage.getItem("agrovanta_user") : null;
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      {/* Dashboard header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-6 lg:px-12 pt-10 pb-6 flex flex-col items-center border-b border-white/10 shrink-0 text-center"
      >
        <div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {user?.name ? user.name.split(" ")[0] : "there"}!
            </span>
          </h1>
          <p className="text-xl text-white/50 mt-3">
            Run a residue risk check using the estimator below.
          </p>
        </div>
      </motion.div>

      {/* Main content — ResidueRiskForm as the hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1"
      >
        <ResidueRiskForm />
      </motion.div>
    </div>
  );
}
