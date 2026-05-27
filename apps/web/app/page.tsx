/**
 * @file page.tsx (Landing Page — `/`)
 * @description The public marketing homepage for Parcha95. Assembled from modular
 * section components, each independently maintained in `apps/web/components/landing/`.
 *
 * Component render order:
 *   KernelPanicEasterEgg  — Global keydown listener; triggers full-screen meltdown animation
 *                           when the sequence `rm -rf` is typed anywhere on the page.
 *   Navbar                — Session-aware; shows "Go to Dashboard" if logged in, else auth CTAs.
 *   Hero                  — 3D tilt card with 4 live interactive form theme demos (Terminal,
 *                           VS Code, Standard, Windows 95). Driven by `activeTheme` state.
 *   Features              — BuilderGlimpse + AnalyticsGlimpse previews + bento grid.
 *   AdminGlimpseSection   — Static faithful replica of the Command Center dashboard UI.
 *   AnalyticsGlimpseSection — Static faithful replica of the Analytics panel UI.
 *   Pricing               — 3-tier pricing (Free / Pro / Enterprise) with PaymentModal.
 *   FAQSection            — Accordion FAQ with 6 Parcha-specific questions.
 *   Footer                — Brand + copyright.
 *
 * @dependencies
 * - trpc.auth.me (session check for Navbar and Hero CTA differentiation)
 * - All landing section components in `~/components/landing/`
 */
"use client";


import { useState } from "react";
import { trpc } from "~/trpc/client";
import { Navbar } from "~/components/landing/Navbar";
import { Hero } from "~/components/landing/Hero";
import { Features } from "~/components/landing/Features";
import { AdminGlimpseSection } from "~/components/landing/AdminGlimpseSection";
import { AnalyticsGlimpseSection } from "~/components/landing/AnalyticsGlimpseSection";
import { Pricing } from "~/components/landing/Pricing";
import { FAQSection } from "~/components/landing/FAQSection";
import { Footer } from "~/components/landing/Footer";
import { KernelPanicEasterEgg } from "~/components/landing/KernelPanicEasterEgg";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 0,
  });

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-200 selection:bg-emerald-500/30 antialiased overflow-hidden font-sans">
      <KernelPanicEasterEgg />
      <Navbar
        sessionData={sessionData}
        sessionLoading={sessionLoading}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <Hero sessionData={sessionData} />

      <Features />
      <AdminGlimpseSection />
      <AnalyticsGlimpseSection />

      <Pricing />

      <FAQSection />
      <Footer />
    </main>
  );
}
