type Props = {
  elapsed: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onPause?: () => void;
};

export default function Header({ elapsed, theme, onToggleTheme, onPause }: Props) {
  return (
    <div className="header">
      <div>
        <h2 className="title">1 to 50</h2>
        <div className="timer">⏱ {elapsed.toFixed(2)}초</div>
      </div>
      <div className="header-actions">
        {onPause && (
          <button className="pause-toggle" onClick={onPause}>
            일시정지
          </button>
        )}
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "light" ? "다크 모드" : "라이트 모드"}
        </button>
      </div>
    </div>
  );
}
