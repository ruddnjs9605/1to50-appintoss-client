import { GoogleAdMob } from "@apps-in-toss/web-framework";

const AD_GROUP_ID = "ait.v2.live.3a3f6f467be94b4e";
const LOAD_TIMEOUT_MS = 4000;

let loadPromise: Promise<boolean> | null = null;

function isSupported() {
  const loadSupported = GoogleAdMob.loadAppsInTossAdMob.isSupported?.() !== false;
  const showSupported = GoogleAdMob.showAppsInTossAdMob.isSupported?.() !== false;
  return loadSupported && showSupported;
}

function loadInterstitialAd(): Promise<boolean> {
  if (!isSupported()) {
    console.warn("[interstitial-ad] unsupported");
    return Promise.resolve(false);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    let resolved = false;
    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: {
        adGroupId: AD_GROUP_ID,
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
        console.warn("[interstitial-ad] load failed", error);
        resolved = true;
        cleanup?.();
        loadPromise = null;
        resolve(false);
      },
    });

    window.setTimeout(() => {
      if (resolved) return;
      console.warn("[interstitial-ad] load timeout");
      resolved = true;
      cleanup?.();
      loadPromise = null;
      resolve(false);
    }, LOAD_TIMEOUT_MS);
  });

  return loadPromise;
}

export async function showInterstitialAdOnce() {
  if (!isSupported()) {
    console.warn("[interstitial-ad] unsupported");
    return "unsupported";
  }

  console.info("[interstitial-ad] start");
  const loaded = await loadInterstitialAd();
  if (!loaded) {
    console.warn("[interstitial-ad] skipped (not loaded)");
    return "failed";
  }

  return new Promise<"dismissed" | "failed">((resolve) => {
    let finished = false;

    const finish = (status: "dismissed" | "failed") => {
      if (finished) return;
      finished = true;
      resolve(status);
    };

    try {
      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event) => {
          switch (event.type) {
            case "requested":
              break;
            case "show":
            case "impression":
              break;
            case "dismissed":
              console.info("[interstitial-ad] dismissed");
              finish("dismissed");
              break;
            case "failedToShow":
              console.warn("[interstitial-ad] failed to show");
              finish("failed");
              break;
            default:
              break;
          }
        },
        onError: (error) => {
          console.warn("[interstitial-ad] show error", error);
          finish("failed");
        },
      });
    } catch (error) {
      console.warn("[interstitial-ad] show exception", error);
      finish("failed");
    }
  });
}
