"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Terminal } from "lucide-react";
import { trpc } from "~/trpc/client";

export function Hero() {
  const me = trpc.auth.me.useQuery(undefined, { retry: false });

  return (
    <section className="relative overflow-hidden py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-300 mt-4 mb-8 backdrop-blur-sm rounded-sm font-mono uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 mr-2 text-green-400" />
          v1.0 is now live
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl pb-2">
          <span className="text-zinc-100">
            The form builder you won&apos;t outgrow.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed font-sans">
          Create beautiful forms for your users in minutes. Connect them to powerful, type-safe infrastructure for your developers in seconds.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="ml-12 w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-medium h-12 px-8 rounded-sm font-sans">
            <Link href={me.data?.user ? "/dashboard" : "/auth/register"}>
              {me.data?.user ? "Go to Dashboard" : "Create your first form"}
            </Link>
          </Button>
        </div>
      </div>
      
    </section>
  );
}
