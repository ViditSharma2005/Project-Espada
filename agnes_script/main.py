#!/usr/bin/env python3
"""Generate three continuity-locked Agnes clips and concatenate them."""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import requests


def load_dotenv(path: Path = Path(".env")) -> None:
    """Small .env loader; avoids an extra runtime dependency."""
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))

SEGMENT_SECONDS = 10
FPS = 24
# Agnes examples use 121 frames for ~5 s at 24 fps; 241 represents ~10 s.
NUM_FRAMES = SEGMENT_SECONDS * FPS + 1


def split_prompt(text: str) -> list[str]:
    """Split prose into three roughly equal, sentence-preserving sections."""
    text = " ".join(text.split())
    if not text:
        raise ValueError("Prompt is empty")
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    if len(sentences) < 3:
        words = text.split()
        cuts = [round(len(words) * i / 3) for i in range(4)]
        return [" ".join(words[cuts[i]:cuts[i + 1]]) for i in range(3)]

    groups = [[], [], []]
    totals = [0, 0, 0]
    target = len(text) / 3
    group = 0
    for sentence in sentences:
        if group < 2 and totals[group] > 0 and totals[group] + len(sentence) > target:
            group += 1
        groups[group].append(sentence)
        totals[group] += len(sentence)
    return [" ".join(g) for g in groups]


def build_segment_prompts(master: str) -> list[str]:
    sections = split_prompt(master)
    prompts = []
    for i, section in enumerate(sections):
        start, end = i * 10, (i + 1) * 10
        transition = (
            "Begin as the opening of the shot."
            if i == 0
            else "Begin in motion, as an exact continuation of the preceding moment; do not reintroduce the subject or reset the scene."
        )
        ending = (
            "End while motion naturally continues into the next moment; hold subject position, direction, camera trajectory, lighting, and environment for a seamless continuation."
            if i < 2
            else "Resolve the action naturally while preserving the established visual identity and style."
        )
        prompts.append(f"""Create ONLY seconds {start}–{end} of one uninterrupted 30-second cinematic take.

MASTER STORY AND VISUAL BIBLE (must remain identical across all three clips):
{master}

CURRENT 10-SECOND ACTION EMPHASIS:
{section}

HARD CONTINUITY LOCK:
Same subject identity, face, body, hair, wardrobe, accessories, props, environment, weather, time of day, lighting direction, color grade, lens, camera height, camera movement, depth of field, and realism as specified in the master story. One continuous take. No cut, montage, scene change, time jump, new character, wardrobe change, duplicated object, captions, logos, or readable text.

{transition} {ending}""")
    return prompts


class AgnesClient:
    def __init__(self, api_key: str, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def list_models(self) -> dict:
        return self._request("GET", "/v1/models").json()

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        delay = 2
        for attempt in range(6):
            response = self.session.request(method, self.base_url + path, timeout=90, **kwargs)
            if response.status_code != 429 and response.status_code < 500:
                response.raise_for_status()
                return response
            if attempt == 5:
                response.raise_for_status()
            retry_after = response.headers.get("Retry-After")
            time.sleep(float(retry_after) if retry_after else delay)
            delay = min(delay * 2, 30)
        raise RuntimeError("Request retry loop ended unexpectedly")

    def submit(self, prompt: str, width: int, height: int) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "width": width,
            "height": height,
            "num_frames": NUM_FRAMES,
            "frame_rate": FPS,
        }
        data = self._request("POST", "/v1/videos", json=payload).json()
        video_id = data.get("video_id") or data.get("task_id") or data.get("id")
        if not video_id:
            raise RuntimeError(f"No video/task ID in response: {data}")
        return str(video_id)

    def wait(self, video_id: str, timeout_minutes: int = 20) -> str:
        deadline = time.time() + timeout_minutes * 60
        while time.time() < deadline:
            data = self._request("GET", "/agnesapi", params={"video_id": video_id}).json()
            status = str(data.get("status", "")).lower()
            if status in {"completed", "succeeded", "success"}:
                url = data.get("video_url") or data.get("url") or (data.get("data") or {}).get("video_url")
                if not url:
                    raise RuntimeError(f"Completed without video URL: {data}")
                return url
            if status in {"failed", "error", "cancelled"}:
                raise RuntimeError(data.get("error") or data.get("message") or json.dumps(data))
            print(f"  status={status or 'pending'} progress={data.get('progress', '?')}")
            time.sleep(30)
        raise TimeoutError(f"Video {video_id} did not finish within {timeout_minutes} minutes")


def download(url: str, path: Path) -> None:
    with requests.get(url, stream=True, timeout=180) as response:
        response.raise_for_status()
        with path.open("wb") as f:
            for chunk in response.iter_content(1024 * 1024):
                if chunk:
                    f.write(chunk)


def merge_clips(clips: list[Path], output: Path) -> bool:
    if not shutil.which("ffmpeg"):
        print("FFmpeg not found; clips were generated but not merged.")
        return False
    concat = output.parent / "concat.txt"
    concat.write_text("".join(f"file '{p.resolve().as_posix()}'\n" for p in clips), encoding="utf-8")
    copy_cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(output)]
    result = subprocess.run(copy_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        # Re-encode when generated clips differ slightly in stream parameters.
        encode_cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
                      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", str(output)]
        subprocess.run(encode_cmd, check=True)
    return True


def main() -> int:
    load_dotenv()
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt-file", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--list-models", action="store_true")
    parser.add_argument("--no-merge", action="store_true")
    parser.add_argument("--portrait", action="store_true", help="Use 768x1152 instead of 1152x768")
    parser.add_argument("--output", type=Path, default=Path("output"))
    args = parser.parse_args()

    api_key = os.getenv("AGNES_API_KEY", "")
    base = os.getenv("AGNES_BASE_URL", "https://apihub.agnes-ai.com")
    model = os.getenv("AGNES_MODEL", "agnes-video-v2.0")

    if args.list_models:
        if not api_key or api_key == "replace_me":
            parser.error("Set AGNES_API_KEY in .env")
        print(json.dumps(AgnesClient(api_key, base, model).list_models(), indent=2, ensure_ascii=False))
        return 0
    if not args.prompt_file:
        parser.error("--prompt-file is required")

    master = args.prompt_file.read_text(encoding="utf-8").strip()
    prompts = build_segment_prompts(master)
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "generated_prompts.json").write_text(
        json.dumps({"master": master, "segments": prompts}, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    if args.dry_run:
        print(json.dumps(prompts, indent=2, ensure_ascii=False))
        print("\nDry run only: no API credits used.")
        return 0
    if not api_key or api_key == "replace_me":
        parser.error("Set AGNES_API_KEY in .env")

    width, height = ((768, 1152) if args.portrait else (1152, 768))
    client = AgnesClient(api_key, base, model)
    clips = []
    # Sequential generation is deliberate: easier retrying and gentler on API limits.
    for i, prompt in enumerate(prompts, 1):
        path = args.output / f"segment_{i}.mp4"
        print(f"Submitting segment {i}/3...")
        video_id = client.submit(prompt, width, height)
        print(f"  task={video_id}")
        url = client.wait(video_id)
        download(url, path)
        clips.append(path)
        print(f"  saved {path}")

    if not args.no_merge and merge_clips(clips, args.output / "final_30s.mp4"):
        print(f"Merged video: {args.output / 'final_30s.mp4'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Cancelled", file=sys.stderr)
        raise SystemExit(130)
