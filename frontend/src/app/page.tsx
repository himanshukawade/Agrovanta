"use client";

import Hero from "../components/Hero";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("agrovanta_token")) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="w-full flex-col">
      <Hero />
    </div>
  );
}

