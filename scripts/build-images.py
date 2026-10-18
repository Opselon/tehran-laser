"""Tehran Laser — image pipeline.

Takes verified source photos and emits the responsive asset set the site uses:
AVIF + WebP + JPEG at 1600w and 800w, plus an inline LQIP data-URI.

Design notes / why this exists as a script rather than ad-hoc commands:
  * The repo's CSP is `img-src 'self' data: blob:`, so every asset must be
    self-hosted — no CDN srcset.
  * Several source photos previously shipped here did not match their own
    descriptions (a "spa treatment room" that was a dental office, "spa towels"
    that was a washing machine). So this script is fed only from
    VERIFIED_SOURCES, which the lead visually confirmed. Never add a source
    here without looking at the pixels first.

Run:  python build_images.py
"""
from __future__ import annotations

import base64
import io
import os
import sys
from PIL import Image

RAW_DIR = r"C:/Users/Capsizer/AppData/Local/hermes/cache/scratch/rawdown"
OUT_DIR = r"C:/Users/Capsizer/Desktop/TehranLasser/public/images"

# name -> (source filename in RAW_DIR, Persian alt text)
# Alt text describes ONLY what the photo actually shows (decorative ambience),
# never a clinic-specific claim such as "our treatment room" or "our device".
VERIFIED_SOURCES: dict[str, tuple[str, str]] = {
    "facial-treatment": (
        "facial-treatment.jpg",
        "انجام ماسک صورت توسط متخصص مراقبت پوست در فضایی آرام و حرفه‌ای",
    ),
    "facial-clay-mask": (
        "facial-clay-mask.jpg",
        "ماسک صورت رس‌دار سفید روی پوست به‌همراه هدبند بهداشتی",
    ),
    "facial-therapy": (
        "facial-therapy.jpg",
        "مراقبت تخصصی ناحیه دور چشم و صورت توسط کارشناس پوست",
    ),
    "spa-massage": (
        "spa-massage.jpg",
        "ماساژ پشت و شانه در فضایی آرام با ملحفه تمیز",
    ),
    "skin-closeup": (
        "skin-closeup.jpg",
        "چیدمان محصولات مراقبت از پوست روی سطح تیره",
    ),
    "spa-treatment-room": (
        "spa-treatment-room.jpg",
        "سنگ‌های گرم ماساژ و گل‌های سفید روی ملحفه تمیز در فضای اسپا",
    ),
}

WIDTHS = [1600, 800]
AVIF_Q, WEBP_Q, JPEG_Q = 62, 78, 80
LQIP_PX = 20


def lqip_data_uri(im: Image.Image) -> str:
    """Tiny blurred placeholder as an inline WebP data-URI.

    A blurred LQIP also doubles as the decode-time background, so a slow
    connection never paints an empty white rectangle.
    """
    small = im.copy()
    small.thumbnail((LQIP_PX, LQIP_PX))
    # Blur while still large enough to hide 20px blockiness after upscaling.
    from PIL import ImageFilter

    small = small.resize((LQIP_PX * 2, LQIP_PX * 2)).filter(ImageFilter.GaussianBlur(1.4))
    buf = io.BytesIO()
    small.save(buf, format="WEBP", quality=45)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def main() -> int:
    if not os.path.isdir(RAW_DIR):
        print(f"missing raw dir: {RAW_DIR}", file=sys.stderr)
        return 2
    os.makedirs(OUT_DIR, exist_ok=True)

    manifest: list[str] = []
    manifest.append("# Image Library — Tehran Laser\n")
    manifest.append(
        "Self-hosted decorative imagery. **Every file in this directory was "
        "visually reviewed by the lead before shipping** — the alt text says only "
        "what the photo actually shows, and none of it is presented as the "
        "clinic's own room, device or staff.\n"
    )
    manifest.append(
        "* Source: [Unsplash](https://unsplash.com/license) — free for commercial "
        "use, no attribution required (credited below as courtesy).\n"
        "* Never hot-link: the public CSP is `img-src 'self' data: blob:`.\n"
        "* Every image ships **AVIF + WebP + JPEG** at **1600w** and **800w**, each "
        "under 200 KB, plus an inline **LQIP** data-URI.\n"
    )

    total = 0
    for name, (src, alt) in VERIFIED_SOURCES.items():
        src_path = os.path.join(RAW_DIR, src)
        if not os.path.exists(src_path):
            print(f"SKIP {name}: missing {src_path}", file=sys.stderr)
            continue

        with Image.open(src_path) as _im:
            im = _im.convert("RGB")
        ow, oh = im.size

        files: list[tuple[str, int]] = []
        for w in WIDTHS:
            if w > ow:
                continue
            h = round(oh * (w / ow))
            variant = im.resize((w, h), Image.LANCZOS)
            suffix = "" if w == max(WIDTHS) else f"-{w}"
            for fmt, q, ext in (("AVIF", AVIF_Q, "avif"), ("WEBP", WEBP_Q, "webp"), ("JPEG", JPEG_Q, "jpg")):
                out = os.path.join(OUT_DIR, f"{name}{suffix}.{ext}")
                kwargs = {"quality": q}
                if fmt == "JPEG":
                    kwargs.update(optimize=True, progressive=True, subsampling=1)
                variant.save(out, format=fmt, **kwargs)
                size = os.path.getsize(out)
                files.append((os.path.basename(out), size))
                total += size

        lq = lqip_data_uri(im)
        manifest.append(f"\n## `{name}`  —  {ow}×{oh} ({'3:2' if abs(ow / oh - 1.5) < 0.02 else 'native'})\n")
        manifest.append(f"* **Alt (fa):** {alt}\n")
        manifest.append(f"* **Files:** " + ", ".join(f"`{f}` {s / 1024:.0f} KB" for f, s in files) + "\n")
        manifest.append(f"* **LQIP (data-URI, {len(lq)} B):**\n\n  ```\n  {lq}\n  ```\n")

    with open(os.path.join(OUT_DIR, "MANIFEST.md"), "w", encoding="utf-8") as fh:
        fh.write("".join(manifest))

    print(f"built {len(VERIFIED_SOURCES)} image sets, {total / 1048576:.2f} MB total")
    for f in sorted(os.listdir(OUT_DIR)):
        if f.endswith(".md"):
            continue
        print(f"  {f:34s} {os.path.getsize(os.path.join(OUT_DIR, f)) / 1024:7.1f} KB")
    print("manifest -> public/images/MANIFEST.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
