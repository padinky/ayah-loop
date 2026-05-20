import { QueryClient, type Query } from "@tanstack/react-query";
import axios from "axios";

function isRateLimitError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 429;
  }
  if (error instanceof Error && error.message.includes("429")) {
    return true;
  }
  return false;
}

function retryAfterMs(error: unknown): number | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const raw = error.response?.headers?.["retry-after"];
  if (raw == null) return undefined;
  const sec = Number(raw);
  return Number.isFinite(sec) ? sec * 1000 : undefined;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (!isRateLimitError(error)) return failureCount < 1;
        return failureCount < 3;
      },
      retryDelay: (attempt, error) => {
        const fromHeader = retryAfterMs(error);
        if (fromHeader != null) return fromHeader;
        return Math.min(1000 * 2 ** attempt, 30000);
      },
    },
  },
});

export function isCombinedSurahQuery(query: Query): boolean {
  const key = query.queryKey;
  return Array.isArray(key) && key[0] === "surah" && key[1] === "combined";
}
