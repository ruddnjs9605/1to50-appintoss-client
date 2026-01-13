import BackButton from "../components/BackButton";
import GameCore from "../game/1to50/GameCore";
import type { OneToFiftyResult } from "../game/types";

type Props = {
  onFinish: (result: OneToFiftyResult) => void;
  onHome?: () => void;
};

export default function GamePage({ onFinish, onHome }: Props) {
  return (
    <div className="page">
      <div className="page-header-row">
        {onHome ? <BackButton onClick={onHome} /> : <div />}
        <div className="page-muted">1to50 플레이</div>
      </div>
      <GameCore onFinish={onFinish} />
    </div>
  );
}
