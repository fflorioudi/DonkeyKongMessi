export type GameStatus = "menu" | "playing" | "paused" | "levelComplete" | "gameOver";

export type PlayerState = "idle" | "run" | "jump" | "climb" | "hit" | "dead" | "victory";

export type Direction = -1 | 0 | 1;

export type Vec2 = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Platform = Rect & {
  color?: string;
  spriteFrame?: number;
};

export type Ladder = Rect;

export type Goal = Rect & {
  label: string;
};

export type BallDefinition = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  direction: -1 | 1;
};

export type BallSpawnerDefinition = {
  x: number;
  y: number;
  interval: number;
  firstDelay: number;
  maxActive: number;
  ball: Omit<BallDefinition, "x" | "y">;
};

export type ObstacleKind = "ball" | "red-card" | "boot" | "glove" | "fixed-hazard";

export type BallObstacleDefinition = Omit<BallDefinition, "x" | "y"> & {
  kind: "ball";
};

export type RedCardObstacleDefinition = {
  kind: "red-card";
  width: number;
  height: number;
  speed: number;
  direction: -1 | 1;
  hitboxInset?: number;
};

export type FutureObstacleDefinition = {
  kind: Exclude<ObstacleKind, "ball" | "red-card">;
  width: number;
  height: number;
  speed?: number;
  direction?: -1 | 1;
};

export type ObstacleDefinition = BallObstacleDefinition | RedCardObstacleDefinition | FutureObstacleDefinition;

export type ObstacleSpawnerDefinition = {
  id: string;
  x: number;
  y: number;
  interval: number;
  firstDelay: number;
  maxActive: number;
  spawnDelayMs?: SpawnDelayRangeDefinition;
  obstacle: ObstacleDefinition;
};

export type SpawnDelayRangeDefinition = {
  initial: number;
  min: number;
  max: number;
};

export type LevelDefinition = {
  id: number;
  stageLabel?: string;
  name: string;
  theme: string;
  worldWidth: number;
  worldHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  controlSafeZoneTop: number;
  camera: CameraDefinition;
  difficulty: LevelDifficultyDefinition;
  background: LevelBackgroundDefinition;
  rival: RivalDefinition;
  playerSpawn: Vec2;
  platforms: Platform[];
  ladders: Ladder[];
  ballSpawner: BallSpawnerDefinition;
  obstacleSpawners: ObstacleSpawnerDefinition[];
  goal: Goal;
};

export type CameraDefinition = {
  followTopMargin: number;
  followBottomMargin: number;
  smoothing: number;
};

export type LevelDifficultyDefinition = {
  initialLives: number;
  completionBonus: number;
  lifeBonus: number;
  timeParSeconds: number;
  timeBonusPerSecond: number;
};

export type LevelBackgroundDefinition = {
  gradient: {
    top: string;
    middle: string;
    bottom: string;
  };
  skylineY: number;
  groundBands: Array<{
    y: number;
    height: number;
    color: string;
  }>;
};

export type RivalDefinition = {
  x: number;
  y: number;
  width: number;
  height: number;
  facingLeft: boolean;
};

export type InputSnapshot = {
  move: Direction;
  climb: Direction;
  jump: boolean;
};

export type HudSnapshot = {
  status: GameStatus;
  lives: number;
  score: number;
  highScore: number;
  elapsedTime: number;
  bestTime: number;
  scoreBreakdown: ScoreBreakdown;
  isNewHighScore: boolean;
  isNewBestTime: boolean;
  message: string;
  audioEnabled: boolean;
  level: number;
  levelIndex: number;
  levelCount: number;
  levelLabel: string;
  levelName: string;
  levelTheme: string;
};

export type GameSnapshot = HudSnapshot & {
  canClimb: boolean;
};

export type ScoreBreakdown = {
  progress: number;
  completion: number;
  lives: number;
  time: number;
  total: number;
};
