import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import { LanguageProvider } from "../components/LanguageProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agrovanta",
  description: "Monitor Antimicrobial Usage. Ensure MRL Compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-slate-900 text-slate-50`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        <LanguageProvider>
          <NavBar />
          <main className="flex-1 flex flex-col">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
