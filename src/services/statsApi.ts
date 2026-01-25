import { baseURL } from "./api";
import { AUTH_USER_ID_KEY } from "./tossAuth";

export type AgeGroup = "all" | "10s" | "20s" | "30s" | "40s";

export type StatsResponse = {
  ageGroup: AgeGroup;
  myTime: number | null;
  averageTime: number | null;
  percentile: number | null;
  distribution: number[];
  sampleCount: number;
};

function getStoredUserId() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.trunc(parsed);
}

export async function fetchStats(ageGroup: AgeGroup): Promise<StatsResponse> {
  const userId = getStoredUserId();
  const response = await fetch(
    `${baseURL}/api/stats?ageGroup=${encodeURIComponent(ageGroup)}`,
    {
      method: "GET",
      headers: userId ? { "X-User-Id": String(userId) } : undefined,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load stats");
  }

  return response.json();
}
