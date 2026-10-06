# Articles

Records for the Article page. Import them from `@/app/DataFolder/articles`. Do not copy the list into a component.

```
frontend/src/app/DataFolder/articles/catalog.json          the records
frontend/public/DataFolder/articles/covers/<id>.jpg        the cover
```

Next will not serve a file out of `src`. Covers have to live under `public`.

## Add an article

1. Save a cover as `frontend/public/DataFolder/articles/covers/<id>.jpg`. No text in the image. 16:9 is enough.
2. Add an object to `catalog.json`. `id` is lowercase, with hyphens.
3. `cover` is `/DataFolder/articles/covers/<id>.jpg`.
4. `publishedAt` is ISO-8601, with the offset (`2026-10-05T09:20:00+05:30`).
5. `body` is markdown, the same subset Explore uses. A line starting with `>` is the quoted line. Blank line between paragraphs. `##` for a heading, `-` for a list.
6. `reelId` is an id from `DataFolder/explore/reels/catalog.json`. Create reel plays that file until a generated reel exists. Do not point it at a file that is not there.
7. `relatedIds` are other article ids. Three is enough.
8. Open `/article?article=<id>`.

`speaker.id` should match the reel catalog (`swami-vivekananda`), so the two pages can join later. `author` is who keeps the reading. It is not a stand-in for the speaker.

The quoted line should be his. The prose around it is the archive's. Do not invent a lecture title or a page number you have not checked.

To point a reel back at an article, set `articleId` on that reel. The Article page does not read that field. It uses `reelId` on the article.
