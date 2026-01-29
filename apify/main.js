import Apify from 'apify';
// Import from compiled JS if using TypeScript build, adjust path if needed
import { hashtag, user } from '../dist/index.js'; 

Apify.main(async () => {
    // 1️⃣ Get input from Apify UI or default
    const input = await Apify.getInput();
    const scrapeType = input.scrapeType || 'hashtag'; // 'hashtag' or 'user'
    const query = input.query;
    const maxVideos = input.maxVideos || 50;

    if (!query) {
        throw new Error('Please provide a query (hashtag or username) in the input');
    }

    // 2️⃣ Set up scraping options
    const options = {
        number: maxVideos,       // max videos to fetch
        download: false,         // no video download
        asyncScraping: 2,        // concurrency
        proxy: Apify.getApifyProxyUrl(), // use Apify proxies
        noWaterMark: false       // include watermark URLs
    };

    let result;

    try {
        // 3️⃣ Call the appropriate scraper
        if (scrapeType === 'hashtag') {
            result = await hashtag(query, options);
        } else if (scrapeType === 'user') {
            result = await user(query, options);
        } else {
            throw new Error(`Unsupported scrapeType: ${scrapeType}`);
        }
    } catch (err) {
        console.error('Scraping failed:', err);
        throw err;
    }

    // 4️⃣ Push each video to Apify dataset
    if (result && result.collector && Array.isArray(result.collector)) {
        for (const post of result.collector) {
            await Apify.pushData({
                id: post.id,
                type: scrapeType,
                query,
                author: post.author?.uniqueId,
                caption: post.text,
                createdAt: post.createTime ? new Date(post.createTime * 1000).toISOString() : null,
                videoUrl: post.video?.downloadAddr || post.video?.playAddr,
                playCount: post.stats?.playCount,
                likeCount: post.stats?.diggCount,
                commentCount: post.stats?.commentCount,
                shareCount: post.stats?.shareCount
            });
        }
    }

    console.log(`Scraping finished: ${result.collector.length} videos collected for ${scrapeType} "${query}"`);
});
