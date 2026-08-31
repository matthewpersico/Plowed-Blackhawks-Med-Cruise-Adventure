#!/usr/bin/env python3

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
PHOTOS_DIR = REPO_ROOT / "photos"
OUTPUT_DIR = REPO_ROOT / "_data"
OUTPUT_FILE = OUTPUT_DIR / "photos.json"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
}


def main():
    galleries = []

    if PHOTOS_DIR.exists():
        for person_dir in sorted(
            (path for path in PHOTOS_DIR.iterdir() if path.is_dir()),
            key=lambda path: path.name.casefold(),
        ):
            photos = []

            for photo in sorted(
                (
                    path
                    for path in person_dir.iterdir()
                    if path.is_file()
                    and path.suffix.lower() in IMAGE_EXTENSIONS
                ),
                key=lambda path: path.name.casefold(),
            ):
                relative_path = photo.relative_to(REPO_ROOT).as_posix()

                photos.append(
                    {
                        "path": "/" + relative_path,
                        "filename": photo.name,
                    }
                )

            if photos:
                galleries.append(
                    {
                        "name": person_dir.name,
                        "photos": photos,
                    }
                )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    OUTPUT_FILE.write_text(
        json.dumps(galleries, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
