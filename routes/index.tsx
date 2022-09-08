import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <Head>
        <title>Planet Fresh</title>
      </Head>
      <h1 class="flex items-center text-2xl font-bold mt-8 mb-2">
        <img
          class="mr-3"
          src="/logo.svg"
          height="100px"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        Planet Fresh
      </h1>

      <p class="text-lg leding-loose mb-8">A simple RSS feed aggregator</p>

      <p class="text-lg leding-loose mb-8">Examples:</p>

      <a
        href="/peeps"
        class="p-4 border-lg rounded-xl mt-4 bg-green-100 m-3"
      >
        People
      </a>

      <a
        href="/corps"
        class="p-4 border-lg rounded-xl mt-4 bg-green-100 m-3"
      >
        Corporations
      </a>
    </div>
  );
}
