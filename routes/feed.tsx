/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "@twind";
import { fetchFeeds, sortedFeed } from "../utils/fetchFeeds.ts";
import { FeedEntry } from "rss/src/types/mod.ts";
import { Head } from "$fresh/runtime.ts";

const peeps = [
  "https://andrewkelley.me/rss.xml",
  "https://justinjaffray.com/index.xml",
  "https://notes.eatonphil.com/rss.xml",
  "https://univalence.me/api/feed",
  "https://www.gingerbill.org/article/index.xml",
  "https://feeds.feedburner.com/martinkl",
];

const corps = [
  "https://fly.io/blog/feed.xml",
  "https://materialize.com/rss.xml",
  "https://redpanda.com/rss.xml",
  "https://deno.com/feed",
  "http://rocksdb.org/feed.xml",
];

const feedUrls = peeps;

export const handler: Handlers<FeedEntry[]> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    console.log(url.searchParams);

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
  const href = entry.links[0].href;
  if (!href) return null;

  const domain = new URL(href).host;
  return (
    <div>
      <ul>
        <li className={tw`text-xl p-4`}>
          <a href={entry.links[0].href} target="_blank">
            {entry.title?.value}
          </a>
          <br />
          <b>
            <a href={`?domain=${encodeURIComponent(domain)}`}>{domain}</a>
          </b>{" "}
          &mdash;
          <small> {entry.published?.toLocaleDateString()} ..</small>
        </li>
      </ul>
    </div>
  );
}
