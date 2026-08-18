from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "public" / "sprites"
SOURCE = SPRITES / "source"


def alpha_bbox(image: Image.Image, threshold: int = 10) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > threshold else 0)
    return mask.getbbox() or (0, 0, image.width, image.height)


def clean_alpha(image: Image.Image, threshold: int = 4) -> Image.Image:
    image = image.convert("RGBA")
    data = image.load()
    for y in range(image.height):
      for x in range(image.width):
        r, g, b, a = data[x, y]
        if a <= threshold:
            data[x, y] = (0, 0, 0, 0)
        else:
            data[x, y] = (r, g, b, 255)
    return image


def remove_edge_fragments(image: Image.Image, threshold: int = 10, keep_strategy: str = "character") -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    alpha = image.getchannel("A")
    seen = bytearray(width * height)
    components: list[dict[str, int | list[tuple[int, int]]]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or alpha.getpixel((x, y)) <= threshold:
                continue

            stack = [(x, y)]
            seen[index] = 1
            pixels: list[tuple[int, int]] = []
            min_x = max_x = x
            min_y = max_y = y

            while stack:
                px, py = stack.pop()
                pixels.append((px, py))
                min_x = min(min_x, px)
                max_x = max(max_x, px)
                min_y = min(min_y, py)
                max_y = max(max_y, py)

                for nx in (px - 1, px, px + 1):
                    for ny in (py - 1, py, py + 1):
                        if nx < 0 or ny < 0 or nx >= width or ny >= height:
                            continue
                        neighbor = ny * width + nx
                        if seen[neighbor] or alpha.getpixel((nx, ny)) <= threshold:
                            continue
                        seen[neighbor] = 1
                        stack.append((nx, ny))

            components.append({
                "pixels": pixels,
                "area": len(pixels),
                "min_x": min_x,
                "max_x": max_x,
                "min_y": min_y,
                "max_y": max_y,
            })

    if len(components) <= 1:
        return image

    largest = max(int(component["area"]) for component in components)
    if keep_strategy == "largest":
        largest_component = max(components, key=lambda component: int(component["area"]))
        cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
        source = image.load()
        target = cleaned.load()
        for x, y in largest_component["pixels"]:  # type: ignore[assignment]
            target[x, y] = source[x, y]
        return cleaned

    keep: set[tuple[int, int]] = set()
    center_min = width * 0.13
    center_max = width * 0.87

    for component in components:
        area = int(component["area"])
        center_x = (int(component["min_x"]) + int(component["max_x"])) / 2
        near_center = center_min <= center_x <= center_max
        substantial = area >= largest * 0.22
        if area == largest or near_center or substantial:
            keep.update(component["pixels"])  # type: ignore[arg-type]

    cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
    source = image.load()
    target = cleaned.load()
    for x, y in keep:
        target[x, y] = source[x, y]
    return cleaned


def normalize_frame(
    source: Image.Image,
    cell: tuple[int, int],
    max_size: tuple[int, int],
    threshold: int = 10,
    keep_strategy: str = "character",
) -> Image.Image:
    source = remove_edge_fragments(clean_alpha(source, threshold), threshold, keep_strategy)
    crop = source.crop(alpha_bbox(source, threshold))
    max_w, max_h = max_size
    scale = min(max_w / crop.width, max_h / crop.height, 1)
    if scale < 1:
        crop = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.Resampling.LANCZOS)
        crop = clean_alpha(crop, 1)

    frame = Image.new("RGBA", cell, (0, 0, 0, 0))
    x = round((cell[0] - crop.width) / 2)
    y = cell[1] - crop.height - 6
    frame.alpha_composite(crop, (x, y))
    return frame


def x_bands(source: Image.Image, expected: int, threshold: int = 10, min_gap: int = 24) -> list[tuple[int, int]]:
    alpha = source.getchannel("A")
    active = []
    for x in range(source.width):
        column_has_pixel = False
        for y in range(source.height):
            if alpha.getpixel((x, y)) > threshold:
                column_has_pixel = True
                break
        active.append(column_has_pixel)

    bands: list[tuple[int, int]] = []
    start: int | None = None
    for x, has_pixel in enumerate(active):
        if has_pixel and start is None:
            start = x
        elif not has_pixel and start is not None:
            bands.append((start, x))
            start = None
    if start is not None:
        bands.append((start, source.width))

    merged: list[tuple[int, int]] = []
    for band in bands:
        if not merged or band[0] - merged[-1][1] > min_gap:
            merged.append(band)
        else:
            merged[-1] = (merged[-1][0], band[1])

    while len(merged) > expected:
        gaps = [(merged[index + 1][0] - merged[index][1], index) for index in range(len(merged) - 1)]
        _, index = min(gaps)
        merged[index] = (merged[index][0], merged[index + 1][1])
        del merged[index + 1]

    if len(merged) != expected:
        width = source.width / expected
        return [(round(index * width), round((index + 1) * width)) for index in range(expected)]

    return merged


def build_row_sheet(
    source_path: Path,
    out_path: Path,
    columns: int,
    frame_size: tuple[int, int],
    max_sprite_size: tuple[int, int],
    row_box: tuple[int, int, int, int] | None = None,
    threshold: int = 10,
    band_min_gap: int | None = None,
    keep_strategy: str = "character",
) -> list[dict[str, int]]:
    source = Image.open(source_path).convert("RGBA")
    if row_box:
        source = source.crop(row_box)
    bands = x_bands(
        source,
        columns,
        threshold=max(12, threshold),
        min_gap=band_min_gap if band_min_gap is not None else max(32, round(source.width / columns * 0.12)),
    )
    frames: list[Image.Image] = []
    trims: list[dict[str, int]] = []

    for left, right in bands:
        padding = max(8, round((right - left) * 0.08))
        frame_source = source.crop((max(0, left - padding), 0, min(source.width, right + padding), source.height))
        normalized = normalize_frame(frame_source, frame_size, max_sprite_size, threshold, keep_strategy)
        frames.append(normalized)
        x0, y0, x1, y1 = alpha_bbox(normalized, 3)
        trims.append({"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0})

    sheet = Image.new("RGBA", (frame_size[0] * columns, frame_size[1]), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * frame_size[0], 0))
    sheet.save(out_path)
    return trims


def build_manual_sheet(
    source_path: Path,
    out_path: Path,
    boxes: list[tuple[int, int, int, int]],
    frame_size: tuple[int, int],
    max_sprite_size: tuple[int, int],
    threshold: int = 10,
    keep_strategy: str = "character",
) -> list[dict[str, int]]:
    source = Image.open(source_path).convert("RGBA")
    sheet = Image.new("RGBA", (frame_size[0] * len(boxes), frame_size[1]), (0, 0, 0, 0))
    trims: list[dict[str, int]] = []

    for index, box in enumerate(boxes):
        frame = normalize_frame(source.crop(box), frame_size, max_sprite_size, threshold, keep_strategy)
        sheet.alpha_composite(frame, (index * frame_size[0], 0))
        x0, y0, x1, y1 = alpha_bbox(frame, 3)
        trims.append({"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0})

    sheet.save(out_path)
    return trims


def contact_preview(items: list[tuple[str, Path, int]]) -> None:
    loaded = [(label, Image.open(path).convert("RGBA"), scale) for label, path, scale in items]
    width = max(image.width * scale for _, image, scale in loaded) + 32
    height = sum(image.height * scale + 30 for _, image, scale in loaded) + 24
    preview = Image.new("RGBA", (width, height), (15, 22, 30, 255))
    y = 16

    for _, image, scale in loaded:
        scaled = image.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)
        preview.alpha_composite(scaled, (16, y))
        y += scaled.height + 30

    preview.save(SPRITES / "preview-v26-hd.png")


def main() -> None:
    SPRITES.mkdir(parents=True, exist_ok=True)

    messi_trims = build_manual_sheet(
        SOURCE / "messi-hd-reference.png",
        SPRITES / "messi.png",
        [
            (0, 70, 210, 665),
            (230, 75, 520, 670),
            (515, 75, 815, 670),
            (785, 120, 1115, 670),
            (1070, 15, 1385, 675),
            (1340, 55, 1640, 675),
            (1600, 110, 1945, 675),
            (1905, 55, 2172, 675),
        ],
        (280, 360),
        (248, 330),
        threshold=6,
    )
    ronaldo_trims = build_manual_sheet(
        SOURCE / "ronaldo-hd-reference.png",
        SPRITES / "cristiano.png",
        [
            (0, 80, 230, 700),
            (235, 70, 505, 700),
            (510, 0, 735, 700),
            (745, 85, 1060, 700),
            (1105, 100, 1380, 700),
            (1380, 105, 1645, 700),
            (1640, 120, 1915, 700),
            (1925, 80, 2172, 700),
        ],
        (280, 360),
        (256, 332),
        threshold=6,
    )

    props = SOURCE / "props-hd-reference.png"
    ball_trims = build_manual_sheet(
        props,
        SPRITES / "ball.png",
        [
            (0, 30, 180, 225),
            (170, 25, 350, 225),
            (350, 25, 535, 225),
            (535, 25, 725, 225),
            (720, 25, 920, 230),
            (920, 40, 1120, 230),
            (1120, 40, 1320, 235),
            (1310, 35, 1536, 235),
        ],
        (128, 128),
        (110, 110),
        6,
        "largest",
    )
    cup_trims = build_manual_sheet(
        props,
        SPRITES / "worldcup.png",
        [
            (100, 275, 290, 500),
            (320, 275, 510, 500),
            (525, 270, 730, 500),
            (755, 265, 975, 500),
            (975, 245, 1210, 500),
            (1190, 235, 1480, 505),
            (975, 245, 1210, 500),
            (755, 265, 975, 500),
            (525, 270, 730, 500),
            (320, 275, 510, 500),
            (100, 275, 290, 500),
            (320, 275, 510, 500),
        ],
        (180, 240),
        (150, 210),
        6,
        "largest",
    )
    platform_trims = build_manual_sheet(
        props,
        SPRITES / "platforms.png",
        [
            (0, 525, 315, 690),
            (315, 525, 615, 690),
            (615, 525, 925, 690),
            (925, 525, 1230, 690),
            (1225, 525, 1536, 690),
        ],
        (320, 150),
        (300, 128),
        6,
        "largest",
    )
    ladder_trims = build_manual_sheet(
        props,
        SPRITES / "ladder.png",
        [(300, 700, 520, 1010), (565, 690, 810, 1015)],
        (140, 240),
        (112, 220),
        6,
        "largest",
    )
    hazard_trims = build_manual_sheet(
        props,
        SPRITES / "hazards.png",
        [(850, 710, 1270, 1000)],
        (300, 160),
        (260, 132),
        6,
        "largest",
    )

    metadata = {
        "generatedBy": "scripts/extract-hd-sprite-assets.py",
        "version": "v2.6-hd-milo-style",
        "pixelArt": True,
        "smoothing": False,
        "notes": [
            "Sprites PNG HD inspirados en el nivel de produccion de Super Milo J.",
            "Contact sheets fuente conservadas en public/sprites/source.",
            "Frames normalizados por celda para animacion estable en canvas mobile.",
        ],
        "sheets": {
            "messi": {
                "src": "/sprites/messi.png",
                "frameWidth": 280,
                "frameHeight": 360,
                "frames": 8,
                "animations": {
                    "idle": [0],
                    "run": [1, 2, 3, 2],
                    "jump": [4],
                    "climb": [5],
                    "hit": [6],
                    "victory": [7],
                },
                "pivot": {"x": 140, "y": 354},
                "trims": messi_trims,
            },
            "cristiano": {
                "src": "/sprites/cristiano.png",
                "frameWidth": 280,
                "frameHeight": 360,
                "frames": 8,
                "animations": {
                    "idle": [0, 1],
                    "taunt": [1],
                    "throw": [2, 3, 4, 5, 6],
                    "hit": [7],
                },
                "pivot": {"x": 140, "y": 354},
                "trims": ronaldo_trims,
            },
            "ball": {
                "src": "/sprites/ball.png",
                "frameWidth": 128,
                "frameHeight": 128,
                "frames": 8,
                "animations": {"roll": [0, 1, 2, 3, 4, 5, 6, 7]},
                "pivot": {"x": 64, "y": 64},
                "trims": ball_trims,
            },
            "worldcup": {
                "src": "/sprites/worldcup.png",
                "frameWidth": 180,
                "frameHeight": 240,
                "frames": 12,
                "animations": {"glow": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]},
                "pivot": {"x": 90, "y": 234},
                "trims": cup_trims,
            },
            "platforms": {
                "src": "/sprites/platforms.png",
                "frameWidth": 320,
                "frameHeight": 150,
                "frames": 5,
                "animations": {
                    "grass": [0],
                    "yellow": [1],
                    "blue": [2],
                    "red": [3],
                    "white": [4],
                },
                "pivot": {"x": 160, "y": 142},
                "trims": platform_trims,
            },
            "ladder": {
                "src": "/sprites/ladder.png",
                "frameWidth": 140,
                "frameHeight": 240,
                "frames": 2,
                "animations": {"normal": [0], "active": [1]},
                "pivot": {"x": 70, "y": 238},
                "trims": ladder_trims,
            },
            "hazards": {
                "src": "/sprites/hazards.png",
                "frameWidth": 300,
                "frameHeight": 160,
                "frames": 1,
                "animations": {"spikes": [0]},
                "pivot": {"x": 150, "y": 156},
                "trims": hazard_trims,
            },
        },
    }

    (SPRITES / "sprites.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    contact_preview(
        [
            ("messi", SPRITES / "messi.png", 1),
            ("cristiano", SPRITES / "cristiano.png", 1),
            ("ball", SPRITES / "ball.png", 1),
            ("worldcup", SPRITES / "worldcup.png", 1),
            ("platforms", SPRITES / "platforms.png", 1),
            ("ladder", SPRITES / "ladder.png", 1),
            ("hazards", SPRITES / "hazards.png", 1),
        ]
    )


if __name__ == "__main__":
    main()
