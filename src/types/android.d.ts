export {};

declare global {
  interface AndroidBridge {
    onGameFinished: () => void;
  }

  interface Window {
    Android?: AndroidBridge;
  }
}
