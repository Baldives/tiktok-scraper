// main.js
import { Actor } from 'apify';
import path from 'path';
import fs from 'fs';
import { hashtag, user, trend, music, video } from './src/entry.js';

await Actor.init();

const input = await Actor.getInput();

if (!input || !input.type || !input.query) {
    throw new Error('Input must have "type" (user, hashtag, trend, music, video) and "query" fields.');
}

// Set session file path
const sessionFile = path.resolve('.actor/session.txt');
if (!fs.existsSync(sessionFile)) {
    throw new Error(`Session file not found at ${sessionFile}`);
}

// Prepare common options
const options = {
    sessionFile,
    number: input.number || 20,         // default scrape 20 posts
    download: input.download || false,  // download videos if true
    filetype: input.filetype || 'json', // json/csv/all
    filepath: input.filepath || 'output' // where to save downloads/metadata
};

// Make sure output folder exists
if (!fs.existsSync(options.filepath)) {
    fs.mkdirSync(options.filepath, { recursive: true });
}

let result;

switch (input.type) {
    case 'hashtag':
        result = await hashtag(input.query, options);
        break;
    case 'user':
        result = await user(input.query, options);
        break;
    case 'trend':
        result = await trend(input.query, options);
        break;
    case 'music':
        result = await music(input.query, options);
        break;
    case 'video':
        result = await video(input.query, options);
        break;
    default:
        throw new Error(`Unknown type: ${input.type}`);
}

console.log('Scraping finished. Result:');
console.log(result);

await Actor.exit();
