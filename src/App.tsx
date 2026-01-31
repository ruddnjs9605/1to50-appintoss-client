import { closeView, graniteEvent } from "@apps-in-toss/web-framework";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Button from "./components/Button";
import type { OneToFiftyResult } from "./game/types";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Ranking from "./pages/Ranking";
import Result from "./pages/Result";
import Terms from "./pages/Terms";
import { useTossAuth } from "./services/tossAuth";
import { openLeaderboard } from "./services/leaderboard";
import { shareMyRecord } from "./services/share";
import "./styles/game.css";
import "./styles/pages.css";

type Page = "game" | "result" | "ranking";

export default function App() {
  const { isChecking, isLoggingIn, error, status, login, user } = useTossAuth();
  const [page, setPage] = useState<Page>("game");
  const [lastResult, setLastResult] = useState<OneToFiftyResult | null>(null);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [canEnterGame, setCanEnterGame] = useState(false);
  const isTermsPage =
    typeof window !== "undefined" && window.location.pathname === "/terms";

  useEffect(() => {
    const preventZoom = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener("gesturestart", preventZoom);
    document.addEventListener("gesturechange", preventZoom);

    return () => {
      document.removeEventListener("gesturestart", preventZoom);
      document.removeEventListener("gesturechange", preventZoom);
    };
  }, []);

  useEffect(() => {
    let timerId: number | null = null;

    if (status === "loggedIn") {
      // 토스 검수 요구사항: 최초 화면은 로그인 화면 유지 후 자동 진입.
      setCanEnterGame(false);
      timerId = window.setTimeout(() => {
        setCanEnterGame(true);
      }, 2000);
    } else {
      setCanEnterGame(false);
    }

    return () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [status]);

  useEffect(() => {
    const handleExitRequest = () => {
      setIsExitOpen(true);
    };

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      handleExitRequest();
      window.history.pushState(null, "", window.location.href);
    };

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
    }

    const removeBackEvent = graniteEvent?.addEventListener?.("backEvent", {
      onEvent: handleExitRequest,
      onError: (error) => {
        console.warn("[navigation] backEvent error", error);
      },
    });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (typeof removeBackEvent === "function") {
        removeBackEvent();
      }
    };
  }, []);

  const handleLogin = async () => {
    try {
      await login();
      setPage("game");
    } catch (error) {
      console.error("로그인에 실패했어요.", error);
    }
  };

  const handleFinish = (result: OneToFiftyResult) => {
    setLastResult(result);
    setPage("result");
  };

  const handleOpenLeaderboard = () => {
    openLeaderboard();
  };

  const handleShareRecord = () => {
    if (!lastResult) return;
    shareMyRecord(lastResult);
  };

  const handleConfirmExit = async () => {
    setIsExitOpen(false);
    await closeView();
  };

  const handleCancelExit = () => {
    setIsExitOpen(false);
  };

  const isAutoLoginPending = status === "loggedIn" && !canEnterGame;
  const isLoginChecking = status === "checking" || isAutoLoginPending;
  const loginStatusLabel =
    status === "loggedIn" && !canEnterGame
      ? "자동 로그인 중"
      : status === "checking"
      ? "로그인 확인 중"
      : status === "unknown"
      ? "상태 확인 불가"
      : "로그인 전";
  const loginStatusMessage =
    status === "loggedIn" && !canEnterGame
      ? "잠시 후 게임이 시작돼요."
      : status === "unknown"
      ? "네트워크 상태를 확인해 주세요."
      : undefined;
  const loginError =
    status === "unknown" ? "네트워크 상태가 불안정해요." : error;

  let content: ReactNode = null;

  if (isTermsPage) {
    content = <Terms />;
  } else if (status !== "loggedIn" || !canEnterGame) {
    content = (
      <Login
        onLogin={handleLogin}
        isChecking={isChecking || isLoginChecking}
        isLoggingIn={isLoggingIn}
        error={loginError}
        statusLabel={loginStatusLabel}
        statusMessage={loginStatusMessage}
      />
    );
  } else {
    const startGame = () => {
      setLastResult(null);
      setPage("game");
    };

    switch (page) {
      case "game":
        content = <GamePage onFinish={handleFinish} />;
        break;
      case "result":
        content = (
          <Result
            result={lastResult}
            onRetry={startGame}
            onRanking={handleOpenLeaderboard}
            onShare={handleShareRecord}
            onHome={startGame}
            user={user}
          />
        );
        break;
      case "ranking":
        content = (
          <Ranking
            onBack={() => setPage("result")}
            result={lastResult}
            user={user}
          />
        );
        break;
      default:
        content = null;
    }
  }

  return (
    <>
      {content}
      {isExitOpen && (
        <div className="exit-modal" role="dialog" aria-modal="true">
          <div className="exit-modal-backdrop" />
          <div className="exit-modal-card">
            <h3 className="exit-modal-title">1to50을 종료할까요?</h3>
            <div className="exit-modal-actions">
              <Button variant="ghost" onClick={handleCancelExit}>
                취소
              </Button>
              <Button onClick={handleConfirmExit}>종료하기</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
