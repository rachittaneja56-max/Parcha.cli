import Link from "next/link";
import { Button } from "~/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-white tracking-tight font-sans">Parcha.cli</span>
            <span className="font-mono text-zinc-500 group-hover:text-green-400 transition-colors">
              &gt;_
            </span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="#templates" className="hover:text-zinc-50 transition-colors">Templates</Link>
          <Link href="#pricing" className="hover:text-zinc-50 transition-colors">Pricing</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:inline-flex text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 rounded-sm">
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild className="bg-white text-black hover:bg-zinc-200 font-medium rounded-sm">
            <Link href="/auth/register">Start Building</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
