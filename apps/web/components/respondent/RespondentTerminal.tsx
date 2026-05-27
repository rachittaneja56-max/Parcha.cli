/**
 * @file RespondentTerminal.tsx
 * @description The entry point for respondents filling out a public form.
 * Fetches the form schema based on the provided form ID or slug, handles password protection logic,
 * and delegates rendering to the appropriate `ThemeEngine` based on the form's theme setting.
 * 
 * @dependencies
 * - trpc.form.getPublicForm (to fetch sanitized schema)
 * - ThemeEngine (to render the correct visual theme)
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";
import type { SchemaField } from "../builder/constants";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { ThemeEngine } from "../themes/ThemeEngine";
import { Spinner } from "~/components/ui/spinner";

/**
 * @component RespondentTerminal
 * @description Manages the lifecycle of a respondent's form session (fetching, password prompts, and optimistic UI submission).
 * Dispatches the final `answers` payload to `submitResponseAsync`.
 */
export function RespondentTerminal({ formId, initialData }: { formId: string; initialData?: any }) {
  const router = useRouter();

  const [bootPhase, setBootPhase] = useState<"fetching" | "error" | "ready" | "password_prompt" | "auth_prompt">("fetching");
  const [visitorId, setVisitorId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activePassword, setActivePassword] = useState<string | undefined>(undefined);
  const [startTime] = useState(() => Date.now());

  const { data: formConfig, error: formError, isLoading } = trpc.form.getPublicForm.useQuery(
    { formIdOrSlug: formId, password: activePassword },
    { retry: false, initialData: activePassword ? undefined : initialData }
  );

  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0 });

  const { mutateAsync: submitResponseAsync } = trpc.response.submit.useMutation();
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
      setBootPhase("auth_prompt");
      return;
    }

    if (formConfig.isPasswordProtected && !formConfig.isAuthorized) {
      setBootPhase("password_prompt");
      if (activePassword) {
        setErrorMsg("Incorrect password. Please try again.");
      }
      return;
    }

    setBootPhase("ready");
  }, [isLoading, sessionLoading, formConfig, formError, router, formId, sessionData?.user, activePassword]);

  const handleTrackView = useCallback(() => {
    if (!formConfig) return;
    if (visitorId) {
      trackView({ slug: formConfig.slug, fingerprint: visitorId });
    } else {
      trackView({ slug: formConfig.slug });
    }
  }, [visitorId, formConfig, trackView]);

  const handleSubmit = useCallback(async (answers: Record<string, string>, honeypot?: string) => {
    if (!formConfig) return;
    submitResponseAsync({
      slug: formConfig.slug,
      payload: answers,
      fingerprint: visitorId || undefined,
      honeypotField: honeypot || undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      timeToComplete: Math.floor((Date.now() - startTime) / 1000),
    });
  }, [visitorId, formConfig, submitResponseAsync, startTime]);

  if (bootPhase === "fetching") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Spinner className="text-emerald-500" />
      </div>
    );
  }

  const activeTheme = (formConfig?.theme as any) || "terminal";
  const activeSchema = (formConfig?.schema as SchemaField[]) || [];
  const activeFormName = formConfig?.title || "Parcha95 Form";

  return (
    <ThemeEngine
      theme={activeTheme}
      schema={activeSchema}
      formName={activeFormName}
      successMessage={formConfig?.successMessage || undefined}
      isPreview={false}
      onTrackView={handleTrackView}
      onSubmit={handleSubmit}
      appState={bootPhase === "ready" ? "live" : bootPhase}
      errorMsg={errorMsg}
      onLoginClick={() => router.push(`/auth/login?callbackUrl=/f/${formId}`)}
      onPasswordSubmit={(pwd) => setActivePassword(pwd)}
    />
  );
}
