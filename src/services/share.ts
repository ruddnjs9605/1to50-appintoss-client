import { getTossShareLink, share } from "@apps-in-toss/web-framework";
import type { OneToFiftyResult } from "../game/types";

const SHARE_URL = "intoss://1to50";
const SHARE_OG_IMAGE =
  "https://static.toss.im/icons/png/4x/icon-share-dots-mono.png";

export async function shareMyRecord(result: OneToFiftyResult) {
  try {
    const link = await getTossShareLink(SHARE_URL, SHARE_OG_IMAGE);
    const message = `1to50 기록 ${result.myTime.toFixed(
      2
    )}초 (상위 ${result.rankPercent}%)\n${link}`;
    await share({ message });
  } catch (error) {
    console.error("기록 공유 중 오류가 발생했어요.", error);
  }
}
