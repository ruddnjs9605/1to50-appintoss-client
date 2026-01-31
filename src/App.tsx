import { closeView, graniteEvent } from "@apps-in-toss/web-framework";
import { useEffect, useState } from "react";
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
  const { isLoggedIn, isChecking, isLoggingIn, error, status, login, user } =
    useTossAuth();
  const [page, setPage] = useState<Page>("game");
  const [lastResult, setLastResult] = useState<OneToFiftyResult | null>(null);
  const [isExitOpen, setIsExitOpen] = useState(false);
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

  let content: JSX.Element | null = null;

  if (isTermsPage) {
    content = <Terms />;
  } else if (!isLoggedIn && status !== "unknown") {
    content = (
      <Login
        onLogin={handleLogin}
        isChecking={isChecking}
        isLoggingIn={isLoggingIn}
        error={error}
      />
    );
  } else if (!isLoggedIn && status === "unknown") {
    content = (
      <Login
        onLogin={handleLogin}
        isChecking
        isLoggingIn={isLoggingIn}
        error={"네트워크 상태가 불안정해요. 잠시 후 다시 시도해 주세요."}
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
