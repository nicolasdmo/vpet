"""Batch-generate the 41 monster sprites from the Z-Image Space.

- Locked pixel-art style prompt + per-monster creature description.
- seed 7 for a cohesive look; on the safety-filter placeholder (a dark chalkboard
  that says "maybe not safe") we detect via the corner background being dark and
  retry with a brighter, more explicit cartoon prompt + random seed.
- Idempotent: skips ids already saved, so it can resume if ZeroGPU quota runs out.

Run:  HF_TOKEN=hf_... uv run --no-project --with gradio-client --with pillow \
        python scripts/gen_sprites.py
"""
import os, shutil, sys
from pathlib import Path
from gradio_client import Client
from PIL import Image

OUT = Path("sprites-raw")
OUT.mkdir(exist_ok=True)

STYLE = (
    "16-bit pixel art sprite, retro virtual pet creature in the style of a 1990s "
    "Digimon / Tamagotchi handheld videogame, single creature centered, front-facing, "
    "full body, thick dark outline, limited color palette, chunky visible pixels, flat "
    "cel shading, plain solid light-grey background, cute cartoon mascot, clean game "
    "asset, no text, no watermark. Creature: "
)

# id -> english creature description (derived from monsters.ts, kept clearly a
# colorful cartoon creature with face + limbs to avoid safety false-positives).
PROMPTS = {
    # --- baby ---
    "matecito": "a cheerful little GREEN gourd creature (a yerba mate cup with a face), big round eyes and a wide happy smile, two short arms, stubby feet, a small silver metal straw poking out the top like an antenna, bright green body",
    "terroncito": "a small round clay-ball creature of pampa earth with a calm happy face, tiny legs, a little sprig of green grass on top, warm brown body",
    "gotita": "a small cartoon water-drop creature with a big smiling face, two tiny arms and feet, light blue and shiny, cheerful",
    "brasita_bb": "a small glowing ember creature with a cute face, two little arms, tiny warm flames on its head, bright orange and yellow body",
    # --- in-training ---
    "termito": "a square baked-clay brick creature with short legs, a stubborn determined face, sturdy, warm brown body",
    "chispita": "a lively living-ember creature with legs, sparks around it, a mischievous grin, bright orange and red",
    "charquito": "a puddle creature with a big smiling face and big eyes, two little arms, blue and watery, calm and friendly",
    "brotecito": "a green sprout creature with two leaf arms and a root foot, a curious happy face, bright green",
    "ventacito": "a little whirlwind creature with a cheerful face, small green leaves spinning around it, light grey and white, energetic",
    "pelusin": "a round ball of brown fur creature with little legs, a tail and a cute toothy grin, big eyes, energetic",
    # --- rookie ---
    "carpinchon": "a sturdy capybara beast monster, thick brown fur, big and calm, broad tank-like stance, small round ears, sleepy tough friendly expression, earthy brown tones",
    "hornerito": "an ovenbird (hornero) artisan creature wearing a round mud-clay helmet, smart friendly face, brown and tan with green accents",
    "pomberito": "a short hairy forest goblin creature with a straw hat and a mischievous grin, big eyes, earthy brown, playful",
    "pampero_jr": "a fast wind-spirit creature with lightning-bolt eyes, swirling air around it, grey and yellow, energetic",
    "yacare_chico": "a young friendly caiman creature with a broad snout, dark green scales, small and tough, big eyes",
    "mandiyu": "a fluffy white cotton-ball creature with little branch arms, a soft happy face, white and pale green",
    "nandulin": "a stylized rhea bird creature with long legs, fluffy grey plumage, a friendly face, fast runner pose",
    "surubicito": "a young spotted catfish creature with long whiskers and big eyes, blue and yellow, astute friendly face",
    "brasero": "a barbecue-grill spirit creature with a glowing ember body and a metal grill, small flames and smoke, fierce friendly face, orange and dark",
    "piedron": "a sturdy andean rock creature with stone block arms, a carved blocky face, immovable stance, grey and brown",
    # --- champion ---
    "yaguarete_sombra": "a sleek black jaguar monster with glowing orange ember spots, fierce confident face, standing pose, dark with orange glow on a light background",
    "lobizon": "a friendly cartoon werewolf creature, shaggy grey-brown fur, standing upright, fangs and a brave face, muscular",
    "quebrachon": "a colossus made of hardwood quebracho, thick bark armor, root-fist arms, a sturdy carved face, brown and green",
    "tormenton": "a storm-cloud creature with lightning-bolt arms, a bold face, grey body with bright yellow lightning, energetic",
    "yacare_grande": "a large adult caiman monster, big powerful jaw, armored dark green scales, fierce confident face, standing",
    "mboi_tui": "a colorful mythic snake creature with a friendly parrot-like head, vivid green and red, coiled body, big eyes",
    "curupi": "a guarani forest-spirit creature, leafy green and brown, a wild friendly face, agile pose",
    "aguara_guazu": "a tall maned-wolf creature with very long legs and reddish-orange fur, a flowing mane, elegant confident face",
    "brasapampa": "a cracked-earth rock colossus with glowing orange lava veins, smoke, a powerful blocky face, dark brown and orange",
    "gualicho": "a friendly cartoon shadow-spirit creature with glowing bright eyes, wispy dark purple body on a light background, mysterious",
    # --- mega ---
    "luz_mala": "a glowing ghostly flame creature with a spooky friendly face inside floating green-and-white fire, a small floating wisp body on a light background, mystical",
    "yaguarete_rey": "a monumental crowned jaguar mega monster, muscular and imposing, a golden crown, yellow-orange fur with black rosette spots, regal proud king pose, fierce eyes",
    "salamanca": "a cave-spirit golem of rock and shadow with glowing blue runes carved on its body, a powerful arcane face, dark grey with blue glow",
    "nahuelito": "a friendly lake-monster creature with a long neck and a serpentine humped back, teal blue-green scales, big eyes, standing in a curl",
    "yacare_titan": "a colossal armored caiman titan with thick rock-like plates, a massive powerful jaw, dark green and grey, imposing",
    "quebracho_milenario": "a giant ancient tree creature with a wise face carved in its bark, huge root legs, leafy crown, brown and green, towering",
    "pampero_dios": "a colossal storm-deity humanoid made of clouds and lightning, a powerful face, grey clouds with bright yellow lightning, majestic",
    "curupi_mayor": "a greater forest-spirit giant covered in living vegetation and leaves, a wise powerful face, lush green and brown, towering",
    "el_familiar": "a fierce cartoon hound-serpent creature with glowing ember eyes and metal chains around its neck, black fur with orange glow, imposing",
    "mboi_rey": "a colossal crowned mythic snake with a radiant parrot-like head and a small golden crown, vivid green and gold, majestic coiled pose",
    "aguara_espectro": "a giant spectral maned-wolf with cold blue-white flame fur and glowing eyes, long legs, fierce ghostly hunter, on a light background",
}

BRIGHT = " bright colorful friendly cartoon creature, big clear eyes, clear face and limbs, vivid colors"


def corners_dark(path: str) -> bool:
    """True if the image corners aren't the light-grey background -> safety placeholder."""
    im = Image.open(path).convert("L")
    w, h = im.size
    s = max(8, w // 16)
    boxes = [(0, 0, s, s), (w - s, 0, w, s)]
    means = [sum(im.crop(b).getdata()) / (im.crop(b).width * im.crop(b).height) for b in boxes]
    return min(means) < 120


def main():
    token = os.environ["HF_TOKEN"]
    client = Client("tongyi-mai/z-image-turbo", headers={"Authorization": f"Bearer {token}"})

    done, failed = [], []
    ids = list(PROMPTS.keys())
    for i, mid in enumerate(ids, 1):
        dest = OUT / f"{mid}.png"
        if dest.exists():
            print(f"[{i}/{len(ids)}] {mid}: already exists, skip", flush=True)
            done.append(mid)
            continue

        ok = False
        for attempt in range(1, 5):
            prompt = STYLE + PROMPTS[mid] + (BRIGHT if attempt > 1 else "")
            try:
                res = client.predict(
                    prompt=prompt,
                    resolution="1024x1024 ( 1:1 )",
                    seed=7,
                    steps=8,
                    shift=3,
                    random_seed=(attempt > 1),
                    gallery_images=[],
                    api_name="/generate",
                )
            except Exception as e:
                print(f"[{i}/{len(ids)}] {mid}: ERROR {e}", flush=True)
                break

            gallery = res[0] if isinstance(res, (list, tuple)) else res
            item = gallery[0]
            img = item["image"] if isinstance(item, dict) else item
            src = img.get("path") or img.get("url") if isinstance(img, dict) else img

            if not src or not os.path.exists(src):
                print(f"[{i}/{len(ids)}] {mid}: no local file (attempt {attempt})", flush=True)
                continue
            if corners_dark(src):
                print(f"[{i}/{len(ids)}] {mid}: safety placeholder, retry (attempt {attempt})", flush=True)
                continue

            shutil.copy(src, dest)
            print(f"[{i}/{len(ids)}] {mid}: OK (attempt {attempt})", flush=True)
            ok = True
            break

        (done if ok else failed).append(mid)

    print("\n=== SUMMARY ===", flush=True)
    print(f"done: {len(done)}/{len(ids)}", flush=True)
    if failed:
        print(f"FAILED: {failed}", flush=True)


if __name__ == "__main__":
    main()
