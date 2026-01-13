export default function Terms() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">서비스 이용약관</h1>
        <p className="page-subtitle">1to50 게임 (테스트/초기 서비스)</p>
      </div>

      <div className="page-card">
        <h3>1. 서비스 안내</h3>
        <p className="page-muted">
          1to50 게임은 1부터 50까지 숫자를 빠르게 순서대로 터치하는 간단한
          순발력/집중력 게임입니다. 토스 앱 인앱 서비스로 제공됩니다.
        </p>
      </div>

      <div className="page-card">
        <h3>2. 제공 기능</h3>
        <ul className="page-muted">
          <li>게임 플레이</li>
          <li>개인 최고 기록 저장</li>
          <li>전체 사용자 기준 통계 제공</li>
          <li>토스 게임센터 리더보드 연동</li>
        </ul>
      </div>

      <div className="page-card">
        <h3>3. 수집하는 정보와 이용 목적</h3>
        <ul className="page-muted">
          <li>토스 로그인 식별자(userKey): 기록 저장 및 통계 제공</li>
          <li>게임 플레이 기록(클리어 시간): 기록 저장 및 통계 제공</li>
        </ul>
        <p className="page-muted">
          닉네임, 이메일, 전화번호는 수집하지 않습니다.
        </p>
      </div>

      <div className="page-card">
        <h3>4. 보관 기간</h3>
        <p className="page-muted">
          기록 데이터는 서비스 제공을 위해 필요한 기간 동안 보관합니다. 테스트/초기
          서비스 단계에서 운영 방식은 변경될 수 있습니다.
        </p>
      </div>

      <div className="page-card">
        <h3>5. 서비스 변경 및 중단</h3>
        <p className="page-muted">
          테스트/초기 서비스 단계에서는 기능과 제공 범위가 변경될 수 있으며, 필요
          시 서비스가 중단될 수 있습니다.
        </p>
      </div>

      <div className="page-card">
        <h3>6. 책임 제한</h3>
        <p className="page-muted">
          서비스는 현재 상태 그대로 제공됩니다. 네트워크 상태나 기기 환경에 따라
          일시적인 오류가 발생할 수 있습니다.
        </p>
      </div>

      <div className="page-card">
        <h3>7. 문의</h3>
        <p className="page-muted">
          이용 중 문의가 필요하면 토스 앱 내 고객센터를 통해 연락해 주세요.
        </p>
      </div>
    </div>
  );
}
