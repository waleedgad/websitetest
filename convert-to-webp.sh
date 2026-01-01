#!/bin/bash

ROOT_DIR="./assets/img/photography"

find "$ROOT_DIR" -type f \( \
  -iname "*.jpg" -o \
  -iname "*.jpeg" -o \
  -iname "*.png" \
\) | while read -r img; do

  output="${img%.*}.webp"

  if [ ! -f "$output" ]; then
    echo "Converting: $img → $output"
    cwebp -lossless "$img" -o "$output"
  else
    echo "Skipping: $output already exists"
  fi

done
