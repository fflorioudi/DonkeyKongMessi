import type { BallDefinition } from "@/game/types";
import type { Platform } from "@/game/types";
import { GRAVITY } from "@/game/physics";

export class Ball {
  x: number;
  y: number;
  vy = 0;
  radius: number;
  direction: -1 | 1;
  alive = true;
  private speed: number;

  constructor(definition: BallDefinition) {
    this.x = definition.x;
    this.y = definition.y;
    this.radius = definition.radius;
    this.speed = definition.speed;
    this.direction = definition.direction;
  }

  update(dt: number, platforms: Platform[], worldWidth: number, worldHeight: number) {
    const previousBottom = this.y + this.radius;
    const wasFalling = this.vy > 0;
    const bottomPlatformY = Math.max(...platforms.map((platform) => platform.y));

    this.x += this.direction * this.speed * dt;

    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.direction = 1;
    }

    if (this.x + this.radius >= worldWidth) {
      this.x = worldWidth - this.radius;
      this.direction = -1;
    }

    if (!this.hasSupport(platforms)) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
    }

    for (const platform of platforms) {
      const platformTop = platform.y;
      const landsOnPlatform =
        this.vy >= 0 &&
        previousBottom <= platformTop + 8 &&
        this.x + this.radius > platform.x &&
        this.x - this.radius < platform.x + platform.width &&
        this.y + this.radius >= platformTop &&
        this.y + this.radius <= platformTop + 34;

      if (landsOnPlatform) {
        if (platform.y === bottomPlatformY) {
          this.alive = false;
          return;
        }

        this.y = platformTop - this.radius;
        this.vy = 0;

        if (wasFalling) {
          this.direction = this.direction === 1 ? -1 : 1;
        }

        break;
      }
    }

    if (this.y - this.radius > worldHeight + 80) {
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius * 0.55, this.y);
    ctx.lineTo(this.x + this.radius * 0.55, this.y);
    ctx.moveTo(this.x, this.y - this.radius * 0.55);
    ctx.lineTo(this.x, this.y + this.radius * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  private hasSupport(platforms: Platform[]) {
    return platforms.some(
      (platform) =>
        Math.abs(this.y + this.radius - platform.y) <= 1.5 &&
        this.x + this.radius > platform.x &&
        this.x - this.radius < platform.x + platform.width,
    );
  }
}
