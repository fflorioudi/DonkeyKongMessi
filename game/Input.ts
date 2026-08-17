import type { Direction, InputSnapshot } from "./types";

export class InputManager {
  private move: Direction = 0;
  private climb: Direction = 0;
  private jumpPressed = false;
  private jumpQueued = false;

  setMove(direction: Direction) {
    this.move = direction;
  }

  setClimb(direction: Direction) {
    this.climb = direction;
  }

  pressJump() {
    this.jumpPressed = true;
    this.jumpQueued = true;
  }

  releaseJump() {
    this.jumpPressed = false;
  }

  snapshot(): InputSnapshot {
    const jump = this.jumpQueued || this.jumpPressed;
    this.jumpQueued = false;

    return {
      move: this.move,
      climb: this.climb,
      jump,
    };
  }

  reset() {
    this.move = 0;
    this.climb = 0;
    this.jumpPressed = false;
    this.jumpQueued = false;
  }
}
