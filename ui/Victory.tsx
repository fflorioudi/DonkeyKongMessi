import type { GameSnapshot } from "@/game/types";

type VictoryProps = {
  snapshot: GameSnapshot;
  onRestart: () => void;
  onMenu: () => void;
};

export function Victory({ snapshot, onRestart, onMenu }: VictoryProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Level Complete</p>
      <h1>La 10 ya esta arriba</h1>
      <p>
        Puntos: {snapshot.score}
        {snapshot.isNewHighScore && <strong className="recordBadge"> Nuevo max</strong>}
      </p>
      <div className="scoreSummary" aria-label="Resumen de puntos">
        <span>Progreso</span>
        <strong>{snapshot.scoreBreakdown.progress}</strong>
        <span>Meta</span>
        <strong>{snapshot.scoreBreakdown.completion}</strong>
        <span>Vidas</span>
        <strong>{snapshot.scoreBreakdown.lives}</strong>
        <span>Tiempo</span>
        <strong>{snapshot.scoreBreakdown.time}</strong>
      </div>
      <p>
        Tiempo: {formatTime(snapshot.elapsedTime)}
        {snapshot.bestTime > 0 && ` / Mejor ${formatTime(snapshot.bestTime)}`}
        {snapshot.isNewBestTime && <strong className="recordBadge"> Nuevo tiempo</strong>}
      </p>
      <div className="overlayActions">
        <button type="button" onClick={onRestart}>
          Jugar de nuevo
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
