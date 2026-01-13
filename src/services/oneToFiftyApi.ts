import type { OneToFiftyResult } from "../game/types";
import { baseURL } from "./api";
import { AUTH_USER_ID_KEY } from "./tossAuth";

const API_URL = `${baseURL}/result`;

export async function submitOneToFiftyResult(
  time: number
): Promise<OneToFiftyResult> {
  const storedUserId =
    typeof window !== "undefined"
      ? window.localStorage.getItem(AUTH_USER_ID_KEY)
      : null;
  const userId = storedUserId ? Number(storedUserId) : null;
  if (!userId || !Number.isFinite(userId)) {
    throw new Error("Missing userId");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    },
    body: JSON.stringify({ time, userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit result");
  }

  return response.json();
}
