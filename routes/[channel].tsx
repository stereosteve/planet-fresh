/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "@twind";
import { entryTimestamp, fetchFeeds, sortedFeed } from "../utils/fetchFeeds.ts";
import { FeedEntry } from "rss/src/types/mod.ts";
import { Head } from "$fresh/runtime.ts";

const channels: Record<string, string[]> = {
  peeps: [
    "https://andrewkelley.me/rss.xml",
    "https://justinjaffray.com/index.xml",
    "https://notes.eatonphil.com/rss.xml",
    // "https://univalence.me/api/feed",
    "https://www.gingerbill.org/article/index.xml",
    "https://feeds.feedburner.com/martinkl",
    "https://www.complete.org/index.xml",
    "https://jvns.ca/atom.xml",
  ],

  corps: [
    "https://fly.io/blog/feed.xml",
    "https://materialize.com/rss.xml",
    "https://redpanda.com/rss.xml",
    "https://deno.com/feed",
    "http://rocksdb.org/feed.xml",
    "https://duckdb.org/feed.xml",
  ],
};

export const handler: Handlers<FeedEntry[]> = {
  async GET(req, ctx) {
    const { channel } = ctx.params;
    const feedUrls = channels[channel];
    const url = new URL(req.url);
    console.log(channel, url.searchParams);

    if (!feedUrls) return ctx.render();

    // maybe filter logic should be pushed down to fetchFeeds
    // so that this file can "Just" be UI
    // and it's easy to copy paste to edit the "template"
    const visibleDomain = url.searchParams.get("domain");
    const visibleUrls = visibleDomain
      ? feedUrls.filter((u) => u.includes(visibleDomain))
      : feedUrls;

    const feeds = await fetchFeeds(visibleUrls);
    const items = sortedFeed(feeds);
    return ctx.render(items);
  },
};

export default function Page({ data, params, url }: PageProps<FeedEntry[]>) {
  if (!data) {
    return <h1>no data</h1>;
  }

  return (
    <div>
      <Head>
        <title>Planet Fresh</title>
      </Head>
      <div>
        <a href="/">Home</a>
      </div>
      <AppliedFilterUI url={url} />
      {data.map((entry) => (
        <EntryUI entry={entry} />
      ))}
    </div>
  );
}

function AppliedFilterUI({ url }: { url: URL }) {
  if (!url.search) return null;
  return (
    <div>
      <pre>{url.search}</pre>
      <a href="?">clear</a>
    </div>
  );
}

function EntryUI({ entry }: { entry: FeedEntry }) {
  const href = entry.links.map((l) => l.href).filter(Boolean)[0];
  if (!href) return null;

  const domain = new URL(href).host;
  return (
    <div>
      <ul>
        <li className={tw`text-xl mx-8 my-5`}>
          <a href={href}>
            <b>{entry.title?.value}</b>
          </a>
          <div class={tw`text-xs`}>
            <a href={`?domain=${encodeURIComponent(domain)}`}>{domain} </a>
            &middot;
            <span class={tw`text-gray-500`}>
              {" "}
              {entryTimestamp(entry)?.toLocaleDateString()}{" "}
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
