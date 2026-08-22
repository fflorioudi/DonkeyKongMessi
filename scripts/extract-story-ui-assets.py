from pathlib import Path
from PIL import Image, ImageFilter
import math
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\ffeli\Downloads\ChatGPT Image 21 ago 2026, 11_03_04 p.m..png")
SOURCE_COPY = ROOT / "public" / "sprites" / "source" / "chatgpt-story-sheet-20260821-230304.png"
OUTPUT_DIR = ROOT / "public" / "assets" / "story"

ICON_SIZE = 96

CROPS = [
    ("story-icon-tutorial-messi.png", (0, 0, 145, 205)),
    ("story-icon-level1-platform.png", (760, 690, 980, 840)),
    ("story-icon-level2-fireball.png", (760, 600, 960, 730)),
    ("story-icon-level3-netball.png", (900, 600, 1080, 730)),
    ("story-icon-level4-hazard.png", (180, 815, 420, 990)),
    ("story-icon-level5-cup.png", (500, 665, 700, 840)),
]


def nearest_border_distance(pixel, border_pixels):
    pr, pg, pb = pixel[:3]
    best = 999999

    for br, bg, bb in border_pixels:
        dr = pr - br
        dg = pg - bg
        db = pb - bb
        distance = dr * dr + dg * dg + db * db
        if distance < best:
            best = distance

    return math.sqrt(best)


def remove_local_background(crop):
    crop = crop.convert("RGBA")
    width, height = crop.size
    pixels = crop.load()
    border_pixels = []

    step = max(1, min(width, height) // 36)
    for x in range(0, width, step):
        border_pixels.append(pixels[x, 0][:3])
        border_pixels.append(pixels[x, height - 1][:3])
    for y in range(0, height, step):
        border_pixels.append(pixels[0, y][:3])
        border_pixels.append(pixels[width - 1, y][:3])

    alpha = Image.new("L", crop.size, 0)
    alpha_pixels = alpha.load()

    for y in range(height):
        for x in range(width):
            distance = nearest_border_distance(pixels[x, y], border_pixels)
            if distance <= 42:
                value = 0
            elif distance >= 78:
                value = 255
            else:
                value = int(((distance - 42) / 36) * 255)
            alpha_pixels[x, y] = value

    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    crop.putalpha(alpha)
    return crop


def trim_alpha(image):
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 18 else 0).getbbox()

    if not bbox:
        return image

    left, top, right, bottom = bbox
    pad = 8
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    return image.crop((left, top, right, bottom))


def fit_icon(image):
    image = trim_alpha(image)
    scale = min((ICON_SIZE - 12) / image.width, (ICON_SIZE - 12) / image.height)
    resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    x = (ICON_SIZE - resized.width) // 2
    y = (ICON_SIZE - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Source image not found: {SOURCE}")

    SOURCE_COPY.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SOURCE, SOURCE_COPY)

    sheet = Image.open(SOURCE).convert("RGBA")
    for filename, box in CROPS:
        icon = fit_icon(remove_local_background(sheet.crop(box)))
        icon.save(OUTPUT_DIR / filename)

    print(f"Copied source sheet: {SOURCE_COPY}")
    print(f"Generated {len(CROPS)} story icons in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
