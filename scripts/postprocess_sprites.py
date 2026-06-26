"""Turn raw 1024px sprites (light-grey background) into game-ready frames.

For each monster: flood-fill the background to transparent from the corners (so
internal greys aren't punched out), trim to content, center on a square canvas
bottom-aligned, and emit a 2-frame idle (idle_0 normal, idle_1 a subtle squash so
it 'breathes' Tamagotchi-style). Output: public/sprites/<id>/idle_0.png + idle_1.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

SIZE = 256
CONTENT = 212          # max content size within the canvas
BASELINE = SIZE - 16   # feet sit here

SOURCES = {
    "matecito": "sprites-raw/matecito.png",
    "terroncito": "sprites-raw/terroncito.png",
    "gotita": "sprites-raw/gotita.png",
    "carpinchon": "sprites-tests/02-carpinchon.png",
    "yaguarete_rey": "sprites-tests/03-yaguarete-rey.png",
}


def remove_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    for seed in [(1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)]:
        ImageDraw.floodfill(im, seed, (0, 0, 0, 0), thresh=60)
    return im


def content_crop(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def frame(content: Image.Image, squash: float) -> Image.Image:
    cw, ch = content.size
    scale = CONTENT / max(cw, ch)
    nw, nh = int(cw * scale), int(ch * scale * squash)
    sprite = content.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = (SIZE - nw) // 2
    y = BASELINE - nh
    canvas.paste(sprite, (x, y), sprite)
    return canvas


def main():
    for mid, src in SOURCES.items():
        out = Path("public/sprites") / mid
        out.mkdir(parents=True, exist_ok=True)
        content = content_crop(remove_bg(Image.open(src)))
        frame(content, 1.0).save(out / "idle_0.png")
        frame(content, 0.94).save(out / "idle_1.png")  # gentle breathing squash
        print(f"{mid}: idle_0.png + idle_1.png", flush=True)


if __name__ == "__main__":
    main()
