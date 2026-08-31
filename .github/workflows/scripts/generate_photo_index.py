#!/usr/bin/env python3

import hashlib
import json
import shutil
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]

PHOTOS_DIR = REPO_ROOT / "photos"
OUTPUT_DIR = REPO_ROOT / "_data"
OUTPUT_FILE = OUTPUT_DIR / "photos.json"

THUMBNAIL_DIR = REPO_ROOT / "assets" / "gallery-thumbnails"


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
}

VIDEO_EXTENSIONS = {
    ".mp4",
}

MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS


def relative_url(path):
    """
    Return a repository-relative URL beginning with /.
    """

    return "/" + path.relative_to(REPO_ROOT).as_posix()


def thumbnail_name(video):
    """
    Generate a unique thumbnail filename.

    Including a hash of the relative video path prevents collisions
    when two people have videos with the same filename.
    """

    relative = video.relative_to(REPO_ROOT).as_posix()

    digest = hashlib.sha1(
        relative.encode("utf-8")
    ).hexdigest()[:12]

    return f"{video.stem}-{digest}.jpg"


def generate_video_thumbnail(video, thumbnail):
    """
    Generate a JPEG thumbnail from an MP4.

    The frame is taken one second into the video. If the video is
    shorter than that, ffmpeg will normally use the closest available
    frame.
    """

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",

        "-ss",
        "1",

        "-i",
        str(video),

        "-frames:v",
        "1",

        "-vf",
        "scale=640:-2",

        "-q:v",
        "3",

        str(thumbnail),
    ]

    subprocess.run(
        command,
        check=True,
    )


def main():
    galleries = []

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    THUMBNAIL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    ffmpeg = shutil.which("ffmpeg")

    generated_thumbnails = set()

    if PHOTOS_DIR.exists():

        person_directories = sorted(
            (
                path
                for path in PHOTOS_DIR.iterdir()
                if path.is_dir()
            ),
            key=lambda path: path.name.casefold(),
        )

        for person_dir in person_directories:

            media_items = []

            files = sorted(
                (
                    path
                    for path in person_dir.iterdir()

                    if path.is_file()
                    and path.suffix.lower() in MEDIA_EXTENSIONS
                ),
                key=lambda path: path.name.casefold(),
            )

            for media in files:

                suffix = media.suffix.lower()

                item = {
                    "path": relative_url(media),
                    "filename": media.name,
                }

                if suffix in VIDEO_EXTENSIONS:

                    item["type"] = "video"

                    thumbnail = (
                        THUMBNAIL_DIR /
                        thumbnail_name(media)
                    )

                    generated_thumbnails.add(thumbnail)

                    #
                    # Regenerate the thumbnail if:
                    #
                    #   * it does not exist, or
                    #   * the video is newer than the thumbnail.
                    #

                    if (
                        not thumbnail.exists()
                        or media.stat().st_mtime >
                           thumbnail.stat().st_mtime
                    ):

                        if ffmpeg is None:
                            raise RuntimeError(
                                "ffmpeg is required to "
                                "generate video thumbnails"
                            )

                        print(
                            f"Generating thumbnail: "
                            f"{media.relative_to(REPO_ROOT)}"
                        )

                        generate_video_thumbnail(
                            media,
                            thumbnail,
                        )

                    item["thumbnail"] = relative_url(
                        thumbnail
                    )

                else:

                    item["type"] = "image"

                media_items.append(item)

            if media_items:

                galleries.append(
                    {
                        "name": person_dir.name,
                        "media": media_items,
                    }
                )

    #
    # Remove thumbnails belonging to videos that no longer exist.
    #

    for thumbnail in THUMBNAIL_DIR.glob("*.jpg"):

        if thumbnail not in generated_thumbnails:

            print(
                f"Removing obsolete thumbnail: "
                f"{thumbnail.relative_to(REPO_ROOT)}"
            )

            thumbnail.unlink()

    OUTPUT_FILE.write_text(
        json.dumps(
            galleries,
            indent=2,
            ensure_ascii=False,
        ) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
