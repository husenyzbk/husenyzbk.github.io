#!/usr/bin/env python3
"""
process_images.py — Photography Portfolio Image Processor

Run from the Portfolio directory:
    python3 process_images.py

What it does:
  - Walks every photo in images/ (skips web/ and thumbs/ subfolders)
  - Creates two processed copies per photo:
      images/.../web/filename.jpg    — 2000px max, for the fullscreen viewer
      images/.../thumbs/filename.jpg — 800px max,  for the photo grid
  - Applies a fixed-size watermark at the top-right corner
  - Automatically picks the white or black watermark based on the
    brightness of the area where the logo will be placed
  - Already-processed files are skipped — safe to re-run for new photos
"""

from PIL import Image, ImageEnhance, ImageOps
import os, sys

# ── Settings ─────────────────────────────────────────────────────────────────

# White logo — used on dark/mid-tone areas (your current logo)
WATERMARK_WHITE = "images/HY Photography.png"

# Black logo — used on bright areas. Leave empty ("") until you have the file.
WATERMARK_BLACK = "images/HY Photography Black.png"

# Brightness threshold (0–255). Areas brighter than this get the black logo.
BRIGHTNESS_THRESHOLD = 140

WATERMARK_OPACITY       = 1.0   # 0.0 = invisible, 1.0 = fully opaque
WATERMARK_SIZE_PX       = 350   # watermark width in pixels for fullscreen (web) copies
WATERMARK_SIZE_PX_THUMB = 140   # watermark width in pixels for grid thumbnail copies
WATERMARK_PADDING       = 28    # pixels from the top-right edge

WEB_MAX_PX    = 2000       # max dimension for fullscreen copies
THUMB_MAX_PX  = 800        # max dimension for grid thumbnail copies
JPEG_QUALITY  = 85         # 1–95; 85 balances quality and file size well

# ─────────────────────────────────────────────────────────────────────────────

EXTENSIONS = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
SKIP_FILES  = {'HY Photography.png', 'HY Photography Black.png'}
SKIP_DIRS   = {'web', 'thumbs'}


def area_brightness(img, x, y, w, h):
    """Return the average brightness (0–255) of a rectangular region."""
    x2 = min(x + w, img.width)
    y2 = min(y + h, img.height)
    region = img.crop((max(0, x), max(0, y), x2, y2))
    gray   = region.convert('L')
    pixels = list(gray.getdata())
    return sum(pixels) / len(pixels) if pixels else 128


def composite_watermark(photo, watermark, opacity, size_px, padding):
    """Return a copy of photo with the watermark at the top-right corner."""
    img = photo.convert('RGBA')
    wm  = watermark.copy()

    wm_w = max(1, size_px)
    wm_h = max(1, int(wm.height * wm_w / wm.width))
    wm   = wm.resize((wm_w, wm_h), Image.LANCZOS)

    # Flatten semi-transparent lines to a solid stamp, then apply opacity
    r, g, b, a = wm.split()
    a = a.point(lambda x: int(opacity * 255) if x > 10 else 0)
    wm.putalpha(a)

    x = img.width  - wm_w - padding   # top-right
    y = padding

    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    layer.paste(wm, (x, y), wm)

    return Image.alpha_composite(img, layer).convert('RGB')


def pick_watermark(img, size_px, padding, wm_white, wm_black):
    """Choose white or black watermark based on placement-area brightness."""
    if wm_black is None:
        return wm_white
    wm_h = max(1, int(wm_white.height * size_px / wm_white.width))
    x    = img.width - size_px - padding
    y    = padding
    brightness = area_brightness(img, x, y, size_px, wm_h)
    return wm_black if brightness > BRIGHTNESS_THRESHOLD else wm_white


def process_one(src, dst, max_px, wm_white, wm_black, size_px):
    """Resize, watermark, and save. Returns 'done' or 'skip'."""
    if os.path.exists(dst):
        return 'skip'

    os.makedirs(os.path.dirname(dst), exist_ok=True)

    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    img.thumbnail((max_px, max_px), Image.LANCZOS)

    watermark = pick_watermark(img, size_px, WATERMARK_PADDING,
                                wm_white, wm_black)
    result    = composite_watermark(img, watermark, WATERMARK_OPACITY,
                                    size_px, WATERMARK_PADDING)

    ext = os.path.splitext(dst)[1].lower()
    if ext in ('.jpg', '.jpeg'):
        result.save(dst, format='JPEG', quality=JPEG_QUALITY, optimize=True)
    else:
        result.save(dst, format='PNG', optimize=True)

    return 'done'


def clear_processed():
    import shutil
    for root, dirs, _ in os.walk('images'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in ('web', 'thumbs'):
            path = os.path.join(root, name)
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f'  removed {path}')


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    if not os.path.exists(WATERMARK_WHITE):
        sys.exit(f'Error: white watermark not found at {WATERMARK_WHITE}')

    print('Clearing old processed images...')
    clear_processed()
    print()

    wm_white = Image.open(WATERMARK_WHITE).convert('RGBA')
    wm_black = None

    if WATERMARK_BLACK and os.path.exists(WATERMARK_BLACK):
        wm_black = Image.open(WATERMARK_BLACK).convert('RGBA')
        print(f'Adaptive watermark: ON (threshold = {BRIGHTNESS_THRESHOLD})')
    else:
        print('Adaptive watermark: OFF (add WATERMARK_BLACK path to enable)')

    print('Processing images...\n')

    done = skipped = errors = 0

    for root, dirs, files in os.walk('images'):
        dirs[:] = [d for d in sorted(dirs) if d not in SKIP_DIRS]

        for fname in sorted(files):
            if fname in SKIP_FILES:
                continue
            if os.path.splitext(fname)[1] not in EXTENSIONS:
                continue

            src       = os.path.join(root, fname)
            web_dst   = os.path.join(root, 'web',    fname)
            thumb_dst = os.path.join(root, 'thumbs', fname)

            for dst, max_px, size_px, label in [
                (web_dst,   WEB_MAX_PX,   WATERMARK_SIZE_PX,       'web  '),
                (thumb_dst, THUMB_MAX_PX, WATERMARK_SIZE_PX_THUMB, 'thumb'),
            ]:
                try:
                    r = process_one(src, dst, max_px, wm_white, wm_black, size_px)
                    if r == 'done':
                        done += 1
                        print(f'  + {label}  {dst}')
                    else:
                        skipped += 1
                        print(f'  - skip   {dst}')
                except Exception as exc:
                    errors += 1
                    print(f'  ! error  {dst}: {exc}')

    print(f'\nFinished — {done} created, {skipped} skipped, {errors} errors')


if __name__ == '__main__':
    main()
