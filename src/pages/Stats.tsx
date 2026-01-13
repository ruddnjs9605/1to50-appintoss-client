import BackButton from "../components/BackButton";
import type { OneToFiftyResult } from "../game/types";

type Props = {
  onBack: () => void;
  age?: number | null;
  result: OneToFiftyResult | null;
};

const AGE_BENCHMARKS: Record<
  string,
  { mean: number; sd: number; label: string }
> = {
  teens: { mean: 32, sd: 6, label: "10대 (샘플)" },
  "20s": { mean: 28, sd: 5, label: "20대 (샘플)" },
  "30s": { mean: 26, sd: 5, label: "30대 (샘플)" },
  "40s": { mean: 27, sd: 6, label: "40대 (샘플)" },
  "50s": { mean: 30, sd: 7, label: "50대+ (샘플)" },
};

function getAgeKey(age?: number | null) {
  if (!age || Number.isNaN(age)) return "20s";
  if (age < 20) return "teens";
  if (age < 30) return "20s";
  if (age < 40) return "30s";
  if (age < 50) return "40s";
  return "50s";
}

export default function Stats({ onBack, age, result }: Props) {
  const ageKey = getAgeKey(age);

  const benchmark = AGE_BENCHMARKS[ageKey];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <BackButton onClick={onBack} />
          <div className="page-muted">읽기 전용</div>
        </div>
        <h1 className="page-title">내 기록 비교</h1>
        <p className="page-subtitle">샘플 평균과 비교한 심사용 통계입니다.</p>
      </div>

      <div className="page-scroll">
        <div className="page-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>나이대 (통계용, 선택)</div>
            <div className="page-muted">{AGE_BENCHMARKS[ageKey].label}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700 }}>평균 기록 (샘플)</div>
            <div className="page-muted">{benchmark.mean.toFixed(1)}초</div>
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
              {result ? `상위 ${result.rankPercent}% 이내` : "기록이 필요합니다"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
