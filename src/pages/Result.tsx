import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import type { OneToFiftyResult } from "../game/types";
import type { AgeGroup, StatsResponse } from "../services/statsApi";
import { fetchStats } from "../services/statsApi";
import type { TossUserProfile } from "../services/tossAuth";

type Props = {
  result: OneToFiftyResult | null;
  onRetry: () => void;
  onRanking: () => void;
  onShare: () => void;
  onHome: () => void;
  user?: TossUserProfile | null;
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
  user,
}: Props) {
  const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "10s", label: "10대" },
    { value: "20s", label: "20대" },
    { value: "30s", label: "30대" },
    { value: "40s", label: "40대+" },
  ];

  const hasAgeInfo = Boolean(user?.birthYear);
  const options = hasAgeInfo ? AGE_OPTIONS : AGE_OPTIONS.slice(0, 1);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(options[0].value);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!options.find((option) => option.value === ageGroup)) {
      setAgeGroup("all");
    }
  }, [options, ageGroup]);

  useEffect(() => {
    if (!result) return;
    let active = true;
    setStatsLoading(true);
    setStatsError(null);

    fetchStats(ageGroup)
      .then((data) => {
        if (!active) return;
        setStats(data);
      })
      .catch((error) => {
        if (!active) return;
        console.warn("[stats] failed", error);
        setStatsError("통계를 불러오지 못했어요.");
        setStats(null);
      })
      .finally(() => {
        if (!active) return;
        setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [result, ageGroup]);

  const ageLabel =
    options.find((option) => option.value === ageGroup)?.label ?? "전체";

  const fallbackDistribution = [2, 4, 7, 11, 15, 17, 14, 11, 8, 6, 5];
  const distribution = stats?.distribution?.length
    ? stats.distribution
    : fallbackDistribution;
  const maxValue = Math.max(...distribution, 1);
  const bucketSize = 100 / distribution.length;
  const percentile =
    stats?.percentile ?? (result ? result.rankPercent : null);
  const myBucket =
    percentile === null
      ? null
      : Math.min(
          distribution.length - 1,
          Math.max(0, Math.floor(percentile / bucketSize))
        );
  const averageTime =
    stats?.averageTime ?? (result ? result.averageTime : null);
  const averageLabel =
    averageTime !== null ? `${averageTime.toFixed(1)}초` : "데이터 없음";
  const performanceMessage =
    percentile !== null ? getPerformanceMessage(percentile) : null;

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
                <div className="result-rank">
                  {percentile !== null ? `${percentile}%` : "-"}
                </div>
              </div>
            </div>
            {performanceMessage ? (
              <div className="page-muted">{performanceMessage}</div>
            ) : null}
            <div className="page-muted">
              {ageLabel} 평균 기록: {averageLabel}{" "}
              {statsLoading ? "(불러오는 중)" : ""}
            </div>
            {percentile !== null ? (
              <div className="page-muted">
                {ageLabel} 사용자 중 상위 {percentile}%입니다.
              </div>
            ) : null}
            <div style={{ fontWeight: 700 }}>이번 기록이 저장되었습니다.</div>
            {percentile !== null && percentile <= 10 && (
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
            <div style={{ fontWeight: 700 }}>{ageLabel} 기록 분포</div>
            <div className="page-muted">내 위치 표시</div>
          </div>
          {options.length > 1 && (
            <div className="segment-group">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`segment-button ${
                    ageGroup === option.value ? "active" : ""
                  }`}
                  onClick={() => setAgeGroup(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {statsError ? (
            <div className="page-muted" style={{ marginTop: 8 }}>
              {statsError}
            </div>
          ) : null}
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
            {stats && stats.sampleCount < 20 && (
              <div className="page-muted" style={{ marginTop: 8 }}>
                표본 수가 적어 참고용 데이터입니다.
              </div>
            )}
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
