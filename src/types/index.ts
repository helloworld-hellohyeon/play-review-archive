export interface TweetEntity {
  media?: TweetMedia[];
}

export interface TweetMedia {
  media_url_https: string;
  expanded_url?: string;
}

export interface RawTweet {
  id: string;
  full_text: string;
  created_at: string;
  in_reply_to_status_id?: string;
  in_reply_to_screen_name?: string;
  entities?: TweetEntity;
}

export interface RawItem {
  tweet: RawTweet;
}

export interface ThreadTweet {
  full_text: string;
  created_at: string;
  media_urls: string[];
}

export interface FilteredTweet extends ThreadTweet {
  url: string;
  threads: ThreadTweet[];
}

export interface FilterOptions {
  datePrefix: boolean;
  photoWithThread: boolean;
  keyword: string;
}

export interface FilterResult {
  result: FilteredTweet[];
  totalCount: number;
  rootCount: number;
  threadCount: number;
  username: string;
}
