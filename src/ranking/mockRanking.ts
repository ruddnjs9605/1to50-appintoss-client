export type RankingEntry = {
  id: string;
  nickname: string;
  time: number;
};

const TOTAL_ENTRIES = 120;
const BASE_TIME = 18.4;
const STEP = 0.28;

export const mockRanking: RankingEntry[] = Array.from(
  { length: TOTAL_ENTRIES },
  (_, index) => {
    const time = BASE_TIME + index * STEP + (index % 5) * 0.03;
    const rankId = String(index + 1).padStart(3, "0");
    return {
      id: `user-${rankId}`,
      nickname: `Player${rankId}`,
      time: Number(time.toFixed(2)),
    };
  }
);
