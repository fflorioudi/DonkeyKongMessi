import { Ball } from "@/entities/Ball";
import { Player } from "@/entities/Player";
import { circleRectOverlap, rectsOverlap } from "./collision";
import { InputManager } from "./Input";
import type { GameSnapshot, GameStatus, HudSnapshot, Ladder, LevelDefinition, Rect } from "./types";

const INITIAL_LIVES = 3;
const HIGH_SCORE_KEY = "donkey-messi-high-score";

type FloatText = {
  x: number;
  y: number;
  text: string;
  ttl: number;
  color: string;
};

export class Game {
  readonly input = new InputManager();
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly level: LevelDefinition;
  private player: Player;
  private balls: Ball[];
  private status: GameStatus = "menu";
  private lives = INITIAL_LIVES;
  private score = 0;
  private highScore = 0;
  private bestY: number;
  private lastSnapshotKey = "";
  private onSnapshot: (snapshot: GameSnapshot) => void;
  private animationFrame = 0;
  private lastTime = 0;
  private hitCooldown = 0;
  private respawnGrace = 0;
  private ballSpawnTimer = 0;
  private hitFlash = 0;
  private goalFlash = 0;
  private throwCue = 0;
  private message = "";
  private messageTimer = 0;
  private floatTexts: FloatText[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    level: LevelDefinition,
    onSnapshot: (snapshot: GameSnapshot) => void,
  ) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context is not available.");
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.level = level;
    this.player = new Player(level.playerSpawn);
    this.bestY = level.playerSpawn.y;
    this.balls = [];
    this.onSnapshot = onSnapshot;
    this.highScore = this.loadHighScore();
    this.resize();
    this.emitSnapshot(true);
  }

  startLoop() {
    const tick = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000 || 0, 1 / 30);
      this.lastTime = time;

      this.update(dt);
      this.render();
      this.emitSnapshot();

      this.animationFrame = requestAnimationFrame(tick);
    };

    this.animationFrame = requestAnimationFrame(tick);
  }

  stopLoop() {
    cancelAnimationFrame(this.animationFrame);
    this.input.reset();
  }

  resize() {
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.canvas.width / this.level.worldWidth, this.canvas.height / this.level.worldHeight);
  }

  play() {
    this.status = "playing";
    this.lives = INITIAL_LIVES;
    this.score = 0;
    this.bestY = this.level.playerSpawn.y;
    this.hitCooldown = 0;
    this.respawnGrace = 0;
    this.ballSpawnTimer = this.level.ballSpawner.firstDelay;
    this.hitFlash = 0;
    this.goalFlash = 0;
    this.throwCue = 0;
    this.floatTexts = [];
    this.setMessage("Subi por las escaleras", 1.8);
    this.player.reset(this.level.playerSpawn);
    this.balls = [];
    this.input.reset();
    this.emitSnapshot(true);
  }

  restart() {
    this.play();
  }

  pause() {
    if (this.status !== "playing") {
      return;
    }

    this.status = "paused";
    this.input.reset();
    this.emitSnapshot(true);
  }

  resume() {
    if (this.status !== "paused") {
      return;
    }

    this.status = "playing";
    this.input.reset();
    this.emitSnapshot(true);
  }

  private update(dt: number) {
    if (this.status !== "playing") {
      this.input.snapshot();
      return;
    }

    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.respawnGrace = Math.max(0, this.respawnGrace - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.goalFlash = Math.max(0, this.goalFlash - dt);
    this.throwCue = Math.max(0, this.throwCue - dt);
    this.messageTimer = Math.max(0, this.messageTimer - dt);
    if (this.messageTimer === 0) {
      this.message = "";
    }
    this.updateFloatTexts(dt);
    this.ballSpawnTimer -= dt;
    const input = this.input.snapshot();

    this.player.update(dt, input, this.level.platforms, this.level.ladders, this.level.worldWidth);
    this.updateScore(dt);
    this.spawnBallIfReady();
    this.balls.forEach((ball) => ball.update(dt, this.level.platforms, this.level.worldWidth, this.level.worldHeight));
    this.balls = this.balls.filter((ball) => ball.alive);

    if (this.player.y > this.level.worldHeight + 80) {
      this.damagePlayer();
      return;
    }

    if (this.hitCooldown === 0 && this.respawnGrace === 0) {
      for (const ball of this.balls) {
        if (circleRectOverlap(ball, this.player.rect)) {
          this.damagePlayer();
          return;
        }
      }
    }

    if (rectsOverlap(this.player.rect, this.level.goal)) {
      this.status = "levelComplete";
      this.score += 1000;
      this.goalFlash = 1.4;
      this.addFloatText(this.level.goal.x + this.level.goal.width / 2, this.level.goal.y + 8, "+1000", "#ffe45c");
      this.setMessage("Nivel completo", 2.4);
      this.recordHighScore();
      this.input.reset();
    }
  }

  private damagePlayer() {
    this.lives -= 1;
    this.hitCooldown = 0.8;
    this.hitFlash = 0.35;
    this.addFloatText(this.player.x + 14, this.player.y - 8, "-1 vida", "#ff5c7a");
    this.setMessage(this.lives <= 0 ? "Game Over" : "Respawn limpio", 1.5);

    if (this.lives <= 0) {
      this.status = "gameOver";
      this.recordHighScore();
      this.input.reset();
      return;
    }

    this.player.reset(this.level.playerSpawn);
    this.balls = [];
    this.ballSpawnTimer = this.level.ballSpawner.firstDelay;
    this.respawnGrace = 1.1;
    this.input.reset();
  }

  private updateScore(dt: number) {
    this.score += dt * 8;

    if (this.player.y < this.bestY) {
      this.score += (this.bestY - this.player.y) * 2;
      this.bestY = this.player.y;
    }
  }

  private loadHighScore() {
    try {
      return Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0);
    } catch {
      return 0;
    }
  }

  private recordHighScore() {
    const roundedScore = Math.floor(this.score);

    if (roundedScore <= this.highScore) {
      return;
    }

    this.highScore = roundedScore;

    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    } catch {
      // Storage can fail in private contexts; gameplay should continue.
    }
  }

  private spawnBallIfReady() {
    if (
      this.ballSpawnTimer > 0 ||
      this.balls.length >= this.level.ballSpawner.maxActive
    ) {
      return;
    }

    const spawner = this.level.ballSpawner;
    this.balls.push(
      new Ball({
        x: spawner.x,
        y: spawner.y,
        ...spawner.ball,
      }),
    );
    this.throwCue = 0.45;
    this.addFloatText(spawner.x - 14, spawner.y - 16, "PELIGRO", "#ffe45c");
    this.ballSpawnTimer = spawner.interval;
  }

  private updateFloatTexts(dt: number) {
    this.floatTexts = this.floatTexts
      .map((floatText) => ({
        ...floatText,
        y: floatText.y - dt * 18,
        ttl: floatText.ttl - dt,
      }))
      .filter((floatText) => floatText.ttl > 0);
  }

  private addFloatText(x: number, y: number, text: string, color: string) {
    this.floatTexts.push({ x, y, text, color, ttl: 0.9 });
  }

  private setMessage(message: string, duration: number) {
    this.message = message;
    this.messageTimer = duration;
  }

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.level.worldWidth, this.level.worldHeight);
    this.drawBackground(ctx);
    this.drawScreenFlash(ctx);
    const activeLadder = this.findActiveLadder();

    this.level.ladders.forEach((ladder) => {
      ctx.save();
      const isActive = activeLadder === ladder;
      ctx.fillStyle = isActive ? "#ffe45c" : "#bd7f32";
      ctx.fillRect(ladder.x + 5, ladder.y, 6, ladder.height);
      ctx.fillRect(ladder.x + ladder.width - 11, ladder.y, 6, ladder.height);
      ctx.fillStyle = isActive ? "#ffffff" : "#f0be69";

      for (let y = ladder.y + 10; y < ladder.y + ladder.height; y += 18) {
        ctx.fillRect(ladder.x + 5, y, ladder.width - 10, 5);
      }

      if (isActive) {
        ctx.strokeStyle = "#ffe45c";
        ctx.lineWidth = 2;
        ctx.strokeRect(ladder.x + 5, ladder.y, 6, ladder.height);
        ctx.strokeRect(ladder.x + ladder.width - 11, ladder.y, 6, ladder.height);
      }

      ctx.restore();
    });

    this.level.platforms.forEach((platform) => {
      ctx.save();
      ctx.fillStyle = platform.color || "#ffffff";
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
      ctx.restore();
    });

    this.drawGoal(ctx);
    this.balls.forEach((ball) => ball.draw(ctx));
    this.drawCristiano(ctx);
    this.drawFloatTexts(ctx);
    this.player.draw(ctx, this.respawnGrace > 0);
    this.drawGoalFlash(ctx);
  }

  private findActiveLadder(): Ladder | undefined {
    const probe: Rect = {
      x: this.player.rect.x - 8,
      y: this.player.rect.y + 2,
      width: this.player.rect.width + 16,
      height: this.player.rect.height,
    };

    return this.level.ladders.find((ladder) => rectsOverlap(probe, ladder));
  }

  private drawScreenFlash(ctx: CanvasRenderingContext2D) {
    if (this.hitFlash <= 0) {
      return;
    }

    ctx.save();
    ctx.fillStyle = `rgba(255, 92, 122, ${this.hitFlash * 0.42})`;
    ctx.fillRect(0, 0, this.level.worldWidth, this.level.worldHeight);
    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.level.worldHeight);
    gradient.addColorStop(0, "#182135");
    gradient.addColorStop(0.45, "#22364a");
    gradient.addColorStop(1, "#1f5b42");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.level.worldWidth, this.level.worldHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = 18; x < this.level.worldWidth; x += 42) {
      ctx.fillRect(x, 132, 18, 28);
      ctx.fillRect(x + 8, 160, 18, 28);
    }

    ctx.fillStyle = "rgba(255, 228, 92, 0.24)";
    ctx.fillRect(0, 636, this.level.worldWidth, 8);
    ctx.fillRect(0, 658, this.level.worldWidth, 5);
  }

  private drawGoal(ctx: CanvasRenderingContext2D) {
    const goal = this.level.goal;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(goal.x, goal.y + 10, goal.width, goal.height - 10);
    ctx.fillStyle = "#75aadb";
    ctx.fillRect(goal.x, goal.y + 10, goal.width, 10);
    ctx.fillRect(goal.x, goal.y + 30, goal.width, 10);
    ctx.fillStyle = "#f6c945";
    ctx.fillRect(goal.x + goal.width / 2 - 12, goal.y, 24, 20);
    ctx.fillStyle = "#101820";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(goal.label, goal.x + goal.width / 2, goal.y + 34);
    if (this.status === "playing") {
      const pulse = 1 + Math.sin(performance.now() / 170) * 0.08;
      ctx.strokeStyle = "#ffe45c";
      ctx.lineWidth = 2;
      ctx.strokeRect(goal.x - 4 * pulse, goal.y - 4 * pulse, goal.width + 8 * pulse, goal.height + 8 * pulse);
    }
    ctx.restore();
  }

  private drawCristiano(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(292, 58);
    if (this.throwCue > 0) {
      ctx.fillStyle = `rgba(255, 228, 92, ${this.throwCue})`;
      ctx.fillRect(-8, -8, 52, 60);
    }
    ctx.fillStyle = "#ff5c7a";
    ctx.fillRect(7, 16, 24, 26);
    ctx.fillStyle = "#f0b38d";
    ctx.fillRect(11, 2, 16, 16);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(10, 0, 18, 5);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.fillText("7", 19, 31);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1, 23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#151515";
    ctx.stroke();
    ctx.restore();
  }

  private drawFloatTexts(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";

    this.floatTexts.forEach((floatText) => {
      ctx.globalAlpha = Math.min(1, floatText.ttl / 0.25);
      ctx.fillStyle = "rgba(16, 24, 32, 0.74)";
      ctx.fillRect(floatText.x - 36, floatText.y - 14, 72, 18);
      ctx.fillStyle = floatText.color;
      ctx.fillText(floatText.text, floatText.x, floatText.y);
    });

    ctx.restore();
  }

  private drawGoalFlash(ctx: CanvasRenderingContext2D) {
    if (this.goalFlash <= 0) {
      return;
    }

    ctx.save();
    const radius = (1.4 - this.goalFlash) * 260;
    ctx.strokeStyle = `rgba(255, 228, 92, ${Math.min(1, this.goalFlash)})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.level.goal.x + this.level.goal.width / 2, this.level.goal.y + 24, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private snapshot(): GameSnapshot {
    const hud: HudSnapshot = {
      status: this.status,
      lives: this.lives,
      score: Math.floor(this.score),
      highScore: Math.max(this.highScore, Math.floor(this.score)),
      message: this.message,
      level: this.level.id,
      levelName: this.level.name,
    };

    return {
      ...hud,
      canClimb: this.status === "playing" && this.player.canUseLadder(this.level.ladders),
    };
  }

  private emitSnapshot(force = false) {
    const snapshot = this.snapshot();
    const key = JSON.stringify(snapshot);

    if (force || key !== this.lastSnapshotKey) {
      this.lastSnapshotKey = key;
      this.onSnapshot(snapshot);
    }
  }
}
