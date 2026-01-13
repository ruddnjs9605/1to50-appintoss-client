type Props = {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties; // ✅ 추가
  variant?: "primary" | "ghost";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  style,
  variant = "primary",
  disabled = false,
}: Props) {
  return (
    <button
      className={`square-button ${variant}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
