# Agnes Continuous 30-Second Video

Creates three 10-second Agnes AI clips from one detailed prompt, then optionally joins them into one 30-second MP4.

## Setup

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Put your **new** Agnes key in `.env` and your detailed prompt in `prompt.txt`.

## Preview prompts without API usage

```bash
python main.py --prompt-file prompt.example.txt --dry-run
```

## Generate and merge

```bash
python main.py --prompt-file prompt.txt
```

Results are saved under `output/`. If FFmpeg is installed, the clips are joined as `output/final_30s.mp4`. Use `--no-merge` to skip merging.

## Consistency approach

Every request repeats the complete master prompt and an identical continuity lock. The detailed prompt is split into three balanced action sections. Each clip is described as seconds 0–10, 10–20, or 20–30 of the same uninterrupted take. This improves continuity, but independent text-to-video calls cannot guarantee pixel-perfect identity. No extra LLM call is used.

The API model can change. Check available models with:

```bash
python main.py --list-models
```
