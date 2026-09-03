#!/usr/bin/env bash
# Upload the site's MP4s to a Cloudflare R2 bucket.
#
# Only the videos actually referenced by the pages are uploaded — the list is
# derived from src/pages/*.astro at run time, so it can't drift from the markup.
# (videos/ on disk also holds ~39 MB of unreferenced files that are skipped.)
#
# Usage:
#   ./scripts/upload-videos.sh <bucket-name> [--dry-run]
#
# Requires `wrangler login` (or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID)
# with R2 write access.

set -euo pipefail

BUCKET="${1:-}"
DRY_RUN="${2:-}"

if [[ -z "$BUCKET" ]]; then
  echo "usage: $0 <bucket-name> [--dry-run]" >&2
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEO_DIR="$(cd "$APP_DIR/.." && pwd)/videos"

if [[ ! -d "$VIDEO_DIR" ]]; then
  echo "error: video directory not found at $VIDEO_DIR" >&2
  exit 1
fi

# Referenced filenames, e.g. ${VIDEO_BASE}/hero-montage.mp4 -> hero-montage.mp4
# (plain while-read rather than mapfile — macOS still ships bash 3.2)
VIDEOS=()
while IFS= read -r line; do
  VIDEOS+=("$line")
done < <(
  grep -oh 'VIDEO_BASE}/[A-Za-z0-9._-]*' "$APP_DIR"/src/pages/*.astro \
    | sed 's|VIDEO_BASE}/||' \
    | sort -u
)

if [[ ${#VIDEOS[@]} -eq 0 ]]; then
  echo "error: no video references found in src/pages/*.astro" >&2
  exit 1
fi

echo "Bucket:      $BUCKET"
echo "Source:      $VIDEO_DIR"
echo "Referenced:  ${#VIDEOS[@]} files"
echo

missing=0
for name in "${VIDEOS[@]}"; do
  [[ -f "$VIDEO_DIR/$name" ]] || { echo "  MISSING: $name" >&2; missing=1; }
done
if [[ $missing -eq 1 ]]; then
  echo "error: some referenced videos are absent from $VIDEO_DIR" >&2
  exit 1
fi

for name in "${VIDEOS[@]}"; do
  size=$(du -h "$VIDEO_DIR/$name" | cut -f1)
  if [[ "$DRY_RUN" == "--dry-run" ]]; then
    echo "  [dry-run] $name ($size) -> $BUCKET/videos/$name"
    continue
  fi
  echo "  uploading $name ($size)"
  npx wrangler r2 object put "$BUCKET/videos/$name" \
    --file="$VIDEO_DIR/$name" \
    --content-type="video/mp4" \
    --cache-control="public, max-age=31536000, immutable" \
    --remote
done

echo
echo "Done. Now point the site at the bucket's public URL, e.g."
echo "  PUBLIC_VIDEO_BASE=https://<your-r2-public-domain>/videos"
