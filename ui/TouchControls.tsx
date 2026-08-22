"use client";

import { useEffect, useRef } from "react";
import type { InputManager } from "@/game/Input";
import type { Direction } from "@/game/types";

type TouchControlsProps = {
  input: InputManager | null;
  canClimb: boolean;
  disabled: boolean;
};

export function TouchControls({ input, canClimb, disabled }: TouchControlsProps) {
  const activeMoves = useRef(new Map<number, Direction>());
  const activeClimbs = useRef(new Map<number, Direction>());

  const syncMove = () => {
    const lastDirection = Array.from(activeMoves.current.values()).at(-1) ?? 0;
    input?.setMove(lastDirection);
  };

  const syncClimb = () => {
    const lastDirection = Array.from(activeClimbs.current.values()).at(-1) ?? 0;
    input?.setClimb(lastDirection);
  };

  const startMove = (pointerId: number, direction: Direction) => {
    if (disabled) {
      return;
    }

    activeMoves.current.clear();
    activeMoves.current.set(pointerId, direction);
    syncMove();
  };

  const stopMove = (pointerId: number) => {
    activeMoves.current.delete(pointerId);
    if (!disabled) {
      syncMove();
    }
  };

  const setClimb = (pointerId: number, direction: Direction) => {
    if (disabled) {
      return;
    }

    activeClimbs.current.set(pointerId, direction);
    syncClimb();
  };

  const stopClimb = (pointerId: number) => {
    activeClimbs.current.delete(pointerId);
    if (!disabled) {
      syncClimb();
    }
  };

  const jump = () => {
    if (!disabled) {
      input?.pressJump();
      vibrate();
    }
  };

  useEffect(() => {
    if (!disabled) {
      return;
    }

    activeMoves.current.clear();
    activeClimbs.current.clear();
    input?.setMove(0);
    input?.setClimb(0);
    input?.releaseJump();
  }, [disabled, input]);

  useEffect(() => {
    const releasePointer = (event: PointerEvent) => {
      activeMoves.current.delete(event.pointerId);
      activeClimbs.current.delete(event.pointerId);
      input?.setMove(Array.from(activeMoves.current.values()).at(-1) ?? 0);
      input?.setClimb(Array.from(activeClimbs.current.values()).at(-1) ?? 0);
      input?.releaseJump();
    };

    const resetAll = () => {
      activeMoves.current.clear();
      activeClimbs.current.clear();
      input?.reset();
    };

    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("mouseup", resetAll);
    window.addEventListener("touchcancel", resetAll);
    window.addEventListener("blur", resetAll);
    document.addEventListener("visibilitychange", resetAll);

    return () => {
      resetAll();
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("mouseup", resetAll);
      window.removeEventListener("touchcancel", resetAll);
      window.removeEventListener("blur", resetAll);
      document.removeEventListener("visibilitychange", resetAll);
    };
  }, [input]);

  return (
    <div className="touchControls" aria-hidden={disabled}>
      <div className="moveCluster">
        <TouchButton label="Izquierda" text="<" onDown={(pointerId) => startMove(pointerId, -1)} onUp={stopMove} />
        <TouchButton label="Derecha" text=">" onDown={(pointerId) => startMove(pointerId, 1)} onUp={stopMove} />
      </div>

      <div className="actionCluster">
        <div className={`climbCluster ${canClimb ? "isActive" : ""}`} aria-hidden={false}>
          <TouchButton label="Subir" text="^" onDown={(pointerId) => setClimb(pointerId, -1)} onUp={stopClimb} />
          <TouchButton label="Bajar" text="v" onDown={(pointerId) => setClimb(pointerId, 1)} onUp={stopClimb} />
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
  onDown: (pointerId: number) => void;
  onUp: (pointerId: number) => void;
};

function TouchButton({ label, text, size = "normal", onDown, onUp }: TouchButtonProps) {
  const activePointer = useRef<number | null>(null);

  const finishPointer = (target: HTMLButtonElement, pointerId: number) => {
    if (activePointer.current !== pointerId) {
      return;
    }

    target.dataset.pressed = "false";
    activePointer.current = null;

    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }

    onUp(pointerId);
  };

  return (
    <button
      className={`touchButton ${size === "large" ? "touchButtonLarge" : ""}`}
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.pressed = "true";
        vibrate();
        onDown(event.pointerId);
      }}
      onPointerUp={(event) => {
        finishPointer(event.currentTarget, event.pointerId);
      }}
      onPointerCancel={(event) => {
        finishPointer(event.currentTarget, event.pointerId);
      }}
      onPointerLeave={(event) => {
        finishPointer(event.currentTarget, event.pointerId);
      }}
      onPointerOut={(event) => {
        finishPointer(event.currentTarget, event.pointerId);
      }}
      onLostPointerCapture={(event) => {
        finishPointer(event.currentTarget, event.pointerId);
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {text}
    </button>
  );
}

function vibrate() {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate(8);
}
