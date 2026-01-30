import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

const input = {
    hashtags: ['fyp'],
    resultsPerPage: 100,

    // optional limits
    commentsPerPost: 0,
    maxRepliesPerComment: 0,

    proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
    },
};

const run = await client
    .actor('clockworks/tiktok-scraper')
    .call(input);

console.log(`Dataset: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);

const { items } = await client
    .dataset(run.defaultDatasetId)
    .listItems();

console.log(`Fetched ${items.length} items`);
