# DataFolder

Records the rest of the app can import. Media the browser has to play lives under `frontend/public/DataFolder`, because Next will not serve a file out of `src`.

```
frontend/src/app/DataFolder/reels/catalog.json     the record
frontend/public/DataFolder/reels/media/<id>.mp4    the file
```

Other pages should import from `@/app/DataFolder`, not read the JSON themselves.

```ts
import { getReel, reelHref, reelsBySpeaker } from "@/app/DataFolder";
```

## Add a reel

1. Export a portrait file, 9:16, H.264 video, AAC audio if it has sound. `720x1280` is enough. Keep it small.
2. Save it as `frontend/public/DataFolder/reels/media/<id>.mp4`. The id is lowercase, with hyphens. No spaces.
3. Add an object to `reels/catalog.json`. `id` must match the file name. `media.src` is `/DataFolder/reels/media/<id>.mp4`.
4. `uploadedAt` is ISO-8601, with the offset (`2026-10-02T21:05:00+05:30`).
5. `description` is markdown. A line starting with `>` is the quote. Blank line between paragraphs. `##` for a small heading, `-` for a list.
6. Open `/explore?reel=<id>`. That is the link Share copies.

`speaker.id` and `uploader.id` are stable keys, not display names. The Article page, a saved list, or a speaker page should join on those ids.

Fields you can leave out until you need them: `tags`, `language`, `articleId`, `source`, `durationSec`, `poster`.

Do not put a second copy of this list in a component. Add the record here.

The four mp4s already in `media/` are stand-in footage so the player can be tried before real reels are dropped in. Replace the files. Keep the ids if you want the old share links to keep working.
