import { useEffect, useRef, useState } from "react";
import type { ClickResult } from "./useGame";
import { useGame } from "./useGame";
import { useTimer } from "./useTimer";
import Header from "../../components/Header";
import GameBoard from "../../components/GameBoard";
import Button from "../../components/Button";
import Overlay from "../../components/Overlay";
import PauseOverlay from "../../components/PauseOverlay";
import { useRanking } from "../../ranking/useRanking";
import type { OneToFiftyGameCoreProps } from "../types";
import { submitLeaderboardScore } from "../../services/leaderboard";
import { submitOneToFiftyResult } from "../../services/oneToFiftyApi";

export default function GameCore({ onFinish }: OneToFiftyGameCoreProps) {
  const game = useGame();
  const [timerKey, setTimerKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const elapsed = useTimer(game.started && !game.cleared && !isPaused, timerKey);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { bestTime, addRecord } = useRanking();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const submittedRef = useRef(false);
  const resultRef = useRef<Awaited<ReturnType<typeof submitOneToFiftyResult>> | null>(
    null
  );
  const resultPromiseRef = useRef<Promise<
    Awaited<ReturnType<typeof submitOneToFiftyResult>>
  > | null>(null);
  const [feedback, setFeedback] = useState<("correct" | "wrong" | null)[]>(
    () => Array(25).fill(null)
  );

  const resetFeedback = () => setFeedback(Array(25).fill(null));

  const handleStart = () => {
    resetFeedback();
    setIsNewRecord(false);
    setIsPaused(false);
    setTimerKey((prev) => prev + 1);
    game.startGame();
  };

  const handleRestart = () => {
    resetFeedback();
    setIsNewRecord(false);
    setIsPaused(false);
    setTimerKey((prev) => prev + 1);
    game.restart();
  };

  const handleFinish = () => {
    if (resultRef.current) {
      onFinish(resultRef.current);
      return;
    }

    if (!resultPromiseRef.current) {
      resultPromiseRef.current = submitOneToFiftyResult(elapsed)
        .then((result) => {
          resultRef.current = result;
          resultPromiseRef.current = null;
          return result;
        })
        .catch((error) => {
          console.error("결과 전송에 실패했어요.", error);
          resultPromiseRef.current = null;
          throw error;
        });
    }

    resultPromiseRef.current
      .then((result) => {
        onFinish(result);
      })
      .catch(() => {});
  };

  const handleClick = (n: number | null, idx: number) => {
    if (isPaused) return;
    const result: ClickResult = game.onClick(n, idx);
    if (result === "ignored") return;

    setFeedback((prev) => {
      const next = [...prev];
      next[idx] = result;
      return next;
    });

    window.setTimeout(() => {
      setFeedback((prev) => {
        if (prev[idx] === null) return prev;
        const next = [...prev];
        next[idx] = null;
        return next;
      });
    }, 180);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (!game.cleared) return;
    if (elapsed <= 0) return;
    const { newRecord } = addRecord(elapsed);
    setIsNewRecord(newRecord);
  }, [game.cleared, elapsed, addRecord]);

  useEffect(() => {
    if (!game.started) {
      setIsNewRecord(false);
      setIsPaused(false);
      submittedRef.current = false;
      resultRef.current = null;
      resultPromiseRef.current = null;
    }
  }, [game.started]);

  useEffect(() => {
    if (!game.cleared) return;
    if (typeof window === "undefined") return;

    try {
      if (window.Android?.onGameFinished) {
        window.Android.onGameFinished();
      }
    } catch {
      // silently ignore bridge errors
    }
  }, [game.cleared]);

  useEffect(() => {
    if (!game.cleared) return;
    if (elapsed <= 0) return;
    if (submittedRef.current) return;

    submittedRef.current = true;
    if (!resultPromiseRef.current) {
      resultPromiseRef.current = submitOneToFiftyResult(elapsed)
        .then((result) => {
          resultRef.current = result;
          resultPromiseRef.current = null;
          return result;
        })
        .catch((error) => {
          console.error("결과 전송에 실패했어요.", error);
          resultPromiseRef.current = null;
          throw error;
        });
    }
    const timerId = window.setTimeout(() => {
      submitLeaderboardScore(elapsed);
    }, 600);

    return () => window.clearTimeout(timerId);
  }, [game.cleared, elapsed]);

  return (
    <div className="game-container">
      <Header
        elapsed={elapsed}
        theme={theme}
        onToggleTheme={toggleTheme}
        onPause={
          game.started && !game.cleared && !isPaused
            ? () => setIsPaused(true)
            : undefined
        }
      />

      <div className="best-record">
        <span>
          최고 기록: {bestTime !== null ? `${bestTime.toFixed(2)}초` : "아직 기록 없음"}
        </span>
        {isNewRecord && game.cleared && <span className="record-badge">신기록</span>}
      </div>

      <div className="next-number">
        다음 숫자: <b>{game.cleared ? "완료" : game.current}</b>
      </div>

      <div className="board-wrapper">
        <GameBoard board={game.board} onClick={handleClick} feedback={feedback} />

        {!game.started && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Button
              onClick={handleStart}
              variant="ghost"
              style={{ pointerEvents: "auto" }}
            >
              START
            </Button>
          </div>
        )}

        {game.cleared && (
          <Overlay
            time={elapsed}
            bestTime={bestTime}
            isNewRecord={isNewRecord}
            onRestart={handleRestart}
            onFinish={handleFinish}
          />
        )}

        {isPaused && !game.cleared && (
          <PauseOverlay
            time={elapsed}
            onResume={() => setIsPaused(false)}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
