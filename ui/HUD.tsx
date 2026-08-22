import type { GameSnapshot } from "@/game/types";

type HUDProps = {
  snapshot: GameSnapshot;
};

export function HUD({ snapshot }: HUDProps) {
  return (
    <div className="hud" aria-live="polite">
      <div>
        <span className="hudLabel">Etapa</span>
        <strong>{snapshot.levelLabel}</strong>
      </div>
      <div>
        <span className="hudLabel">Vidas</span>
        <strong>x{snapshot.lives}</strong>
      </div>
      <div>
        <span className="hudLabel">T {formatTime(snapshot.elapsedTime)}</span>
        <strong>
          {snapshot.score}/{snapshot.highScore}
        </strong>
      </div>
      {snapshot.activePowerUp && (
        <div className="hudPower">
          <span>{snapshot.activePowerUp.label}</span>
          <strong>{formatTime(snapshot.activePowerUp.remaining)}</strong>
        </div>
      )}
      {snapshot.message && <div className="hudMessage">{snapshot.message}</div>}
    </div>
  );
}

function formatTime(seconds: number) {
  return `${Math.max(0, seconds).toFixed(1)}s`;
}
