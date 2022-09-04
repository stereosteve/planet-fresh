import { Feed, parseFeed } from "https://deno.land/x/rss/mod.ts";
import { FeedEntry } from "https://deno.land/x/rss@0.5.6/src/types/mod.ts";

const TIMED_OUT = "TIMED_OUT";

export async function fetchFeeds(feedUrls: string[], timeout = 2000) {
  const feeds: Feed[] = [];

  const finished = Promise.all(
    feedUrls.map(async (feedUrl) => {
      console.time(feedUrl);
      const response = await fetch(feedUrl);
      console.timeEnd(feedUrl);

      if (!response.ok) {
        console.log("not ok", feedUrl, response.status);
        return;
      }
      const xml = await response.text();
      const feed = await parseFeed(xml);

      // normalize links
      for (const entry of feed.entries) {
        for (const link of entry.links) {
          if (!link.href) continue;
          link.href = new URL(link.href, feedUrl).toString();
        }
      }

      feeds.push(feed);
    })
  );

  let timeoutId;
  const timedOut = new Promise((r) => {
    timeoutId = setTimeout(() => TIMED_OUT, timeout);
  });

  await Promise.race([finished, timedOut]);

  clearTimeout(timeoutId);

  return feeds;
}

export function sortedFeed(feeds: Feed[]) {
  const items = feeds.flatMap((feed) => feed.entries);
  items.sort((a, b) => (entryTimestamp(b)! < entryTimestamp(a)! ? -1 : 1));
  return items;
}

export function entryTimestamp(entry: FeedEntry) {
  return entry.published || entry.updated;
}

// const feedUrls = [
//   "https://andrewkelley.me/rss.xml",
//   "https://justinjaffray.com/blog/index.xml",
// ];
// const feeds = await fetchFeeds(feedUrls);
// const sorted = sortedFeed(feeds);
// console.log(sorted);
