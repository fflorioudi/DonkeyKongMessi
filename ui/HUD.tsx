import type { GameSnapshot } from "@/game/types";

type HUDProps = {
  snapshot: GameSnapshot;
};

export function HUD({ snapshot }: HUDProps) {
  return (
    <div className="hud" aria-live="polite">
      <div>
        <span className="hudLabel">Nivel</span>
        <strong>{snapshot.level}</strong>
      </div>
      <div>
        <span className="hudLabel">Vidas</span>
        <strong>x{snapshot.lives}</strong>
      </div>
      <div>
        <span className="hudLabel">Pts / Max</span>
        <strong>
          {snapshot.score}/{snapshot.highScore}
        </strong>
      </div>
      {snapshot.message && <div className="hudMessage">{snapshot.message}</div>}
    </div>
  );
}
