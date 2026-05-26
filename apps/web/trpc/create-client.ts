import { httpLink, httpBatchStreamLink, splitLink, wsLink, createWSClient } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const url = typeof window === "undefined"
      ? (env.NEXT_PUBLIC_API_URL || "http://localhost:8000/trpc")
      : "/trpc";

  const fetchLink = (opts?.enableStreaming ? httpBatchStreamLink : httpLink)({
    url,
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

  if (typeof window === "undefined") {
    return fetchLink;
  }

  // Determine WebSocket URL dynamically based on current origin
  let wsUrl = window.location.origin.replace(/^http/, "ws") + "/trpc";
  if (env.NEXT_PUBLIC_API_URL) {
    wsUrl = env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws");
  }

  const wsClient = createWSClient({
    url: wsUrl,
    lazy: {
      enabled: true,
      closeMs: 10000,
    },
  });

  return splitLink({
    condition: (op) => op.type === "subscription",
    true: wsLink({
      client: wsClient,
    }),
    false: fetchLink,
  });
};
