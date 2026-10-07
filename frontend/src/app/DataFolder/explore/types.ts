


export type PersonRef = {
  id: string;
  name: string;
};

export type ReelMedia = {
  
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
  
  description: string;
  media: ReelMedia;
  
  speaker: PersonRef;
  
  uploader: PersonRef;
  
  uploadedAt: string;
  language?: string;
  tags?: string[];
  
  articleId?: string;
  source?: {
    work?: string;
    url?: string;
  };
};
