import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: typeof window === "undefined"
      ? (env.NEXT_PUBLIC_API_URL || "http://localhost:8000/trpc")
      : "/trpc",
    async fetch(url, options) {
      const headers = new Headers(options?.headers);
      headers.set("x-csrf-token", "1");

      if (typeof window === "undefined") {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieArray = cookieStore.getAll().map((c: any) => `${c.name}=${c.value}`);
        if (cookieArray.length > 0) {
          headers.set("cookie", cookieArray.join("; "));
        }
      }

      return fetch(url, {
        ...options,
        credentials: "include",
        headers,
      });
    },
  });
};
