import Card from "./Card";

type Props = {
  board: (number | null)[];
  onClick: (n: number | null, i: number) => void;
  feedback?: ("correct" | "wrong" | null)[];
};

export default function GameBoard({ board, onClick, feedback }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: "clamp(6px, 2.5vw, 10px)",
      }}
    >
      {board.map((n, i) => (
        <Card
          key={i}
          value={n}
          status={feedback?.[i] ?? null}
          onClick={() => onClick(n, i)}
        />
      ))}
    </div>
  );
}
