"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { trpc } from "~/trpc/client";
import { clearSessionCookie } from "~/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { inferRouterOutputs } from "@trpc/server";
import { ServerRouter } from "@repo/trpc/client";

type RouterOutputs = inferRouterOutputs<ServerRouter>;
type SessionData = RouterOutputs["auth"]["me"];

interface NavbarProps {
  sessionData: SessionData | undefined | null;
  sessionLoading: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Navbar({
  sessionData,
  sessionLoading,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavbarProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const isLoggedIn = !!sessionData?.user;

  const [loggingOut, setLoggingOut] = useState(false);

  const logout = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout.mutateAsync();
      await clearSessionCookie();
      await utils.auth.me.invalidate();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#050505]/80 backdrop-blur-md px-6">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded border border-emerald-800 bg-emerald-950/30 flex items-center justify-center text-emerald-400 font-mono text-sm font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:border-emerald-500 transition-all duration-300">
            P
          </div>
          <span className="font-mono text-lg tracking-wider text-white font-bold">PARCHA95</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
          <Link href="/#features" className="hover:text-emerald-400 transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-emerald-400 transition-colors">
            Pricing
          </Link>
          <Link href="/explore" className="hover:text-emerald-400 transition-colors">
            Explore
          </Link>
        </nav>

        {/* Auth CTA / Actions */}
        <div className="hidden md:flex items-center gap-6">
          {sessionLoading ? (
            <div className="h-9 w-24 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-950 flex items-center justify-center outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-900 text-emerald-400 text-xs font-mono font-bold">
                      {sessionData?.user?.fullName?.charAt(0).toUpperCase() || (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-zinc-950 border-zinc-800 text-zinc-100"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {sessionData?.user?.fullName || "User"}
                    </p>
                    <p className="text-xs leading-none text-zinc-400 font-mono mt-0.5">
                      {sessionData?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center w-full cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Command Center</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-red-400 focus:text-red-400 focus:bg-red-950/30 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-sm text-zinc-400 hover:text-white font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link href="/auth/register">
                <button className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-zinc-200 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-zinc-400 hover:text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-zinc-800 bg-[#050505] py-6 px-6 flex flex-col gap-4 text-base"
        >
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-emerald-400 py-1 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-emerald-400 py-1 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-emerald-400 py-1 transition-colors"
          >
            Explore
          </Link>
          <hr className="border-zinc-800/80 my-2" />
          {sessionLoading ? (
            <div className="h-10 w-full bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex flex-col gap-4 border border-zinc-800/80 bg-zinc-900/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-800">
                  <AvatarFallback className="bg-zinc-900 text-emerald-400 text-sm font-mono font-bold">
                    {sessionData?.user?.fullName?.charAt(0).toUpperCase() || (
                      <User className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {sessionData?.user?.fullName || "User"}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {sessionData?.user?.email}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg py-2.5 text-center text-sm flex items-center justify-center gap-2 transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    Command Center
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="w-full text-red-400 hover:text-red-300 font-medium py-2.5 text-center text-sm border border-zinc-800 hover:border-red-950/20 hover:bg-red-950/10 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white py-1.5 font-medium text-center"
              >
                Sign In
              </Link>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-white text-black font-semibold rounded-lg py-2.5 text-center text-sm">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}
