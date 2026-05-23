"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { trpc } from "~/trpc/client";

export default function DashboardPage() {
  const router = useRouter();
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (me.isError) {
      router.replace("/auth/login");
    }
  }, [me.isError, router]);

  if (me.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <Spinner />
      </main>
    );
  }

  if (!me.data?.user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm text-zinc-500">Creator Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome, {me.data.user.fullName}</h1>
        </div>
        <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-50">
          <CardHeader>
            <CardTitle>Your forms</CardTitle>
            <CardDescription>Form management will live here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Authentication is connected. You can now build the dashboard experience on top of this protected route.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
