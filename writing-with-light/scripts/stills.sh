#!/bin/sh
# Renders one style frame per chapter into out/stills, plus a contact sheet (out/stills/sheet.jpg).
set -e
cd "$(dirname "$0")/.."
npx remotion bundle src/index.ts --out-dir=build --log=error
mkdir -p out/stills
i=0
for frame in 120 279 480 714 930 1098 1299 1449 1590 1660 1884 1995 2121; do
  i=$((i + 1))
  npx remotion still build Main "out/stills/$(printf %02d $i).jpg" --frame=$frame --log=error
done
ffmpeg -v error -y -start_number 1 -i out/stills/%02d.jpg -vf "scale=640:-1,tile=4x4:padding=8" -frames:v 1 out/stills/sheet.jpg
echo "done: out/stills"
