import { GoogleAdMob } from "@apps-in-toss/web-framework";

const TEST_AD_GROUP_ID = "ait-ad-test-rewarded-id";
const LOAD_TIMEOUT_MS = 4000;

let loadPromise: Promise<boolean> | null = null;

function isSupported() {
  const loadSupported = GoogleAdMob.loadAppsInTossAdMob.isSupported?.() !== false;
  const showSupported = GoogleAdMob.showAppsInTossAdMob.isSupported?.() !== false;
  return loadSupported && showSupported;
}

function loadRewardedAd(): Promise<boolean> {
  if (!isSupported()) {
    console.warn("[rewarded-ad] unsupported");
    return Promise.resolve(false);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    let resolved = false;
    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: {
        adGroupId: TEST_AD_GROUP_ID,
      },
      onEvent: (event) => {
        if (event.type !== "loaded" || resolved) return;
        resolved = true;
        cleanup?.();
        loadPromise = null;
        resolve(true);
      },
      onError: (error) => {
        if (resolved) return;
        console.warn("[rewarded-ad] load failed", error);
        resolved = true;
        cleanup?.();
        loadPromise = null;
        resolve(false);
      },
    });

    window.setTimeout(() => {
      if (resolved) return;
      console.warn("[rewarded-ad] load timeout");
      resolved = true;
      cleanup?.();
      loadPromise = null;
      resolve(false);
    }, LOAD_TIMEOUT_MS);
  });

  return loadPromise;
}

export async function showRewardedAdOnce() {
  if (!isSupported()) {
    console.warn("[rewarded-ad] unsupported");
    return "unsupported";
  }

  console.info("[rewarded-ad] start");
  const loaded = await loadRewardedAd();
  if (!loaded) {
    console.warn("[rewarded-ad] skipped (not loaded)");
    return "failed";
  }

  return new Promise<"rewarded" | "dismissed" | "failed">((resolve) => {
    let finished = false;
    let rewarded = false;

    const finish = (status: "rewarded" | "dismissed" | "failed") => {
      if (finished) return;
      finished = true;
      resolve(status);
    };

    GoogleAdMob.showAppsInTossAdMob({
      options: {
        adGroupId: TEST_AD_GROUP_ID,
      },
      onEvent: (event) => {
        switch (event.type) {
          case "requested":
            break;
          case "show":
          case "impression":
            break;
          case "userEarnedReward":
            rewarded = true;
            console.info("[rewarded-ad] success");
            finish("rewarded");
            break;
          case "dismissed":
            if (!rewarded) {
              console.warn("[rewarded-ad] dismissed");
              finish("dismissed");
            }
            break;
          case "failedToShow":
            console.warn("[rewarded-ad] failed to show");
            finish("failed");
            break;
          default:
            break;
        }
      },
      onError: (error) => {
        console.warn("[rewarded-ad] show error", error);
        finish("failed");
      },
    });
  });
}
