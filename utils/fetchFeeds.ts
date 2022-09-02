import { Feed, parseFeed } from "https://deno.land/x/rss/mod.ts";

export async function fetchFeeds(feedUrls: string[], timeout = 2000) {
  const feeds: Feed[] = [];

  const finished = Promise.all(
    feedUrls.map(async (feedUrl) => {
      const response = await fetch(feedUrl);
      if (!response.ok) return;
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
    timeoutId = setTimeout(r, timeout);
  });

  await Promise.race([finished, timedOut]);

  clearTimeout(timeoutId);

  return feeds;
}

export function sortedFeed(feeds: Feed[]) {
  const items = feeds.flatMap((feed) => feed.entries);
  items.sort((a, b) => (b.published! < a.published! ? -1 : 1));
  return items;
}

// const feedUrls = [
//   "https://andrewkelley.me/rss.xml",
//   "https://justinjaffray.com/blog/index.xml",
// ];
// const feeds = await fetchFeeds(feedUrls);
// const sorted = sortedFeed(feeds);
// console.log(sorted);
