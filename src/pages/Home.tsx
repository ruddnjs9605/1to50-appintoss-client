import Button from "../components/Button";

type Props = {
  user: { nickname: string; age: number } | null;
  onStart: () => void;
  onRanking: () => void;
  onStats: () => void;
  onLogout: () => void;
};

export default function Home({ user, onStart, onRanking, onStats, onLogout }: Props) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">1 to 50</h1>
        <p className="page-subtitle">1부터 50까지 순서대로 터치하세요.</p>
        <p className="page-subtitle">최단 시간에 도전해보세요.</p>
      </div>

      <div className="page-card">
        <div className="page-row">
          <div>
            <div style={{ fontWeight: 700 }}>내 프로필</div>
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="page-muted">닉네임: {user.nickname} (기록 식별용)</div>
                <div className="page-muted">나이: {user.age}세 (통계용, 선택)</div>
              </div>
            ) : (
              <div className="page-muted">로그인 정보를 불러오는 중입니다.</div>
            )}
          </div>
          <button className="text-button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="page-actions">
        <Button onClick={onStart}>도전 시작</Button>
      </div>

      <div className="page-links">
        <button className="text-button" onClick={onRanking}>
          기록 참고
        </button>
        <button className="text-button" onClick={onStats}>
          내 기록 비교
        </button>
      </div>
    </div>
  );
}
