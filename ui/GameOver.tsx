import type { GameSnapshot } from "@/game/types";

type GameOverProps = {
  onRestart: () => void;
  onMenu: () => void;
  snapshot: GameSnapshot;
};

export function GameOver({ onRestart, onMenu, snapshot }: GameOverProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Game Over</p>
      <h1>Otra vez desde Rosario</h1>
      <p>
        Puntos: {snapshot.score} / Max {snapshot.highScore}
        {snapshot.isNewHighScore && <strong className="recordBadge"> Nuevo max</strong>}
      </p>
      {snapshot.bestTime > 0 && <p>Mejor tiempo: {formatTime(snapshot.bestTime)}</p>}
      <div className="overlayActions">
        <button type="button" onClick={onRestart}>
          Reiniciar
        </button>
        <button type="button" className="secondaryButton" onClick={onMenu}>
          Inicio
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  return `${Math.max(0, seconds).toFixed(1)}s`;
}
