import type { InputManager } from "@/game/Input";
import type { Direction } from "@/game/types";

type TouchControlsProps = {
  input: InputManager | null;
  canClimb: boolean;
  disabled: boolean;
};

export function TouchControls({ input, canClimb, disabled }: TouchControlsProps) {
  const startMove = (direction: Direction) => {
    if (!disabled) input?.setMove(direction);
  };

  const stopMove = () => {
    if (!disabled) input?.setMove(0);
  };

  const setClimb = (direction: Direction) => {
    if (!disabled) input?.setClimb(direction);
  };

  const stopClimb = () => input?.setClimb(0);

  const jump = () => {
    if (!disabled) input?.pressJump();
  };

  return (
    <div className="touchControls" aria-hidden={disabled}>
      <div className="moveCluster">
        <TouchButton label="Izquierda" text="<" onDown={() => startMove(-1)} onUp={stopMove} />
        <TouchButton label="Derecha" text=">" onDown={() => startMove(1)} onUp={stopMove} />
      </div>

      <div className="actionCluster">
        <div className={`climbCluster ${canClimb ? "isActive" : ""}`}>
          <TouchButton label="Subir" text="^" onDown={() => setClimb(-1)} onUp={stopClimb} />
          <TouchButton label="Bajar" text="v" onDown={() => setClimb(1)} onUp={stopClimb} />
        </div>
        <TouchButton label="Saltar" text="J" size="large" onDown={jump} onUp={() => input?.releaseJump()} />
      </div>
    </div>
  );
}

type TouchButtonProps = {
  label: string;
  text: string;
  size?: "normal" | "large";
  onDown: () => void;
  onUp: () => void;
};

function TouchButton({ label, text, size = "normal", onDown, onUp }: TouchButtonProps) {
  return (
    <button
      className={`touchButton ${size === "large" ? "touchButtonLarge" : ""}`}
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onDown();
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        onUp();
      }}
      onPointerCancel={onUp}
      onContextMenu={(event) => event.preventDefault()}
    >
      {text}
    </button>
  );
}
