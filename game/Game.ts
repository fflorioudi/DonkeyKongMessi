import { Ball } from "@/entities/Ball";
import { Player } from "@/entities/Player";
import { AudioManager } from "./Audio";
import { circleRectOverlap, rectsOverlap } from "./collision";
import { InputManager } from "./Input";
import { SpriteManager } from "./Sprites";
import type { GameSnapshot, GameStatus, HudSnapshot, Ladder, LevelDefinition, Rect } from "./types";

const INITIAL_LIVES = 3;
const HIGH_SCORE_KEY = "donkey-messi-high-score";
const BEST_TIME_KEY = "donkey-messi-best-time";
const COMPLETION_BONUS = 1000;
const LIFE_BONUS = 350;
const TIME_PAR_SECONDS = 90;
const TIME_BONUS_PER_SECOND = 22;

type FloatText = {
  x: number;
  y: number;
  text: string;
  ttl: number;
  color: string;
};

export class Game {
  readonly input = new InputManager();
  readonly audio = new AudioManager();
  readonly sprites = new SpriteManager();
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly level: LevelDefinition;
  private player: Player;
  private balls: Ball[];
  private status: GameStatus = "menu";
  private lives = INITIAL_LIVES;
  private score = 0;
  private highScore = 0;
  private bestTime = 0;
  private elapsedTime = 0;
  private bestY: number;
  private scoreBreakdown = createEmptyBreakdown();
  private isNewHighScore = false;
  private isNewBestTime = false;
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
    this.bestTime = this.loadBestTime();
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
    this.ctx.imageSmoothingEnabled = false;
  }

  play() {
    void this.audio.unlock().then(() => this.audio.playStart());
    this.status = "playing";
    this.lives = INITIAL_LIVES;
    this.score = 0;
    this.elapsedTime = 0;
    this.bestY = this.level.playerSpawn.y;
    this.scoreBreakdown = createEmptyBreakdown();
    this.isNewHighScore = false;
    this.isNewBestTime = false;
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

  menu() {
    this.audio.playUi();
    this.status = "menu";
    this.hitCooldown = 0;
    this.respawnGrace = 0;
    this.ballSpawnTimer = 0;
    this.hitFlash = 0;
    this.goalFlash = 0;
    this.throwCue = 0;
    this.message = "";
    this.messageTimer = 0;
    this.elapsedTime = 0;
    this.score = 0;
    this.bestY = this.level.playerSpawn.y;
    this.scoreBreakdown = createEmptyBreakdown();
    this.isNewHighScore = false;
    this.isNewBestTime = false;
    this.floatTexts = [];
    this.player.reset(this.level.playerSpawn);
    this.balls = [];
    this.input.reset();
    this.emitSnapshot(true);
  }

  pause() {
    if (this.status !== "playing") {
      return;
    }

    this.audio.playUi();
    this.status = "paused";
    this.input.reset();
    this.emitSnapshot(true);
  }

  resume() {
    if (this.status !== "paused") {
      return;
    }

    this.audio.playUi();
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
    this.elapsedTime += dt;
    if (this.messageTimer === 0) {
      this.message = "";
    }
    this.updateFloatTexts(dt);
    this.ballSpawnTimer -= dt;
    const input = this.input.snapshot();
    const canJumpBeforeUpdate = input.jump && (this.player.grounded || this.player.state === "climb");

    this.player.update(dt, input, this.level.platforms, this.level.ladders, this.level.worldWidth);
    if (canJumpBeforeUpdate) {
      this.audio.playJump();
    }
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
      this.completeLevel();
    }
  }

  private damagePlayer() {
    this.lives -= 1;
    this.hitCooldown = 0.8;
    this.hitFlash = 0.35;
    this.addFloatText(this.player.x + 14, this.player.y - 8, "-1 vida", "#ff5c7a");
    this.setMessage(this.lives <= 0 ? "Game Over" : "Respawn limpio", 1.5);
    this.audio.playHit();

    if (this.lives <= 0) {
      this.status = "gameOver";
      this.audio.playGameOver();
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
    const survivalPoints = dt * 8;
    this.score += survivalPoints;
    this.scoreBreakdown.progress += survivalPoints;

    if (this.player.y < this.bestY) {
      const climbPoints = (this.bestY - this.player.y) * 2;
      this.score += climbPoints;
      this.scoreBreakdown.progress += climbPoints;
      this.bestY = this.player.y;
    }
  }

  private completeLevel() {
    const lifeBonus = this.lives * LIFE_BONUS;
    const timeBonus = Math.max(0, Math.round((TIME_PAR_SECONDS - this.elapsedTime) * TIME_BONUS_PER_SECOND));
    const totalBonus = COMPLETION_BONUS + lifeBonus + timeBonus;

    this.status = "levelComplete";
    this.score += totalBonus;
    this.scoreBreakdown = {
      progress: Math.floor(this.scoreBreakdown.progress),
      completion: COMPLETION_BONUS,
      lives: lifeBonus,
      time: timeBonus,
      total: Math.floor(this.score),
    };
    this.goalFlash = 1.4;
    this.addFloatText(this.level.goal.x + this.level.goal.width / 2, this.level.goal.y + 8, `+${totalBonus}`, "#ffe45c");
    this.setMessage("Nivel completo", 2.4);
    this.audio.playVictory();
    this.recordBestTime();
    this.recordHighScore();
    this.input.reset();
  }

  private loadHighScore() {
    try {
      return Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0);
    } catch {
      return 0;
    }
  }

  private loadBestTime() {
    try {
      return Number(window.localStorage.getItem(BEST_TIME_KEY) || 0);
    } catch {
      return 0;
    }
  }

  private recordHighScore() {
    const roundedScore = Math.floor(this.score);

    if (roundedScore <= this.highScore) {
      this.isNewHighScore = false;
      return;
    }

    this.highScore = roundedScore;
    this.isNewHighScore = true;

    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    } catch {
      // Storage can fail in private contexts; gameplay should continue.
    }
  }

  private recordBestTime() {
    const roundedTime = Number(this.elapsedTime.toFixed(2));

    if (this.bestTime > 0 && roundedTime >= this.bestTime) {
      this.isNewBestTime = false;
      return;
    }

    this.bestTime = roundedTime;
    this.isNewBestTime = true;

    try {
      window.localStorage.setItem(BEST_TIME_KEY, String(this.bestTime));
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
    this.audio.playThrow();
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
      const ladderFrame = isActive ? 1 : 0;
      const ladderDrawn = this.sprites.drawTrimmedFrame(ctx, "ladder", ladderFrame, ladder.x - 1, ladder.y, ladder.width + 2, ladder.height);

      if (!ladderDrawn) {
        ctx.fillStyle = isActive ? "#ffe45c" : "#bd7f32";
        ctx.fillRect(ladder.x + 5, ladder.y, 6, ladder.height);
        ctx.fillRect(ladder.x + ladder.width - 11, ladder.y, 6, ladder.height);
        ctx.fillStyle = isActive ? "#ffffff" : "#f0be69";
        for (let y = ladder.y + 10; y < ladder.y + ladder.height; y += 18) {
          ctx.fillRect(ladder.x + 5, y, ladder.width - 10, 5);
        }
      }

      if (isActive && !ladderDrawn) {
        ctx.strokeStyle = "#ffe45c";
        ctx.lineWidth = 2;
        ctx.strokeRect(ladder.x + 5, ladder.y, 6, ladder.height);
        ctx.strokeRect(ladder.x + ladder.width - 11, ladder.y, 6, ladder.height);
      }

      ctx.restore();
    });

    this.level.platforms.forEach((platform) => {
      ctx.save();
      const frame = platformFrame(platform.color);
      if (!this.sprites.drawTrimmedFrame(ctx, "platforms", frame, platform.x - 5, platform.y, platform.width + 10, 30)) {
        ctx.fillStyle = platform.color || "#ffffff";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
      }
      ctx.restore();
    });

    this.drawGoal(ctx);
    this.balls.forEach((ball) => ball.draw(ctx, this.sprites));
    this.drawCristiano(ctx);
    this.drawFloatTexts(ctx);
    this.player.draw(ctx, this.respawnGrace > 0, this.sprites, this.lastTime / 1000);
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
    const frame = this.sprites.animationFrame("worldcup", "glow", this.lastTime / 1000, 7);
    if (this.sprites.drawTrimmedFrame(ctx, "worldcup", frame, goal.x + 20, goal.y + 2, 32, 46)) {
      if (this.status === "playing") {
        const pulse = 1 + Math.sin(performance.now() / 170) * 0.08;
        ctx.strokeStyle = "#ffe45c";
        ctx.lineWidth = 2;
        ctx.strokeRect(goal.x + 18 - 3 * pulse, goal.y - 1 - 3 * pulse, 36 + 6 * pulse, 52 + 6 * pulse);
      }
      ctx.restore();
      return;
    }

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
    ctx.translate(300, 52);
    if (this.throwCue > 0) {
      ctx.fillStyle = `rgba(255, 228, 92, ${this.throwCue})`;
      ctx.fillRect(-8, -6, 52, 62);
    }
    const animation = this.throwCue > 0 ? "throw" : "idle";
    const frame = this.sprites.animationFrame("cristiano", animation, this.lastTime / 1000, this.throwCue > 0 ? 4 : 2);
    if (this.sprites.drawTrimmedFrame(ctx, "cristiano", frame, -10, 0, 50, 58, true)) {
      ctx.restore();
      return;
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
      elapsedTime: Number(this.elapsedTime.toFixed(1)),
      bestTime: this.bestTime,
      scoreBreakdown: {
        progress: Math.floor(this.scoreBreakdown.progress),
        completion: this.scoreBreakdown.completion,
        lives: this.scoreBreakdown.lives,
        time: this.scoreBreakdown.time,
        total: Math.floor(this.score),
      },
      isNewHighScore: this.isNewHighScore,
      isNewBestTime: this.isNewBestTime,
      message: this.message,
      audioEnabled: this.audio.enabled,
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

function platformFrame(color?: string) {
  switch (color) {
    case "#ffe45c":
      return 1;
    case "#39a9ff":
      return 2;
    case "#ff5c7a":
      return 3;
    case "#f7f8ff":
      return 4;
    default:
      return 0;
  }
}

function createEmptyBreakdown() {
  return {
    progress: 0,
    completion: 0,
    lives: 0,
    time: 0,
    total: 0,
  };
}
