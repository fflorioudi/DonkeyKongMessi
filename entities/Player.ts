import { rectsOverlap } from "@/game/collision";
import { CLIMB_SPEED, GRAVITY, JUMP_SPEED, MOVE_SPEED } from "@/game/physics";
import type { SpriteManager } from "@/game/Sprites";
import type { InputSnapshot, Ladder, Platform, PlayerState, Rect, Vec2 } from "@/game/types";

const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 40;

export class Player {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  state: PlayerState = "idle";
  grounded = false;
  facing: -1 | 1 = 1;

  constructor(spawn: Vec2) {
    this.x = spawn.x;
    this.y = spawn.y;
  }

  get rect(): Rect {
    return {
      x: this.x + 4,
      y: this.y + 3,
      width: PLAYER_WIDTH - 8,
      height: PLAYER_HEIGHT - 4,
    };
  }

  get drawRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
  }

  reset(spawn: Vec2) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.state = "idle";
    this.grounded = false;
  }

  update(dt: number, input: InputSnapshot, platforms: Platform[], ladders: Ladder[], worldWidth: number) {
    const ladder = findUsableLadder(this.rect, ladders);
    const canJump = this.grounded || this.state === "climb";
    const startsJump = input.jump && canJump;
    const wantsClimb = input.climb !== 0 && Boolean(ladder) && !startsJump;

    if (wantsClimb && ladder) {
      this.state = "climb";
      this.vx = 0;
      this.vy = input.climb * CLIMB_SPEED;
      this.x = ladder.x + ladder.width / 2 - PLAYER_WIDTH / 2;
      this.y += this.vy * dt;
      this.y = Math.max(ladder.y - PLAYER_HEIGHT + 8, Math.min(this.y, ladder.y + ladder.height - 8));
      this.grounded = false;
      return;
    }

    if (this.state === "climb" && input.move === 0 && !input.jump) {
      this.vy = 0;
      return;
    }

    this.vx = input.move * MOVE_SPEED;
    if (input.move !== 0) {
      this.facing = input.move;
    }

    if (startsJump) {
      this.vy = -JUMP_SPEED;
      this.grounded = false;
      this.state = "jump";
    }

    this.vy += GRAVITY * dt;
    const previousBottom = this.y + PLAYER_HEIGHT;

    this.x += this.vx * dt;
    this.x = Math.max(6, Math.min(worldWidth - PLAYER_WIDTH - 6, this.x));
    this.y += this.vy * dt;
    this.grounded = false;

    for (const platform of platforms) {
      const playerRect = this.rect;
      const platformTop = platform.y;
      const fallingOntoPlatform =
        this.vy >= 0 &&
        previousBottom <= platformTop + 8 &&
        playerRect.x + playerRect.width > platform.x &&
        playerRect.x < platform.x + platform.width &&
        this.y + PLAYER_HEIGHT >= platformTop &&
        this.y + PLAYER_HEIGHT <= platformTop + 34;

      if (fallingOntoPlatform) {
        this.y = platformTop - PLAYER_HEIGHT;
        this.vy = 0;
        this.grounded = true;
        break;
      }
    }

    if (!this.grounded) {
      this.state = "jump";
    } else if (input.move !== 0) {
      this.state = "run";
    } else {
      this.state = "idle";
    }
  }

  canUseLadder(ladders: Ladder[]) {
    return Boolean(findUsableLadder(this.rect, ladders));
  }

  draw(ctx: CanvasRenderingContext2D, isProtected = false, sprites?: SpriteManager, time = 0, spriteSheet = "messi") {
    const body = this.drawRect;
    const animation = this.state === "run" ? "run" : this.state === "climb" ? "climb" : this.state === "jump" ? "jump" : "idle";
    const frame = sprites?.animationFrame(spriteSheet, isProtected ? "hit" : animation, time, animation === "run" ? 10 : 6) ?? 0;

    ctx.save();
    ctx.globalAlpha = isProtected ? 0.58 : 1;

    if (sprites?.drawTrimmedFrame(ctx, spriteSheet, frame, body.x - 9, body.y - 18, 46, 58, this.facing === -1)) {
      if (isProtected) {
        ctx.strokeStyle = "#ffe45c";
        ctx.lineWidth = 2;
        ctx.strokeRect(body.x, body.y, body.width, body.height);
      }

      ctx.restore();
      return;
    }

    ctx.translate(body.x, body.y);

    if (isProtected) {
      ctx.strokeStyle = "#ffe45c";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, body.width - 2, body.height - 2);
    }

    ctx.fillStyle = "#77b7ff";
    ctx.fillRect(5, 13, 18, 20);

    ctx.fillStyle = "#f5c29c";
    ctx.fillRect(8, 2, 14, 13);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(7, 12, 16, 5);
    ctx.fillStyle = "#101820";
    ctx.font = "bold 8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("10", 15, 20);

    ctx.fillStyle = "#0c4a9a";
    ctx.fillRect(6, 33, 6, 7);
    ctx.fillRect(18, 33, 6, 7);

    ctx.fillStyle = "#1f2937";
    ctx.fillRect(this.facing === 1 ? 19 : 6, 6, 3, 3);
    ctx.restore();
  }
}

function findUsableLadder(rect: Rect, ladders: Ladder[]) {
  const probe = {
    x: rect.x - 8,
    y: rect.y + 2,
    width: rect.width + 16,
    height: rect.height,
  };

  return ladders.find((ladder) => rectsOverlap(probe, ladder));
}
