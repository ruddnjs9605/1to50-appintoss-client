
type Props = {
  value: number | null;
  status: "correct" | "wrong" | null;
  onClick: () => void;
};

export default function Card({ value, status, onClick }: Props) {
  return (
    <div className={`card ${value !== null ? "flipped" : ""} ${status ?? ""}`} onClick={onClick}>
      <div className="card-inner">
        {typeof value === "number" ? (
          <div className="card-back">{String(value).padStart(2, " ")}</div>
        ) : (
          <div className="card-front">?</div>
        )}
      </div>
    </div>
  );
}
