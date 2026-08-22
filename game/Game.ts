import { Obstacle } from "@/entities/Obstacle";
import { Player } from "@/entities/Player";
import { AudioManager } from "./Audio";
import { rectsOverlap } from "./collision";
import { InputManager } from "./Input";
import { SpriteManager } from "./Sprites";
import type {
  GameSnapshot,
  GameStatus,
  HudSnapshot,
  Ladder,
  LevelDefinition,
  ObstacleSpawnerDefinition,
  PowerUpDefinition,
  Rect,
} from "./types";

const LEGACY_HIGH_SCORE_KEY = "donkey-messi-high-score";
const LEGACY_BEST_TIME_KEY = "donkey-messi-best-time";

type FloatText = {
  x: number;
  y: number;
  text: string;
  ttl: number;
  color: string;
};

type RuntimePowerUp = PowerUpDefinition & {
  collected: boolean;
};

export class Game {
  readonly input = new InputManager();
  readonly audio = new AudioManager();
  readonly sprites = new SpriteManager();
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly levels: LevelDefinition[];
  private levelIndex: number;
  private level: LevelDefinition;
  private player: Player;
  private obstacles: Obstacle[];
  private powerUps: RuntimePowerUp[];
  private status: GameStatus = "menu";
  private lives = 0;
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
  private invincibilityTimer = 0;
  private invincibilityDuration = 0;
  private powerUpFlash = 0;
  private obstacleSpawnTimers = new Map<string, number>();
  private cameraY = 0;
  private hitFlash = 0;
  private goalFlash = 0;
  private throwCue = 0;
  private message = "";
  private messageTimer = 0;
  private floatTexts: FloatText[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    levels: LevelDefinition[],
    onSnapshot: (snapshot: GameSnapshot) => void,
    initialLevelIndex = 0,
  ) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 2D context is not available.");
    }

    if (levels.length === 0) {
      throw new Error("At least one level is required.");
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.levels = levels;
    this.levelIndex = clamp(initialLevelIndex, 0, levels.length - 1);
    this.level = levels[this.levelIndex];
    this.lives = this.level.difficulty.initialLives;
    this.player = new Player(this.level.playerSpawn);
    this.bestY = this.level.playerSpawn.y;
    this.obstacles = [];
    this.powerUps = createPowerUps(this.level);
    this.onSnapshot = onSnapshot;
    this.highScore = this.loadHighScore();
    this.bestTime = this.loadBestTime();
    this.resize();
    this.emitSnapshot(true);
  }

  selectLevel(index: number) {
    if (this.status !== "menu") {
      return;
    }

    const level = this.levels[index];
    if (!level || index === this.levelIndex) {
      return;
    }

    this.audio.playUi();
    this.levelIndex = index;
    this.level = level;
    this.lives = this.level.difficulty.initialLives;
    this.highScore = this.loadHighScore();
    this.bestTime = this.loadBestTime();
    this.resetRunState();
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
    this.ctx.scale(this.canvas.width / this.level.viewportWidth, this.canvas.height / this.level.viewportHeight);
    this.ctx.imageSmoothingEnabled = false;
  }

  play() {
    void this.audio.unlock().then(() => this.audio.playStart());
    this.status = "playing";
    this.resetRunState();
    this.obstacleSpawnTimers = createObstacleSpawnTimers(this.level);
    this.setMessage("Subi por las escaleras", 1.8);
    this.emitSnapshot(true);
  }

  private resetRunState() {
    this.lives = this.level.difficulty.initialLives;
    this.score = 0;
    this.elapsedTime = 0;
    this.bestY = this.level.playerSpawn.y;
    this.scoreBreakdown = createEmptyBreakdown();
    this.isNewHighScore = false;
    this.isNewBestTime = false;
    this.hitCooldown = 0;
    this.respawnGrace = 0;
    this.invincibilityTimer = 0;
    this.invincibilityDuration = 0;
    this.powerUpFlash = 0;
    this.obstacleSpawnTimers = createObstacleSpawnTimers(this.level);
    this.hitFlash = 0;
    this.goalFlash = 0;
    this.throwCue = 0;
    this.message = "";
    this.messageTimer = 0;
    this.floatTexts = [];
    this.player.reset(this.level.playerSpawn);
    this.obstacles = [];
    this.powerUps = createPowerUps(this.level);
    this.cameraY = this.targetCameraY();
    this.input.reset();
  }

  restart() {
    this.play();
  }

  menu() {
    this.audio.playUi();
    this.status = "menu";
    this.hitCooldown = 0;
    this.respawnGrace = 0;
    this.invincibilityTimer = 0;
    this.invincibilityDuration = 0;
    this.powerUpFlash = 0;
    this.obstacleSpawnTimers = new Map();
    this.hitFlash = 0;
    this.goalFlash = 0;
    this.throwCue = 0;
    this.message = "";
    this.messageTimer = 0;
    this.resetRunState();
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
    this.invincibilityTimer = Math.max(0, this.invincibilityTimer - dt);
    this.powerUpFlash = Math.max(0, this.powerUpFlash - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.goalFlash = Math.max(0, this.goalFlash - dt);
    this.throwCue = Math.max(0, this.throwCue - dt);
    this.messageTimer = Math.max(0, this.messageTimer - dt);
    this.elapsedTime += dt;
    if (this.messageTimer === 0) {
      this.message = "";
    }
    this.updateFloatTexts(dt);
    this.updateObstacleSpawnTimers(dt);
    const input = this.input.snapshot();
    const canJumpBeforeUpdate = input.jump && (this.player.grounded || this.player.state === "climb");

    this.player.update(dt, input, this.level.platforms, this.level.ladders, this.level.worldWidth);
    if (canJumpBeforeUpdate) {
      this.audio.playJump();
    }
    this.collectPowerUps();
    this.updateScore(dt);
    this.spawnObstaclesIfReady();
    this.obstacles.forEach((obstacle) =>
      obstacle.update(dt, this.level.platforms, this.level.worldWidth, this.level.worldHeight),
    );
    this.obstacles = this.obstacles.filter((obstacle) => obstacle.alive);
    this.updateCamera(dt);

    if (this.player.y > this.level.worldHeight + 80) {
      this.damagePlayer();
      return;
    }

    if (this.hitCooldown === 0 && this.respawnGrace === 0) {
      for (const obstacle of this.obstacles) {
        if (obstacle.collidesWith(this.player.rect)) {
          if (this.invincibilityTimer > 0) {
            obstacle.destroy();
            this.score += 120;
            this.scoreBreakdown.progress += 120;
            this.addFloatText(this.player.x + 15, this.player.y - 6, "+120", "#ffe45c");
            continue;
          }

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
    this.invincibilityTimer = 0;
    this.invincibilityDuration = 0;
    this.powerUpFlash = 0;

    if (this.lives <= 0) {
      this.status = "gameOver";
      this.audio.playGameOver();
      this.recordHighScore();
      this.input.reset();
      return;
    }

    this.player.reset(this.level.playerSpawn);
    this.obstacles = [];
    this.obstacleSpawnTimers = createObstacleSpawnTimers(this.level);
    this.cameraY = this.targetCameraY();
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
    const { completionBonus, lifeBonus: lifeBonusValue, timeBonusPerSecond, timeParSeconds } = this.level.difficulty;
    const lifeBonus = this.lives * lifeBonusValue;
    const timeBonus = Math.max(0, Math.round((timeParSeconds - this.elapsedTime) * timeBonusPerSecond));
    const totalBonus = completionBonus + lifeBonus + timeBonus;

    this.status = "levelComplete";
    this.score += totalBonus;
    this.scoreBreakdown = {
      progress: Math.floor(this.scoreBreakdown.progress),
      completion: completionBonus,
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
      const stored = window.localStorage.getItem(highScoreKey(this.level));
      const legacy = this.level.id === 1 ? window.localStorage.getItem(LEGACY_HIGH_SCORE_KEY) : null;
      return Number(stored || legacy || 0);
    } catch {
      return 0;
    }
  }

  private loadBestTime() {
    try {
      const stored = window.localStorage.getItem(bestTimeKey(this.level));
      const legacy = this.level.id === 1 ? window.localStorage.getItem(LEGACY_BEST_TIME_KEY) : null;
      return Number(stored || legacy || 0);
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
      window.localStorage.setItem(highScoreKey(this.level), String(this.highScore));
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
      window.localStorage.setItem(bestTimeKey(this.level), String(this.bestTime));
    } catch {
      // Storage can fail in private contexts; gameplay should continue.
    }
  }

  private updateObstacleSpawnTimers(dt: number) {
    this.level.obstacleSpawners.forEach((spawner) => {
      const current = this.obstacleSpawnTimers.get(spawner.id) ?? initialSpawnDelaySeconds(spawner);
      this.obstacleSpawnTimers.set(spawner.id, current - dt);
    });
  }

  private spawnObstaclesIfReady() {
    this.level.obstacleSpawners.forEach((spawner) => {
      const timer = this.obstacleSpawnTimers.get(spawner.id) ?? initialSpawnDelaySeconds(spawner);
      const activeFromSpawner = this.obstacles.filter((obstacle) => obstacle.spawnerId === spawner.id).length;

      if (timer > 0 || activeFromSpawner >= spawner.maxActive) {
        return;
      }

      this.spawnObstacle(spawner);
    });
  }

  private spawnObstacle(spawner: ObstacleSpawnerDefinition) {
    this.obstacles.push(
      new Obstacle({
        spawnerId: spawner.id,
        x: spawner.x,
        y: spawner.y,
        obstacle: spawner.obstacle,
      }),
    );
    this.throwCue = 0.45;
    this.addFloatText(spawner.x - 14, spawner.y - 16, "PELIGRO", "#ffe45c");
    this.audio.playThrow();
    this.obstacleSpawnTimers.set(spawner.id, nextSpawnDelaySeconds(spawner));
  }

  private collectPowerUps() {
    for (const powerUp of this.powerUps) {
      if (powerUp.collected || !rectsOverlap(insetRect(powerUp, 8), this.player.rect)) {
        continue;
      }

      powerUp.collected = true;
      this.activatePowerUp(powerUp);
    }
  }

  private activatePowerUp(powerUp: RuntimePowerUp) {
    if (powerUp.effect.kind === "invincibility") {
      this.invincibilityTimer = Math.max(this.invincibilityTimer, powerUp.effect.duration);
      this.invincibilityDuration = powerUp.effect.duration;
      this.powerUpFlash = 0.6;
    }

    this.score += powerUp.scoreBonus;
    this.scoreBreakdown.progress += powerUp.scoreBonus;
    this.addFloatText(powerUp.x + powerUp.width / 2, powerUp.y - 4, `+${powerUp.scoreBonus}`, "#ffe45c");
    this.setMessage("Botin dorado: invencible", 1.8);
    this.audio.playPowerUp();
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

  private updateCamera(dt: number) {
    const target = this.targetCameraY();
    const smoothing = Math.max(0.1, this.level.camera.smoothing);
    const t = 1 - Math.exp(-smoothing * dt);
    this.cameraY += (target - this.cameraY) * t;
  }

  private targetCameraY() {
    const maxCameraY = Math.max(0, this.level.worldHeight - this.level.viewportHeight);
    const topTarget = this.player.y - this.level.camera.followTopMargin;
    const bottomTarget = this.player.y - this.level.camera.followBottomMargin;
    return clamp(Math.max(topTarget, bottomTarget), 0, maxCameraY);
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
    ctx.clearRect(0, 0, this.level.viewportWidth, this.level.viewportHeight);
    ctx.save();
    ctx.translate(0, -this.cameraY);
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
      const frame = platform.spriteFrame ?? platformFrame(platform.color);
      if (!this.sprites.drawTrimmedFrame(ctx, "platforms", frame, platform.x - 5, platform.y, platform.width + 10, 30)) {
        ctx.fillStyle = platform.color || "#ffffff";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
      }
      ctx.restore();
    });

    this.drawGoal(ctx);
    this.powerUps.forEach((powerUp) => this.drawPowerUp(ctx, powerUp));
    this.obstacles.forEach((obstacle) => obstacle.draw(ctx, this.sprites));
    this.drawCristiano(ctx);
    this.drawFloatTexts(ctx);
    this.drawInvincibilityAura(ctx);
    this.player.draw(ctx, this.respawnGrace > 0, this.sprites, this.lastTime / 1000);
    this.drawGoalFlash(ctx);
    ctx.restore();
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
    ctx.fillRect(0, this.cameraY, this.level.viewportWidth, this.level.viewportHeight);
    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const { background } = this.level;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.level.worldHeight);
    gradient.addColorStop(0, background.gradient.top);
    gradient.addColorStop(0.45, background.gradient.middle);
    gradient.addColorStop(1, background.gradient.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.level.worldWidth, this.level.worldHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = 18; x < this.level.worldWidth; x += 42) {
      ctx.fillRect(x, background.skylineY, 18, 28);
      ctx.fillRect(x + 8, background.skylineY + 28, 18, 28);
    }

    background.groundBands.forEach((band) => {
      ctx.fillStyle = band.color;
      ctx.fillRect(0, band.y, this.level.worldWidth, band.height);
    });
  }

  private drawGoal(ctx: CanvasRenderingContext2D) {
    const goal = this.level.goal;

    ctx.save();
    const frame = this.sprites.animationFrame("worldcup", "glow", this.lastTime / 1000, 7);
    if (this.sprites.drawTrimmedFrame(ctx, "worldcup", frame, goal.x + 20, goal.y + 2, 32, 46)) {
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
    ctx.restore();
  }

  private drawCristiano(ctx: CanvasRenderingContext2D) {
    const { rival } = this.level;
    ctx.save();
    ctx.translate(rival.x, rival.y);
    if (this.throwCue > 0) {
      ctx.fillStyle = `rgba(255, 228, 92, ${this.throwCue})`;
      ctx.fillRect(-8, -6, rival.width + 2, rival.height + 4);
    }
    const animation = this.throwCue > 0 ? "throw" : "idle";
    const frame = this.sprites.animationFrame("cristiano", animation, this.lastTime / 1000, this.throwCue > 0 ? 4 : 2);
    if (this.sprites.drawTrimmedFrame(ctx, "cristiano", frame, -10, 0, rival.width, rival.height, rival.facingLeft)) {
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

  private drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: RuntimePowerUp) {
    if (powerUp.collected) {
      return;
    }

    const time = this.lastTime / 1000;
    const bob = Math.sin(time * 4.2) * 3;
    const frame = this.sprites.animationFrame("goldenBoot", "pulse", time, 8);
    this.sprites.drawTrimmedFrame(
      ctx,
      "goldenBoot",
      frame,
      powerUp.x - 6,
      powerUp.y - 9 + bob,
      powerUp.width + 12,
      powerUp.height + 16,
    );
  }

  private drawInvincibilityAura(ctx: CanvasRenderingContext2D) {
    if (this.invincibilityTimer <= 0) {
      return;
    }

    const body = this.player.drawRect;
    const progress = this.invincibilityDuration > 0 ? this.invincibilityTimer / this.invincibilityDuration : 0;
    const pulse = 0.5 + Math.sin(this.lastTime / 80) * 0.5;
    const alpha = Math.max(0.2, Math.min(0.72, progress * 0.55 + pulse * 0.17 + this.powerUpFlash * 0.28));

    ctx.save();
    ctx.strokeStyle = `rgba(255, 228, 92, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(body.x + body.width / 2, body.y + body.height / 2 + 1, 22 + pulse * 4, 31 + pulse * 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.72})`;
    ctx.beginPath();
    ctx.arc(body.x + body.width / 2 + 12, body.y + 8, 2 + pulse * 1.5, 0, Math.PI * 2);
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
      levelIndex: this.levelIndex,
      levelCount: this.levels.length,
      levelLabel: this.level.stageLabel ?? String(this.level.id),
      levelName: this.level.name,
      levelTheme: this.level.theme,
      activePowerUp:
        this.invincibilityTimer > 0
          ? {
              label: "Botin",
              remaining: Number(this.invincibilityTimer.toFixed(1)),
            }
          : null,
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

function highScoreKey(level: LevelDefinition) {
  return `donkey-messi-level-${level.id}-high-score`;
}

function bestTimeKey(level: LevelDefinition) {
  return `donkey-messi-level-${level.id}-best-time`;
}

function createObstacleSpawnTimers(level: LevelDefinition) {
  return new Map(level.obstacleSpawners.map((spawner) => [spawner.id, initialSpawnDelaySeconds(spawner)]));
}

function createPowerUps(level: LevelDefinition): RuntimePowerUp[] {
  return level.powerUps.map((powerUp) => ({ ...powerUp, collected: false }));
}

function insetRect(rect: Rect, inset: number): Rect {
  return {
    x: rect.x + inset,
    y: rect.y + inset,
    width: Math.max(1, rect.width - inset * 2),
    height: Math.max(1, rect.height - inset * 2),
  };
}

function initialSpawnDelaySeconds(spawner: ObstacleSpawnerDefinition) {
  return (spawner.spawnDelayMs?.initial ?? spawner.firstDelay * 1000) / 1000;
}

function nextSpawnDelaySeconds(spawner: ObstacleSpawnerDefinition) {
  const range = spawner.spawnDelayMs;

  if (!range) {
    return spawner.interval;
  }

  const min = Math.min(range.min, range.max);
  const max = Math.max(range.min, range.max);
  return (min + Math.random() * (max - min)) / 1000;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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
