import Button from "./Button";

type Props = {
  time: number;
  onResume: () => void;
  onRestart: () => void;
};

export default function PauseOverlay({ time, onResume, onRestart }: Props) {
  return (
    <div className="overlay">
      <div className="overlay-box">
        <div className="overlay-title">⏸ 일시정지</div>
        <div className="overlay-time">{time.toFixed(2)}초</div>
        <div className="overlay-actions">
          <Button onClick={onResume}>계속하기</Button>
          <Button variant="ghost" onClick={onRestart}>
            다시하기
          </Button>
        </div>
      </div>
    </div>
  );
}
