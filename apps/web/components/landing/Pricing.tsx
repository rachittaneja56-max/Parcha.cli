"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { PaymentModal } from "~/components/landing/PaymentModal";
import { useState } from "react";

interface PricingFeature {
  label: string;
  included: boolean;
}

const FREE_FEATURES: PricingFeature[] = [
  { label: "Up to 3 active forms", included: true },
  { label: "100 responses / month", included: true },
  { label: "Terminal & Standard themes", included: true },
  { label: "Basic field types (text, email, select)", included: true },
  { label: "Public form sharing via slug", included: true },
  { label: "Analytics dashboard", included: false },
  { label: "Webhook & email notifications", included: false },
  { label: "Password-protected forms", included: false },
  { label: "Custom branding", included: false },
];

const PRO_FEATURES: PricingFeature[] = [
  { label: "Unlimited active forms", included: true },
  { label: "Unlimited responses", included: true },
  { label: "All 4 UI themes (Terminal, Win95, Code Editor, Standard)", included: true },
  { label: "All field types incl. rating, date, file", included: true },
  { label: "Full analytics dashboard with charts", included: true },
  { label: "Webhook & email notifications", included: true },
  { label: "Password-protected forms", included: true },
  { label: "Custom branding & slug control", included: true },
];

const ENTERPRISE_FEATURES: PricingFeature[] = [
  { label: "Everything in Pro", included: true },
  { label: "Custom domain embedding", included: true },
  { label: "SSO & SAML authentication", included: true },
  { label: "SLA uptime guarantees (99.9%)", included: true },
  { label: "Dedicated success handler", included: true },
  { label: "Priority support & onboarding", included: true },
];

export function Pricing() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}

      <section id="pricing" className="py-16 px-6 border-t border-zinc-900 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 rounded-full w-fit mb-4 mx-auto">
              Scalability Plan
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-zinc-400 text-lg">
              Start gathering responses for free. Upgrade when your forms need to scale.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">

            {/* Tier 1: Free */}
            <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-1 font-mono">Free</h3>
              <p className="text-zinc-500 text-xs mb-4">Start prototyping with zero friction</p>
              <div className="text-4xl font-bold text-white mb-6 font-mono">
                ₹0<span className="text-sm text-zinc-500 font-normal">/mo</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-700 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "text-zinc-300" : "text-zinc-600"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register" className="w-full mt-auto">
                <button className="w-full border border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Tier 2: Pro (Highlighted) */}
            <div className="bg-[#0A0A0A] border border-emerald-500/50 rounded-2xl p-8 flex flex-col relative shadow-[0_0_50px_rgba(16,185,129,0.05)] md:-translate-y-2 hover:border-emerald-400 transition-all duration-300">
              {/* Recommended Tag */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                Recommended
              </div>

              <h3 className="text-lg font-medium text-emerald-400 mb-1 font-mono">Pro</h3>
              <p className="text-zinc-500 text-xs mb-4">Full production-ready form builder</p>
              <div className="text-4xl font-bold text-white mb-6 font-mono">
                ₹1,249<span className="text-sm text-zinc-500 font-normal">/mo</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{f.label}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full mt-auto bg-emerald-500 text-black hover:bg-emerald-400 rounded-lg py-2.5 text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-200"
              >
                Get Pro
              </button>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl p-8 flex flex-col hover:border-zinc-700 transition-all duration-300">
              <h3 className="text-lg font-medium text-white mb-1 font-mono">Enterprise</h3>
              <p className="text-zinc-500 text-xs mb-4">Custom deployment with white-glove SLA</p>
              <div className="text-4xl font-bold text-white mb-6 font-mono">
                Custom
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {ENTERPRISE_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register" className="w-full mt-auto">
                <button className="w-full border border-zinc-800 text-white hover:bg-zinc-900 hover:border-zinc-700 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200">
                  Contact Sales
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
