import { useState } from "react";
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
  const { isLoggedIn, isChecking, isLoggingIn, error, login, user } =
    useTossAuth();
  const [page, setPage] = useState<Page>("game");
  const [lastResult, setLastResult] = useState<OneToFiftyResult | null>(null);
  const isTermsPage =
    typeof window !== "undefined" && window.location.pathname === "/terms";

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

  if (isTermsPage) {
    return <Terms />;
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
        isChecking={isChecking}
        isLoggingIn={isLoggingIn}
        error={error}
      />
    );
  }

  const startGame = () => {
    setLastResult(null);
    setPage("game");
  };

  switch (page) {
    case "game":
      return <GamePage onFinish={handleFinish} />;
    case "result":
      return (
        <Result
          result={lastResult}
          onRetry={startGame}
          onRanking={handleOpenLeaderboard}
          onShare={handleShareRecord}
          onHome={startGame}
          user={user}
        />
      );
    case "ranking":
      return <Ranking onBack={() => setPage("result")} result={lastResult} user={user} />;
    default:
      return null;
  }
}
