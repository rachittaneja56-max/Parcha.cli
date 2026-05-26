"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@repo/validators";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const me = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0 });

  useEffect(() => {
    if (me.data?.user) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, me.data, router]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const providers = trpc.auth.getSupportedAuthenticationProviders.useQuery(undefined, {
    retry: false,
  });

  const googleProvider = providers.data?.find((p) => p.provider === "GOOGLE_OAUTH");

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      router.replace(callbackUrl);
      router.refresh();
    },
    onError: (error) => {
      console.error("[Login Error]:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-md">
        

        <div className="rounded-sm border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm shadow-2xl shadow-black/50">
          <div className="border-b border-zinc-800 px-8 py-6">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Login to Parcha95
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Access your Creator Dashboard.
            </p>
          </div>

          <div className="px-8 py-7 flex flex-col gap-6">
            {googleProvider && (
              <div className="flex flex-col gap-3">
                <a href={googleProvider.authUrl} className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-200 rounded-sm flex items-center justify-center gap-3 transition-all"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-medium">Continue with Google</span>
                  </Button>
                </a>

                <div className="flex items-center gap-3 my-1">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest">
                    or with email
                  </span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
              </div>
            )}

            <form
              onSubmit={form.handleSubmit((values) => login.mutate(values))}
              className="flex flex-col gap-5"
            >
              <FieldGroup className="gap-5">
                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="login-email" className="text-zinc-300 text-sm font-medium">
                    Email
                  </FieldLabel>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={!!form.formState.errors.email}
                    className="mt-1.5 h-11 rounded-sm border-zinc-700 bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-0"
                    {...form.register("email")}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.password}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="login-password" className="text-zinc-300 text-sm font-medium">
                      Password
                    </FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!form.formState.errors.password}
                    className="mt-1.5 h-11 rounded-sm border-zinc-700 bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-0"
                    {...form.register("password")}
                  />
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full h-11 bg-white text-black hover:bg-zinc-200 rounded-sm font-medium text-sm transition-all mt-1"
                disabled={login.isPending}
              >
                {login.isPending && <Spinner data-icon="inline-start" />}
                {login.isPending ? "Logging in..." : "Login to Parcha95"}
              </Button>
            </form>
          </div>

          <div className="border-t border-zinc-800 px-8 py-5 text-center">
            <p className="text-sm text-zinc-500">
              New to Parcha95?{" "}
              <Link
                href="/auth/register"
                className="text-zinc-300 hover:text-white underline underline-offset-4 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-50">
        <div className="text-zinc-400">Loading...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
