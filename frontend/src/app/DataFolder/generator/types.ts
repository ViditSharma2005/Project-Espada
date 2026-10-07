


export type QuoteMediaId =
  | "spirituality"
  | "strength"
  | "raja-yoga"
  | "fomo"
  | "focus"
  | "karma-yoga"
  | "vedanta"
  | "seva"
  | "concentration";

export type QuoteEntry = {
  
  id: string;
  
  quote: string;
  
  title: string;
  
  work: string;
  
  url?: string;
  
  themes: string[];
  
  description: string;
  
  mediaId: QuoteMediaId;
  
  tags?: string[];
};
