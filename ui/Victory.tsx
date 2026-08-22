import Image from "next/image";
import type { GameSnapshot } from "@/game/types";

type VictoryProps = {
  snapshot: GameSnapshot;
  onRestart: () => void;
  onMenu: () => void;
  onNextLevel: () => void;
  canNextLevel: boolean;
};

export function Victory({ snapshot, onRestart, onMenu, onNextLevel, canNextLevel }: VictoryProps) {
  const imageSrc = snapshot.levelIndex === 0 ? "/assets/ui/final-level-0.png" : "/assets/ui/final-level-1.png";

  return (
    <div className="imageOverlay victoryOverlay" role="dialog" aria-label="Nivel completo">
      <Image src={imageSrc} alt="" fill sizes="390px" priority />
      <strong className="victoryStat victoryTime">{formatTime(snapshot.elapsedTime)}</strong>
      <strong className="victoryStat victoryBest">{snapshot.highScore}</strong>
      <strong className="victoryStat victoryScore">{snapshot.score}</strong>
      <button className="imageHotspot victoryNext" type="button" disabled={!canNextLevel} onClick={onNextLevel}>
        <span className="srOnly">Siguiente nivel</span>
      </button>
      <button className="imageHotspot victoryRestart" type="button" onClick={onRestart}>
        <span className="srOnly">Jugar de nuevo</span>
      </button>
      <button className="imageHotspot victoryHome" type="button" onClick={onMenu}>
        <span className="srOnly">Inicio</span>
      </button>
    </div>
  );
}

function formatTime(seconds: number) {
  return `${Math.max(0, seconds).toFixed(1)}s`;
}
