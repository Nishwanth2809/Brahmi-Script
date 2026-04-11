from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BRAHMI_CODEPOINTS = {
    "A": 0x11005,
    "KA": 0x11013,
    "KHA": 0x11014,
    "GA": 0x11015,
    "GHA": 0x11016,
    "NGA": 0x11017,
    "CHA": 0x11018,
    "CHHA": 0x11019,
    "JA": 0x1101A,
    "JHA": 0x1101B,
    "NYA": 0x1101C,
    "TTA": 0x1101D,
    "TTHA": 0x1101E,
    "DDA": 0x1101F,
    "DDHA": 0x11020,
    "NNA": 0x11021,
    "TA": 0x11022,
    "THA": 0x11023,
    "DA": 0x11024,
    "DHA": 0x11025,
    "NA": 0x11026,
    "PA": 0x11027,
    "PHA": 0x11028,
    "BA": 0x11029,
    "BHA": 0x1102A,
    "MA": 0x1102B,
    "YA": 0x1102C,
    "RA": 0x1102D,
    "LA": 0x1102E,
    "VA": 0x1102F,
    "SHA": 0x11030,
    "SSA": 0x11031,
    "SA": 0x11032,
    "HA": 0x11033,
}

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_DIR = BASE_DIR / "dataset"
DEFAULT_FONT_PATH = BASE_DIR / "NotoSansBrahmi-Regular.ttf"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a synthetic Brahmi character dataset."
    )
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--font-path", type=Path, default=DEFAULT_FONT_PATH)
    parser.add_argument("--train-count", type=int, default=7000)
    parser.add_argument("--test-count", type=int, default=2000)
    parser.add_argument("--img-size", type=int, default=128)
    parser.add_argument("--canvas-size", type=int, default=256)
    parser.add_argument("--font-size", type=int, default=160)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Delete the existing output directory before generation.",
    )
    return parser.parse_args()


def build_character_map() -> dict[str, str]:
    return {label: chr(codepoint) for label, codepoint in BRAHMI_CODEPOINTS.items()}


def augment(
    img: np.ndarray,
    rng: random.Random,
    np_rng: np.random.Generator,
) -> np.ndarray:
    height, width = img.shape[:2]

    angle = rng.uniform(-20, 20)
    rotation = cv2.getRotationMatrix2D((width // 2, height // 2), angle, 1.0)
    img = cv2.warpAffine(img, rotation, (width, height), borderValue=255)

    tx = rng.randint(-10, 10)
    ty = rng.randint(-10, 10)
    translation = np.float32([[1, 0, tx], [0, 1, ty]])
    img = cv2.warpAffine(img, translation, (width, height), borderValue=255)

    if rng.random() > 0.5:
        img = cv2.GaussianBlur(img, (3, 3), 0)

    noise = np_rng.normal(0, 8, img.shape)
    img = np.clip(img + noise, 0, 255).astype(np.uint8)

    if rng.random() > 0.6:
        img = cv2.dilate(img, np.ones((2, 2), np.uint8))

    if rng.random() > 0.6:
        img = cv2.erode(img, np.ones((2, 2), np.uint8))

    return img


def create_base_image(
    glyph: str,
    font: ImageFont.FreeTypeFont,
    canvas_size: int,
) -> np.ndarray:
    image = Image.new("L", (canvas_size, canvas_size), 255)
    draw = ImageDraw.Draw(image)
    left, top, right, bottom = draw.textbbox((0, 0), glyph, font=font)
    text_width = right - left
    text_height = bottom - top
    x = (canvas_size - text_width) // 2 - left
    y = (canvas_size - text_height) // 2 - top
    draw.text((x, y), glyph, font=font, fill=0)
    return np.array(image)


def generate_dataset(args: argparse.Namespace) -> None:
    if args.clean and args.output_dir.exists():
        shutil.rmtree(args.output_dir)

    characters = build_character_map()
    font = ImageFont.truetype(str(args.font_path), args.font_size)
    rng = random.Random(args.seed)
    np_rng = np.random.default_rng(args.seed)

    train_root = args.output_dir / "train"
    test_root = args.output_dir / "test"

    total_per_class = args.train_count + args.test_count
    for label, glyph in characters.items():
        train_dir = train_root / label
        test_dir = test_root / label
        train_dir.mkdir(parents=True, exist_ok=True)
        test_dir.mkdir(parents=True, exist_ok=True)

        base_image = create_base_image(glyph, font, args.canvas_size)
        for index in range(total_per_class):
            image = augment(base_image.copy(), rng, np_rng)
            image = cv2.resize(image, (args.img_size, args.img_size))

            if index < args.train_count:
                output_path = train_dir / f"{index}.png"
            else:
                output_path = test_dir / f"{index - args.train_count}.png"

            cv2.imwrite(str(output_path), image)

        print(
            f"Generated {args.train_count} train and {args.test_count} test images for {label}"
        )

    print(
        f"Dataset generated at {args.output_dir} with seed={args.seed} "
        f"for {len(characters)} Brahmi characters."
    )


def main() -> None:
    args = parse_args()
    generate_dataset(args)


if __name__ == "__main__":
    main()
