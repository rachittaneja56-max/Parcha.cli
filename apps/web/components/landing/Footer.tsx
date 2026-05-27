"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#050505] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="flex items-center gap-2 font-bold text-white tracking-tight">
          <div className="w-6 h-6 rounded border border-emerald-800 bg-emerald-950/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
            P
          </div>
          <span className="font-mono text-base tracking-wider">PARCHA95</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-400">
          <Link href="/explore" className="hover:text-emerald-400 transition-colors">Explore</Link>
        </div>

        {/* Copyright */}
        <div className="text-zinc-600 text-sm font-mono">
          © {new Date().getFullYear()} PARCHA95. SECURE_BUILD.
        </div>
      </div>
    </footer>
  );
}
