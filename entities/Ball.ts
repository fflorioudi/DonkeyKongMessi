import type { BallDefinition } from "@/game/types";
import type { Platform } from "@/game/types";
import { GRAVITY } from "@/game/physics";
import type { SpriteManager } from "@/game/Sprites";

export class Ball {
  x: number;
  y: number;
  vy = 0;
  radius: number;
  direction: -1 | 1;
  alive = true;
  private rotation = 0;
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
    const bottomPlatform = platforms.reduce((lowest, platform) => (platform.y > lowest.y ? platform : lowest), platforms[0]);

    this.x += this.direction * this.speed * dt;
    this.rotation += this.direction * this.speed * dt * 0.05;

    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.direction = 1;
    }

    if (this.x + this.radius >= worldWidth) {
      this.x = worldWidth - this.radius;
      this.direction = -1;
    }

    if (bottomPlatform && this.isSupportedBy(bottomPlatform)) {
      this.alive = false;
      return;
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
        if (platform === bottomPlatform) {
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

  draw(ctx: CanvasRenderingContext2D, sprites?: SpriteManager) {
    const frame = Math.abs(Math.floor(this.rotation * 5)) % 8;
    if (sprites?.drawTrimmedFrame(ctx, "ball", frame, this.x - 16, this.y - 16, 32, 32)) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.radius * 0.55, 0);
    ctx.lineTo(this.radius * 0.55, 0);
    ctx.moveTo(0, -this.radius * 0.55);
    ctx.lineTo(0, this.radius * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  private hasSupport(platforms: Platform[]) {
    return platforms.some((platform) => this.isSupportedBy(platform));
  }

  private isSupportedBy(platform: Platform) {
    return (
      Math.abs(this.y + this.radius - platform.y) <= 1.5 &&
      this.x + this.radius > platform.x &&
      this.x - this.radius < platform.x + platform.width
    );
  }
}
