"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Eye, Terminal, Monitor, LayoutTemplate, Code, ChevronRight } from "lucide-react";

const CATEGORIES = ["All Blueprints", "Startups", "Developer Tools", "Retro Systems"];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All Blueprints");
  
  const { data: forms, isLoading, isError } = trpc.form.getPublicForms.useQuery();

  const renderThemeBadge = (theme: string) => {
    switch (theme) {
      case "code_editor":
        return (
          <div className="flex items-center gap-1.5 rounded-md bg-[#1E1E1E] border border-zinc-700/50 px-2.5 py-1 text-[10px] font-mono tracking-wider text-[#4EC9B0]">
            <Code className="h-3 w-3" />
            VS_CODE_THEME
          </div>
        );
      case "windowsxp":
      case "windows95":
        return (
          <div className="flex items-center gap-1.5 rounded-sm bg-[#C0C0C0] border-t-white border-l-white border-b-[#808080] border-r-[#808080] border-[1.5px] px-2 py-0.5 text-[10px] font-bold tracking-tight text-black shadow-[1px_1px_0px_#000]">
            <Monitor className="h-3 w-3" />
            RETRO_95_THEME
          </div>
        );
      case "terminal":
        return (
          <div className="flex items-center gap-1.5 rounded bg-black/50 border border-green-500/30 px-2 py-1 text-[10px] font-mono text-green-500">
            <Terminal className="h-3 w-3" />
            TERMINAL_THEME
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
            <LayoutTemplate className="h-3 w-3" />
            STANDARD_THEME
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Navigation / Header matching site aesthetic can go here if layout doesn't provide it */}
      
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-32">
        {/* Hero Title Bar */}
        <div className="mb-16 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            The Public Form Registry
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Explore curated blueprints, community collections, and deployment targets. 
            Discover how creators are using modular components and retro systems to build engaging forms.
          </p>
        </div>

        {/* Modular Categorization Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "bg-[#0A0A0A] text-zinc-400 border border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* The Crazy Card Grid Layout */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#0A0A0A] border border-zinc-800/80 rounded-xl p-6 h-64 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-6 w-3/4 bg-zinc-800/50 rounded mb-4"></div>
                  <div className="h-4 w-1/2 bg-zinc-800/30 rounded mb-6"></div>
                  <div className="h-6 w-24 bg-zinc-800/50 rounded"></div>
                </div>
                <div className="h-10 w-full bg-zinc-800/40 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center border border-red-900/30 bg-red-950/10 rounded-xl">
            <p className="text-red-400">Failed to load the public registry. Please try again later.</p>
          </div>
        ) : forms?.length === 0 ? (
          <div className="p-16 text-center border border-zinc-800/50 bg-[#0A0A0A] rounded-xl flex flex-col items-center justify-center">
            <Monitor className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Blueprints Found</h3>
            <p className="text-zinc-500">There are no public published forms in the registry yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms?.map((form: any) => (
              <div 
                key={form.id} 
                className="bg-[#0A0A0A] border border-zinc-800/80 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
              >
                {/* Subtle gradient hover effect inside the card */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/0 to-zinc-800/0 group-hover:to-zinc-800/5 transition-colors duration-500 pointer-events-none" />
                
                <div className="flex-1 flex flex-col">
                  {/* Top Header: Avatar & Views */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-zinc-800 bg-zinc-900">
                        <AvatarImage src={form.creator?.profileImageUrl || ""} alt={form.creator?.fullName || "Creator"} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs">
                          {form.creator?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {form.creator?.fullName || "Anonymous Builder"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                      <Eye className="h-3.5 w-3.5" />
                      {form.views.toLocaleString()}
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2 leading-tight group-hover:text-zinc-100">
                      {form.title}
                    </h3>
                    <div className="inline-block">
                      {renderThemeBadge(form.theme)}
                    </div>
                  </div>
                </div>

                {/* UX Open Protocol Action */}
                <div className="pt-6 mt-auto border-t border-zinc-800/50">
                  <Button 
                    asChild
                    variant="ghost" 
                    className="w-full justify-between hover:bg-white hover:text-black group/btn border border-transparent hover:border-zinc-200 transition-all duration-200 h-11"
                  >
                    <Link href={`/f/${form.slug || form.id}`} target="_blank" rel="noopener noreferrer">
                      <span className="font-semibold tracking-wide text-sm">Run Form Configuration</span>
                      <ChevronRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
