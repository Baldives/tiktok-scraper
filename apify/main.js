import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN, // 👈 best practice
});

const input = {
    searchType: "hashtag",
    searchTerms: ["fyp"],
    maxItems: 100,

    commentsPerPost: 0,
    maxRepliesPerComment: 0,

    proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
    },
};

const run = await client
    .actor("clockworks/tiktok-scraper")
    .call(input);

console.log("✅ Actor finished");
console.log(
    `💾 Dataset: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`
);

const { items } = await client
    .dataset(run.defaultDatasetId)
    .listItems();

items.forEach((item, i) => {
    console.log(`\n📹 Item ${i + 1}`);
    console.dir(item, { depth: null });
});
