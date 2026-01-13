import { useMemo } from "react";
import BackButton from "../components/BackButton";
import type { OneToFiftyResult } from "../game/types";
import { mockRanking } from "../ranking/mockRanking";
import { openLeaderboard } from "../services/leaderboard";

type Props = {
  onBack: () => void;
  result: OneToFiftyResult | null;
  user: { id: number; name: string | null } | null;
};

const TOP_LIMIT = 30;

export default function Ranking({ onBack, result, user }: Props) {
  const displayName = user?.name ?? "사용자";
  const { entries, myRank, isInTop } = useMemo(() => {
    const base = [...mockRanking];
    const resolvedUserId = user ? String(user.id) : null;
    if (!result || !user || !resolvedUserId) {
      return {
        entries: base.slice(0, TOP_LIMIT),
        myRank: null,
        isInTop: false,
      };
    }

    const meEntry = {
      id: resolvedUserId,
      nickname: displayName,
      time: result.myTime,
    };

    const combined = [
      ...base.filter((entry) => entry.id !== resolvedUserId),
      meEntry,
    ];
    combined.sort((a, b) => a.time - b.time);

    const myIndex = combined.findIndex((entry) => entry.id === resolvedUserId);
    const rank = myIndex >= 0 ? myIndex + 1 : null;
    const topEntries = combined.slice(0, TOP_LIMIT);

    return {
      entries: topEntries,
      myRank: rank,
      isInTop: rank !== null && rank <= TOP_LIMIT,
    };
  }, [result, user]);
  const userId = user ? String(user.id) : null;

  const handleOpenLeaderboard = () => {
    openLeaderboard();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <BackButton onClick={onBack} />
          <div className="page-muted">읽기 전용</div>
        </div>
        <h1 className="page-title">기록 참고</h1>
        <p className="page-subtitle">전체 사용자 기록을 기반으로 한 참고 랭킹입니다.</p>
        <p className="page-subtitle">심사용 더미 데이터로 구성되어 있습니다.</p>
      </div>

      <div className="page-scroll">
        <div className="page-card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>내 기록</div>
          {result && user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="page-row">
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {result.myTime.toFixed(2)}초
                  </div>
                  <div className="page-muted">닉네임: {displayName}</div>
                </div>
                {myRank && (
                  <div className="ranking-rank-badge">#{myRank}</div>
                )}
              </div>
              <div className="page-muted">
                상위 {result.rankPercent}% (심사용)
              </div>
              {myRank && !isInTop && (
                <div className="page-muted">내 순위는 {myRank}위입니다.</div>
              )}
            </div>
          ) : (
            <div className="page-muted">아직 기록이 없습니다.</div>
          )}
        </div>

        <div className="page-card">
          <div className="page-row" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>TOP 30</div>
            <div className="page-muted">참고용 랭킹</div>
          </div>
          <div className="ranking-list">
            {entries.map((entry, index) => {
              const isMe = userId === entry.id;
              return (
                <div
                  key={entry.id}
                  className={`ranking-item ${isMe ? "is-me" : ""}`}
                >
                  <div className="ranking-rank">#{index + 1}</div>
                  <div className="ranking-name">{entry.nickname}</div>
                  <div className="ranking-time">{entry.time.toFixed(2)}초</div>
                  {isMe && <span className="ranking-tag">내 기록</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="page-card">
          <div className="page-row">
            <div>
              <div style={{ fontWeight: 700 }}>토스 공식 리더보드</div>
              <div className="page-muted">지원 버전에서만 열 수 있습니다.</div>
            </div>
            <button className="text-button" onClick={handleOpenLeaderboard}>
              리더보드 열기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
