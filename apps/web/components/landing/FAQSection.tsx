"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What UI themes are available?",
    answer: "Parcha95 ships with four fully-featured, production-ready themes: Terminal/CLI (green-on-black monospaced prompt), VS Code Editor (dark IDE with syntax-highlighted fields), Windows 95 (pixel-perfect retro grey dialogs), and Standard (clean SaaS-style). You can switch between them instantly from the builder.",
  },
  {
    question: "Are unlisted forms indexed by search engines?",
    answer: "No. Unlisted forms are completely isolated from crawlers via custom HTTP response headers and robots directives. Only the creator can access the form link — it will never appear in search results or be discoverable through public channels.",
  },
  {
    question: "Does Parcha95 have an API?",
    answer: "Yes. Parcha95 exposes a fully type-safe tRPC API for all form and response operations. All endpoints are documented interactively via Scalar — you can test them directly from the browser with zero setup.",
  },
  {
    question: "How do webhooks and email notifications work?",
    answer: "When a new response is submitted, Parcha95 fires an outgoing webhook to any URL you configure — Zapier, Discord, Slack, or your own server. The form owner also receives an email notification with a direct link to the Analytics view for that form.",
  },
  {
    question: "Can I password-protect a form?",
    answer: "Yes. Any form can be locked behind a password from the Global Settings panel in the builder. Respondents will see a password entry screen before the form loads — the theme of the password screen matches the theme you have selected for the form.",
  },
  {
    question: "How is spam and bot submission prevented?",
    answer: "Parcha95 uses a multi-layer approach: a configurable honeypot field (invisible to humans, always filled by bots), browser fingerprinting via FingerprintJS, and server-side rate limiting via Upstash Redis. Submissions that fail these checks are silently dropped.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 px-6 overflow-hidden bg-[#050505] border-t border-zinc-900">
      <div className="max-w-3xl mx-auto flex flex-col gap-10 relative z-10">

        {/* Header — consistent with other sections */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 border border-emerald-900/50 bg-emerald-950/20 px-3 py-1 rounded-full w-fit">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-base max-w-xl">
            Everything you need to know before you ship your first form.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col divide-y divide-zinc-800/60">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                >
                  <span className={`font-medium text-sm md:text-base font-sans transition-colors pr-4 ${isOpen ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"}`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
                  />
                </button>

                <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? "max-h-48 pb-5" : "max-h-0"}`}>
                  <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-emerald-500/40 pl-4">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 pt-2">
          <MessageCircle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <p className="text-sm text-zinc-500">
            Still have questions?{" "}
            <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Create a free account
            </Link>{" "}
            and explore the builder yourself.
          </p>
        </div>

      </div>
    </section>
  );
};
