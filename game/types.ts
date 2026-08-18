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

export type LevelDefinition = {
  id: number;
  name: string;
  theme: string;
  worldWidth: number;
  worldHeight: number;
  controlSafeZoneTop: number;
  playerSpawn: Vec2;
  platforms: Platform[];
  ladders: Ladder[];
  ballSpawner: BallSpawnerDefinition;
  goal: Goal;
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
  message: string;
  audioEnabled: boolean;
  level: number;
  levelName: string;
};

export type GameSnapshot = HudSnapshot & {
  canClimb: boolean;
};
