import { Ball } from "@/entities/Ball";
import { circleRectOverlap } from "@/game/collision";
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
  private readonly ball: Ball;

  constructor(definition: ObstacleRuntimeDefinition) {
    this.spawnerId = definition.spawnerId;
    this.kind = definition.obstacle.kind;

    if (definition.obstacle.kind !== "ball") {
      throw new Error(`Unsupported obstacle kind: ${definition.obstacle.kind}`);
    }

    this.ball = new Ball({
      x: definition.x,
      y: definition.y,
      radius: definition.obstacle.radius,
      speed: definition.obstacle.speed,
      direction: definition.obstacle.direction,
    });
  }

  get alive() {
    return this.ball.alive;
  }

  update(dt: number, platforms: Platform[], worldWidth: number, worldHeight: number) {
    this.ball.update(dt, platforms, worldWidth, worldHeight);
  }

  draw(ctx: CanvasRenderingContext2D, sprites?: SpriteManager) {
    this.ball.draw(ctx, sprites);
  }

  collidesWith(rect: Rect) {
    return circleRectOverlap(this.ball, rect);
  }
}
