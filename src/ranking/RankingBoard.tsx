type Props = {
  records: number[];
};

export default function RankingBoard({ records }: Props) {
  const hasRecords = records.length > 0;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>🏆 랭킹</h3>

      {!hasRecords && <div style={{ color: "#888" }}>기록이 없어요. 한 번 클리어해보세요!</div>}

      {records.map((time, idx) => (
        <div key={`${time}-${idx}`}>
          {idx + 1}위 - {time.toFixed(2)}초
        </div>
      ))}
    </div>
  );
}
