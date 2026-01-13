export type OneToFiftyResult = {
  myTime: number;
  rankPercent: number;
  averageTime: number;
  isLoggedIn?: boolean;
};

export interface OneToFiftyGameCoreProps {
  onFinish: (result: OneToFiftyResult) => void;
}
