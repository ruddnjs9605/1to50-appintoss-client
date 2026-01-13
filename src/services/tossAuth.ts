import { appLogin } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";
import { baseURL } from "./api";

export const AUTH_USER_ID_KEY = "one-to-fifty:userId";

type UserProfile = {
  id: number;
  name: string | null;
  birthYear: number | null;
};

function loadStoredUserId() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.trunc(parsed);
}

function storeUserId(userId: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
}

function clearUserId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_USER_ID_KEY);
}

async function fetchMe(userId: number): Promise<UserProfile | null> {
  const response = await fetch(`${baseURL}/auth/me`, {
    method: "GET",
    headers: { "X-User-Id": String(userId) },
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data?.loggedIn) return null;

  return {
    id: userId,
    name: data.user?.name ?? null,
    birthYear: data.user?.birthYear ?? null,
  };
}

export function useTossAuth() {
  const [userId, setUserId] = useState<number | null>(() => loadStoredUserId());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isChecking, setIsChecking] = useState(Boolean(userId));
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setIsChecking(false);
      return;
    }

    let active = true;
    setIsChecking(true);
    fetchMe(userId)
      .then((profile) => {
        if (!active) return;
        if (!profile) {
          console.info("[toss-login] /auth/me not logged in");
          clearUserId();
          setUserId(null);
          setUser(null);
          return;
        }
        console.info("[toss-login] /auth/me logged in");
        setUser(profile);
      })
      .catch(() => {
        if (!active) return;
        console.error("[toss-login] /auth/me failed");
        clearUserId();
        setUserId(null);
        setUser(null);
      })
      .finally(() => {
        if (!active) return;
        setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const login = useCallback(async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      console.info("[toss-login] appLogin start");
      const loginResult = await appLogin();
      console.info("[toss-login] appLogin result", loginResult);
      if (!loginResult?.authorizationCode || !loginResult?.referrer) {
        throw new Error("Missing authorizationCode/referrer");
      }

      const response = await fetch(`${baseURL}/auth/toss/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorizationCode: loginResult.authorizationCode,
          referrer: loginResult.referrer,
        }),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errorBody = await response.json();
          if (errorBody?.message) {
            detail = String(errorBody.message);
          } else if (errorBody) {
            detail = JSON.stringify(errorBody);
          }
        } catch (parseError) {
          console.warn("[toss-login] error response parse failed", parseError);
        }
        console.error(
          "[toss-login] server response failed",
          response.status,
          detail
        );
        throw new Error(
          `서버 로그인 실패 (${response.status})${detail ? `: ${detail}` : ""}`
        );
      }

      const data = await response.json();
      console.info("[toss-login] server response", data);
      const nextUserId = Number(data?.userId);
      if (!Number.isFinite(nextUserId) || nextUserId <= 0) {
        throw new Error("Invalid userId");
      }

      storeUserId(nextUserId);
      setUserId(nextUserId);
      setUser({ id: nextUserId, name: null, birthYear: null });
      console.info("[toss-login] login completed", nextUserId);
    } catch (loginError) {
      let message =
        loginError instanceof Error
          ? loginError.message
          : "알 수 없는 오류가 발생했어요.";
      if (message.toLowerCase().includes("failed to fetch")) {
        message = `서버에 연결할 수 없어요. baseURL=${baseURL}`;
      }
      setError(`토스 로그인에 실패했어요. ${message}`);
      throw loginError;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearUserId();
    setUserId(null);
    setUser(null);
  }, []);

  return {
    isLoggedIn: Boolean(userId),
    isChecking,
    isLoggingIn,
    error,
    login,
    logout,
    user,
    userId,
  };
}
