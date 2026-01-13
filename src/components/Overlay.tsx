import Button from "./Button";

type Props = {
  time: number;
  bestTime: number | null;
  isNewRecord: boolean;
  onRestart?: () => void;
  onFinish?: () => void;
};

export default function Overlay({ time, bestTime, isNewRecord, onRestart, onFinish }: Props) {
  const hasActions = Boolean(onFinish || onRestart);

  return (
    <div className="overlay">
      <div className="overlay-box">
        <div className="overlay-title">🎉 클리어!</div>
        <div className="overlay-time">{time.toFixed(2)}초</div>
        {isNewRecord && <div className="overlay-record">신기록 달성!</div>}
        {bestTime !== null && (
          <div className="overlay-best">내 최고 기록: {bestTime.toFixed(2)}초</div>
        )}
        {hasActions && (
          <div className="overlay-actions">
            {onFinish && <Button onClick={onFinish}>결과 보기</Button>}
            {onRestart && (
              <Button variant={onFinish ? "ghost" : "primary"} onClick={onRestart}>
                다시하기
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
