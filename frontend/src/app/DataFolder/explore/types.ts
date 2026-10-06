// Shared record types. Import these from other pages instead of
// inventing a second shape for the same reel.

export type PersonRef = {
  id: string;
  name: string;
};

export type ReelMedia = {
  /** Site path. File lives in frontend/public, so this starts with /DataFolder. */
  src: string;
  mimeType: "video/mp4";
  width: number;
  height: number;
  durationSec?: number;
  poster?: string;
};

export type Reel = {
  id: string;
  kind: "reel";
  title: string;
  /** Markdown. Rendered in the reading pane. */
  description: string;
  media: ReelMedia;
  /** Whose words the reel is built on. */
  speaker: PersonRef;
  /** Who put the reel in the archive. */
  uploader: PersonRef;
  /** ISO-8601. */
  uploadedAt: string;
  language?: string;
  tags?: string[];
  /** Set this when the Article page has a matching piece. */
  articleId?: string;
  source?: {
    work?: string;
    url?: string;
  };
};
