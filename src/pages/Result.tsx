import BackButton from "../components/BackButton";
import Button from "../components/Button";
import type { OneToFiftyResult } from "../game/types";

type Props = {
  result: OneToFiftyResult | null;
  onRetry: () => void;
  onRanking: () => void;
  onShare: () => void;
  onHome: () => void;
};

function getPerformanceMessage(rankPercent: number) {
  if (rankPercent <= 10) return "최상위권 기록입니다.";
  if (rankPercent <= 30) return "평균보다 빠릅니다.";
  if (rankPercent <= 60) return "평균 수준에 가깝습니다.";
  return "조금 더 연습해보세요.";
}

export default function Result({
  result,
  onRetry,
  onRanking,
  onShare,
  onHome,
}: Props) {
  const distribution = [2, 4, 7, 11, 15, 17, 14, 11, 8, 6, 5];
  const maxValue = Math.max(...distribution);
  const bucketSize = 100 / distribution.length;
  const myBucket =
    result === null
      ? null
      : Math.min(
          distribution.length - 1,
          Math.max(0, Math.floor(result.rankPercent / bucketSize))
        );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <BackButton onClick={onHome} />
          <div className="page-muted">나의 기록</div>
        </div>
        <h1 className="page-title">나의 기록 보기</h1>
        <p className="page-subtitle">내 기록과 전체 분포 속 위치를 확인하세요.</p>
      </div>

      <div className="result-hero">
        {result ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="result-metrics">
            <div className="result-metric">
              <div className="result-metric-label">내 기록</div>
              <div className="result-time">{result.myTime.toFixed(2)}초</div>
            </div>
              <div className="result-metric">
                <div className="result-metric-label">상위</div>
                <div className="result-rank">{result.rankPercent}%</div>
              </div>
            </div>
            <div className="page-muted">{getPerformanceMessage(result.rankPercent)}</div>
            <div className="page-muted">
              평균 기록: {result.averageTime.toFixed(1)}초 (샘플)
            </div>
            <div style={{ fontWeight: 700 }}>이번 기록이 저장되었습니다.</div>
            {result.rankPercent <= 10 && (
              <div className="result-badge">상위 10% 진입</div>
            )}
          </div>
        ) : (
          <div className="page-muted">기록이 없습니다. 한 판 플레이해 주세요.</div>
        )}
      </div>

      {result && (
        <div className="page-card">
          <div className="page-row" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>전체 사용자 기록 분포 (샘플)</div>
            <div className="page-muted">내 위치 표시</div>
          </div>
          <div className="result-chart">
            <div className="result-chart-bars">
              {distribution.map((value, idx) => (
                <div
                  key={`dist-${idx}`}
                  className={`result-bar ${idx === myBucket ? "is-me" : ""}`}
                  aria-label={`상위 ${Math.round((idx + 1) * bucketSize)}% 구간`}
                >
                  <div
                    className="result-bar-fill"
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="result-chart-labels">
              <span>상위 1%</span>
              <span>상위 100%</span>
            </div>
            <div className="result-chart-legend">
              <span className="legend-dot" />
              내 위치
            </div>
          </div>
        </div>
      )}

      <div className="page-actions result-actions">
        <Button onClick={onRetry}>다시하기</Button>
        <Button onClick={onRanking}>랭킹 보기</Button>
        <Button onClick={onShare}>내 기록 공유하기</Button>
      </div>
    </div>
  );
}
