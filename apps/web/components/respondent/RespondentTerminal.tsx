"use client";

import { useEffect, useState, useCallback } from "react";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";
import type { SchemaField } from "../builder/constants";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { ThemeEngine } from "../themes/ThemeEngine";
import { Spinner } from "~/components/ui/spinner";

export function RespondentTerminal({ formId }: { formId: string }) {
  const router = useRouter();
  
  const [bootPhase, setBootPhase] = useState<"fetching" | "error" | "ready">("fetching");
  const [visitorId, setVisitorId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { data: formConfig, error: formError, isLoading } = trpc.form.getPublicForm.useQuery(
    { formIdOrSlug: formId },
    { retry: false }
  );

  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery(undefined, { retry: false });
  
  const { mutate: submitResponse, mutateAsync: submitResponseAsync } = trpc.response.submit.useMutation();
  const { mutate: trackView } = trpc.response.trackView.useMutation();

  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await fpPromise.load();
      const result = await fp.get();
      setVisitorId(result.visitorId);
    };
    initFingerprint().catch(console.error);
  }, []);

  useEffect(() => {
    if (isLoading || sessionLoading) return;

    if (formError || !formConfig) {
      setErrorMsg(`> ERROR 404: Form is currently offline or does not exist.\n> Details: ${formError?.message || "Unknown error"}`);
      setBootPhase("error");
      return;
    }

    if (formConfig.status === "draft") {
      setErrorMsg(`> ERROR 404: Form is currently offline.`);
      setBootPhase("error");
      return;
    }

    if (formConfig.requireAuth && !sessionData?.user) {
      setErrorMsg(`> SECURITY OVERRIDE: Authentication required.\n> Redirecting to secure login portal...`);
      setBootPhase("error");
      setTimeout(() => {
        router.push(`/auth/login?callbackUrl=/f/${formId}`);
      }, 1500);
      return;
    }

    setBootPhase("ready");
  }, [isLoading, sessionLoading, formConfig, formError, router, formId, sessionData?.user]);

  const handleTrackView = useCallback(() => {
    if (!formConfig) return;
    if (visitorId) {
      trackView({ slug: formConfig.slug, fingerprint: visitorId });
    } else {
      trackView({ slug: formConfig.slug });
    }
  }, [visitorId, formConfig?.slug, trackView]);

  const handleSubmit = useCallback(async (answers: Record<string, string>, honeypot?: string) => {
    if (!formConfig) return;
    await submitResponseAsync({
      slug: formConfig.slug,
      payload: answers,
      fingerprint: visitorId || undefined,
      honeypotField: honeypot || undefined,
    });
  }, [visitorId, formConfig?.slug, submitResponseAsync]);

  if (bootPhase === "fetching") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Spinner className="text-emerald-500" />
      </div>
    );
  }

  if (bootPhase === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen overflow-hidden p-4 sm:p-8 bg-black font-mono text-slate-200">
        <div className="flex flex-col w-full max-w-4xl h-full max-h-[85vh] bg-[#050B14] border border-[#0f1b2d] shadow-2xl rounded-md overflow-hidden">
          <div className="p-6 sm:p-12 h-full overflow-y-auto">
            <div className="text-rose-500 font-bold whitespace-pre-wrap mt-4">
              {errorMsg}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formConfig) return null;

  return (
    <ThemeEngine
      theme="terminal"
      schema={formConfig.schema as SchemaField[]}
      formName={formConfig.title || "Parcha Form"}
      successMessage={formConfig.successMessage || undefined}
      password={formConfig.password || null}
      isPreview={false}
      onTrackView={handleTrackView}
      onSubmit={handleSubmit}
    />
  );
}
