import Button from "../components/Button";

type Props = {
  onLogin: () => void;
  isChecking?: boolean;
  isLoggingIn?: boolean;
  error?: string | null;
};

export default function Login({
  onLogin,
  isChecking,
  isLoggingIn,
  error,
}: Props) {
  const isLoading = Boolean(isChecking || isLoggingIn);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">토스 로그인</h1>
        <p className="page-subtitle">
          기록 저장 및 랭킹 참여를 위해 토스 로그인이 필요해요.
        </p>
        <p className="page-subtitle">토스 로그인 후 플레이 가능합니다.</p>
      </div>

      <div className="page-scroll">
        <div className="page-card">
          <div className="page-row">
            <strong>로그인 상태</strong>
            <span className="status-badge">로그인 전</span>
          </div>
          <p className="page-muted">
            토스 앱에서 로그인하면 자동으로 게임이 시작돼요.
          </p>
        </div>

        {error ? (
          <div className="page-card error-card">
            <strong>로그인 오류</strong>
            <p className="page-muted">{error}</p>
          </div>
        ) : null}
        <div className="login-bottom-spacer" />
      </div>

      <div className="login-fixed-actions">
        <Button onClick={onLogin} disabled={isLoading}>
          {isLoading ? "로그인 중..." : "토스로 계속하기"}
        </Button>
      </div>
    </div>
  );
}
