type Props = {
  onClick: () => void;
  label?: string;
};

export default function BackButton({ onClick, label = "뒤로 가기" }: Props) {
  return (
    <button className="back-button" onClick={onClick}>
      ← {label}
    </button>
  );
}
