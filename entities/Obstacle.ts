import { Ball } from "@/entities/Ball";
import { circleRectOverlap, rectsOverlap } from "@/game/collision";
import type { Platform, Rect, ObstacleSpawnerDefinition } from "@/game/types";
import type { SpriteManager } from "@/game/Sprites";

type ObstacleRuntimeDefinition = {
  spawnerId: string;
  x: number;
  y: number;
  obstacle: ObstacleSpawnerDefinition["obstacle"];
};

export class Obstacle {
  readonly spawnerId: string;
  readonly kind: ObstacleRuntimeDefinition["obstacle"]["kind"];
  private readonly ball?: Ball;
  private aliveState = true;
  private rect: Rect;
  private speed = 0;
  private direction: -1 | 1 = -1;
  private hitboxInset = 0;

  constructor(definition: ObstacleRuntimeDefinition) {
    this.spawnerId = definition.spawnerId;
    this.kind = definition.obstacle.kind;
    this.rect = {
      x: definition.x,
      y: definition.y,
      width: "width" in definition.obstacle ? definition.obstacle.width : 0,
      height: "height" in definition.obstacle ? definition.obstacle.height : 0,
    };

    if (definition.obstacle.kind === "ball") {
      this.ball = new Ball({
        x: definition.x,
        y: definition.y,
        radius: definition.obstacle.radius,
        speed: definition.obstacle.speed,
        direction: definition.obstacle.direction,
      });
      return;
    }

    if (definition.obstacle.kind === "red-card") {
      this.speed = definition.obstacle.speed;
      this.direction = definition.obstacle.direction;
      this.hitboxInset = definition.obstacle.hitboxInset ?? 3;
      return;
    }

    throw new Error(`Unsupported obstacle kind: ${definition.obstacle.kind}`);
  }

  get alive() {
    return this.ball?.alive ?? this.aliveState;
  }

  get bounds(): Rect {
    if (this.ball) {
      return {
        x: this.ball.x - this.ball.radius,
        y: this.ball.y - this.ball.radius,
        width: this.ball.radius * 2,
        height: this.ball.radius * 2,
      };
    }

    return this.rect;
  }

  destroy() {
    if (this.ball) {
      this.ball.alive = false;
      return;
    }

    this.aliveState = false;
  }

  update(dt: number, platforms: Platform[], worldWidth: number, worldHeight: number) {
    if (this.ball) {
      this.ball.update(dt, platforms, worldWidth, worldHeight);
      return;
    }

    this.rect.x += this.direction * this.speed * dt;

    if (
      this.rect.x + this.rect.width < -24 ||
      this.rect.x > worldWidth + 24 ||
      this.rect.y > worldHeight + 80
    ) {
      this.aliveState = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, sprites?: SpriteManager) {
    if (this.ball) {
      this.ball.draw(ctx, sprites);
      return;
    }

    if (this.kind === "red-card") {
      const frame = Math.abs(Math.floor(this.rect.x * 0.1)) % 8;
      sprites?.drawTrimmedFrame(ctx, "redCard", frame, this.rect.x - 6, this.rect.y - 7, this.rect.width + 12, this.rect.height + 14);
    }
  }

  collidesWith(rect: Rect) {
    if (this.ball) {
      return circleRectOverlap(this.ball, rect);
    }

    return rectsOverlap(this.hitbox, rect);
  }

  private get hitbox(): Rect {
    return {
      x: this.rect.x + this.hitboxInset,
      y: this.rect.y + this.hitboxInset,
      width: Math.max(1, this.rect.width - this.hitboxInset * 2),
      height: Math.max(1, this.rect.height - this.hitboxInset * 2),
    };
  }
}
