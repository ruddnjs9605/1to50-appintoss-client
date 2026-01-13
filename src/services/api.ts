const env = import.meta.env as Record<string, string | undefined>;

export const baseURL = env.VITE_SERVER_BASE_URL ?? "http://localhost:4000";

if (!env.VITE_SERVER_BASE_URL) {
  console.warn(
    "VITE_SERVER_BASE_URL is not set. Using default http://localhost:4000."
  );
}
