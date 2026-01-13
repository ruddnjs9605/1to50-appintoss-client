import {
  isMinVersionSupported,
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore,
} from "@apps-in-toss/web-framework";

type SubmitResult = {
  statusCode: string;
} | undefined;

const MIN_VERSION = {
  android: "5.221.0",
  ios: "5.221.0",
};

export async function submitLeaderboardScore(score: number) {
  const isSupported = isMinVersionSupported(MIN_VERSION);
  if (!isSupported) {
    console.warn("지원하지 않는 앱 버전이에요.");
    return;
  }

  try {
    const result: SubmitResult = await submitGameCenterLeaderBoardScore({
      score: score.toFixed(2),
    });

    if (!result) {
      console.warn("지원하지 않는 앱 버전이에요.");
      return;
    }

    if (result.statusCode === "SUCCESS") {
      console.log("점수 제출 성공!");
      return;
    }

    console.error("점수 제출 실패:", result.statusCode);
  } catch (error) {
    console.error("점수 제출 중 오류가 발생했어요.", error);
  }
}

export function openLeaderboard() {
  const isSupported = isMinVersionSupported(MIN_VERSION);
  if (!isSupported) {
    console.warn("지원하지 않는 앱 버전이에요.");
    return;
  }

  openGameCenterLeaderboard();
}
