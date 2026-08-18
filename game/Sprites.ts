type AnimationMap = Record<string, number[]>;

export type SpriteSheet = {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  animations: AnimationMap;
  loaded: boolean;
};

type SpriteMetadata = {
  sheets: Record<
    string,
    {
      src: string;
      frameWidth: number;
      frameHeight: number;
      frames: number;
      animations: AnimationMap;
    }
  >;
};

export class SpriteManager {
  private sheets = new Map<string, SpriteSheet>();

  constructor() {
    void this.load();
  }

  get(name: string) {
    return this.sheets.get(name);
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    sheetName: string,
    frame: number,
    x: number,
    y: number,
    width: number,
    height: number,
    flip = false,
  ) {
    const sheet = this.get(sheetName);

    if (!sheet?.loaded) {
      return false;
    }

    const safeFrame = Math.max(0, Math.min(sheet.frames - 1, frame));
    const sourceX = safeFrame * sheet.frameWidth;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (flip) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet.image, sourceX, 0, sheet.frameWidth, sheet.frameHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(sheet.image, sourceX, 0, sheet.frameWidth, sheet.frameHeight, x, y, width, height);
    }

    ctx.restore();
    return true;
  }

  animationFrame(sheetName: string, animation: string, time: number, fps = 8) {
    const sheet = this.get(sheetName);
    const frames = sheet?.animations[animation];

    if (!frames?.length) {
      return 0;
    }

    return frames[Math.floor(time * fps) % frames.length];
  }

  private async load() {
    const response = await fetch("/sprites/sprites.json");
    const metadata = (await response.json()) as SpriteMetadata;

    Object.entries(metadata.sheets).forEach(([name, definition]) => {
      const image = new Image();
      const sheet: SpriteSheet = {
        image,
        frameWidth: definition.frameWidth,
        frameHeight: definition.frameHeight,
        frames: definition.frames,
        animations: definition.animations,
        loaded: false,
      };
      image.onload = () => {
        sheet.loaded = true;
      };
      image.src = definition.src;
      this.sheets.set(name, sheet);
    });
  }
}
