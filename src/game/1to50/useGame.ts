import { useState } from "react";
import { shuffle } from "./shuffle";

export type ClickResult = "correct" | "wrong" | "ignored";

export function useGame() {
  const [board, setBoard] = useState<(number | null)[]>(Array(25).fill(null));
  const [, setQueue] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [started, setStarted] = useState(false);
  const [cleared, setCleared] = useState(false);

  const startGame = () => {
    setBoard(shuffle(Array.from({ length: 25 }, (_, i) => i + 1)));
    setQueue(shuffle(Array.from({ length: 25 }, (_, i) => i + 26)));
    setCurrent(1);
    setStarted(true);
    setCleared(false);
  };

  const restart = () => {
    setBoard(Array(25).fill(null));
    setQueue([]);
    setCurrent(1);
    setStarted(false);
    setCleared(false);
  };

  const onClick = (n: number | null, idx: number): ClickResult => {
    if (!started) return "ignored";
    if (n !== current) return "wrong";

    if (n === 50) {
      setCleared(true);
      return "correct";
    }

    setQueue((prevQueue) => {
      const [nextNumber, ...rest] = prevQueue;

      setBoard((prevBoard) => {
        const updated = [...prevBoard];
        updated[idx] =
          typeof nextNumber === "number" ? nextNumber : null; // 26 이후는 빈칸으로 복귀
        return updated;
      });

      return rest;
    });

    setCurrent((c) => c + 1);
    return "correct";
  };

  return {
    board,
    current,
    started,
    cleared,
    startGame,
    restart,
    onClick,
  };
}
