# SHRIJAN

SHRIJAN is a reading and reflection space built around the teachings of Swami Vivekananda. It brings together short reels, longer articles, prompt-based discovery, guided conversations, and a few practical ways for people to participate in the community.

The product is deliberately not just a quote wall. A reel is a way into an idea, an article gives that idea room to breathe, and the practice sections ask what it might look like in ordinary life.

## What you can do here

### Explore

Browse the reel collection in a vertical, one-reel-at-a-time view. Each reel has its own reading pane with the quote, context, source, tags, uploader information, and actions to save, download, or share it. The URL keeps the active reel, so a particular reel can be opened or shared directly.

### Read and submit articles

The Articles page contains longer readings connected to the reel collection. It includes search, related readings, reading-time information, and a full article reader.

Visitors can also submit an original article from the page. The form supports:

- title and author name
- short excerpt
- Markdown body
- tags
- a cover image selected from the available article covers

A submitted article is validated in the browser, appears immediately in the list, and remains available after a refresh on that device. It is stored in `localStorage`, not added to the shared catalog.

### Generate a reel

The Generator accepts a plain-language request such as a need for focus, courage, direction, or freedom from comparison. It evaluates the available reel themes and selects the most relevant reel.

When Gemini is configured, the selection considers more than keyword overlap. The evaluator looks at:

- semantic fit
- intent fit
- audience fit
- emotional context
- practical usefulness
- quote support
- context fit

The result includes an explanation of the match and a practical answer related to the original request. When the user opens the result in Explore, the exact selected reel opens there. Ordinary Explore visits do not show the generated response.

The Generator also has a local ranking fallback, so it still produces a useful result when Gemini is unavailable.

### Connect

The Connect area contains the mentor directory and the surrounding meeting flow, including:

- assigned mentor information
- mentor browsing
- scheduling a meeting
- upcoming and past meetings
- quick doubts
- meeting feedback

### Feedback

The Feedback area lets users browse feedback items, inspect their details, follow progress, and submit feedback through the available dialog flow.

### Public pages and account screens

The frontend also includes landing and informational pages for:

- About
- Discover
- contributor space
- terms and policy
- sign in
- sign up

## Run the frontend locally

You will need a recent Node.js installation and npm.

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Available commands:

```bash
npm run dev      # start the development server
npm run lint     # run ESLint
npm run build    # create a production build
npm run start    # serve the production build
```

## Optional Gemini setup

The Generator works without Gemini. Without a key, it uses the local ranking logic and a safe fallback response.

To enable Gemini-based reel evaluation and prompt-specific explanations, create `frontend/.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The key is used by the server-side generator route only. Do not prefix it with `NEXT_PUBLIC_`, do not place it in client-side code, and do not commit `.env.local`.

The repository includes a `.env.example` with the expected variable name.

## Project structure

```text
frontend/
├── public/
│   ├── DataFolder/
│   │   ├── articles/covers/     article cover images
│   │   ├── landing/             landing page images
│   │   └── reels/media/         reel video files
│   ├── mentors/                 mentor profile images
│   └── icons/                   coding platform icons
└── src/
    ├── app/
    │   ├── (auth)/               sign-in and sign-up routes
    │   ├── (landing)/            public landing and information pages
    │   ├── (legals)/             terms and policy pages
    │   ├── (shell)/              Explore, Articles, Generator, Connect, Feedback
    │   ├── DataFolder/            local catalogs and content types
    │   └── api/                  frontend API routes used by the app
    ├── components/
    │   ├── auth/                 authentication screens
    │   ├── shell/                feature-level page components
    │   └── ui/                   shared interface components
    └── lib/                      shared utilities and generator logic
```

## Working with content

The current content is intentionally easy to inspect and edit. Most of the catalog data lives in JSON files under `src/app/DataFolder`.

### Articles

Permanent article records live in:

```text
src/app/DataFolder/articles/catalog.json
```

Article covers belong in:

```text
public/DataFolder/articles/covers/
```

The article schema and catalog rules are documented in:

```text
src/app/DataFolder/articles/README.md
```

A catalog article should have a stable lowercase ID, an ISO-8601 `publishedAt` value, Markdown in `body`, and a valid `cover` path. If it is paired with a reel, its `reelId` must match an ID from the Explore catalog.

### Explore reels

Reel records live in:

```text
src/app/DataFolder/explore/reels/catalog.json
```

The associated videos belong in:

```text
public/DataFolder/reels/media/
```

The media path, reel ID, and `mediaId` used by the Generator must stay aligned. This is important because the Generator uses that ID when opening the selected reel in Explore.

### Generator candidates

Generator candidates live in:

```text
src/app/DataFolder/generator/quotes.json
```

Each entry describes the quote, themes, practical context, tags, and the reel media it belongs to. When adding a candidate, update both the Generator data and the matching Explore/media records.

### Local user data

The current frontend keeps a small amount of user-specific state in the browser:

- saved reel IDs
- submitted articles
- the short-lived Generator → Explore explanation handoff

This makes the current experience work without adding a persistence service, but that data is device-specific. Submitted articles are not automatically shared with other users or devices.

## Before committing changes

- Keep API keys and local environment files out of git.
- Make sure new images and videos are placed under `public`.
- Keep IDs stable and lowercase where the catalog expects IDs.
- Check that article `reelId` and Generator `mediaId` values point to real Explore records.
- Test the Generator → Explore handoff after changing selection logic or catalog IDs.
- Run `npm run lint` before opening a pull request.

## Attribution and source care

The catalog distinguishes quoted words from the explanatory writing around them. When adding a quotation, keep the source information close to the record and avoid inventing a work title, date, or page reference that has not been checked.

The articles are interpretive guides. They are not a replacement for the Complete Works of Swami Vivekananda or the original philosophical texts.
