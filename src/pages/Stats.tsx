import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import type { OneToFiftyResult } from "../game/types";
import type { AgeGroup, StatsResponse } from "../services/statsApi";
import { fetchStats } from "../services/statsApi";
import type { TossUserProfile } from "../services/tossAuth";

type Props = {
  onBack: () => void;
  result: OneToFiftyResult | null;
  user?: TossUserProfile | null;
};

export default function Stats({ onBack, result, user }: Props) {
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
  const distribution = stats?.distribution ?? [];
  const maxValue = Math.max(...distribution, 1);
  const bucketSize = distribution.length ? 100 / distribution.length : 100;
  const percentile =
    stats?.percentile ?? (result ? result.rankPercent : null);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <BackButton onClick={onBack} />
          <div className="page-muted">읽기 전용</div>
        </div>
        <h1 className="page-title">내 기록 비교</h1>
        <p className="page-subtitle">연령대별 평균과 분포를 확인하세요.</p>
      </div>

      <div className="page-scroll">
        <div
          className="page-card"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>기준 연령대</div>
            <div className="page-muted">
              {ageLabel} {statsLoading ? "(불러오는 중)" : ""}
            </div>
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

          {statsError ? <div className="page-muted">{statsError}</div> : null}

          <div>
            <div style={{ fontWeight: 700 }}>평균 기록</div>
            <div className="page-muted">
              {stats?.averageTime !== null && stats?.averageTime !== undefined
                ? `${stats.averageTime.toFixed(1)}초`
                : "데이터 없음"}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700 }}>내 기록</div>
            <div className="page-muted">
              {result ? `${result.myTime.toFixed(2)}초` : "아직 기록 없음"}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700 }}>내 실력 위치</div>
            <div className="page-muted">
              {percentile !== null ? `상위 ${percentile}% 이내` : "기록이 필요합니다"}
            </div>
          </div>

          {stats?.sampleCount !== undefined && stats.sampleCount < 20 && (
            <div className="page-muted">표본 수가 적어 참고용 데이터입니다.</div>
          )}
        </div>

        {distribution.length > 0 && (
          <div className="page-card">
            <div className="page-row" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>{ageLabel} 기록 분포</div>
              <div className="page-muted">내 위치 표시</div>
            </div>
            <div className="result-chart">
              <div className="result-chart-bars">
                {distribution.map((value, idx) => (
                  <div
                    key={`dist-${idx}`}
                    className="result-bar"
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
      </div>
    </div>
  );
}
