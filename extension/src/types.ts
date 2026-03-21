export interface ExtractedTweet {
  tweetId: string;
  tweetUrl: string;
  username: string;
  createdAt: string;
  text: string;
  mediaUrls: string[];
}

export interface ExtractedThread {
  rootTweet: ExtractedTweet;
  replies: ExtractedTweet[];
}

export interface ExtractMessage {
  type: "EXTRACT_THREAD";
}

export interface LoadProgressMessage {
  type: "LOAD_PROGRESS";
  loaded: number;
}

export interface ArchiveOptions {
  includeImages: boolean;
  includeAuthor: boolean;
}

export interface ExtractResponseOk {
  ok: true;
  thread: ExtractedThread;
}

export interface ExtractResponseErr {
  ok: false;
  error: string;
}

export type ExtractResponse = ExtractResponseOk | ExtractResponseErr;
