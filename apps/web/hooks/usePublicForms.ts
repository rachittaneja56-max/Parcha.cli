import { trpc } from "~/trpc/client";

export const PUBLIC_FORMS_STALE_TIME_MS = 60_000;
export const PUBLIC_FORMS_GC_TIME_MS = 5 * 60_000;

export const usePublicForms = () =>
  trpc.form.getPublicForms.useQuery(undefined, {
    staleTime: PUBLIC_FORMS_STALE_TIME_MS,
    gcTime: PUBLIC_FORMS_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });
