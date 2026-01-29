// apify/main.js
import { Actor } from 'apify';
import { execSync } from 'child_process';
import path from 'path';

await Actor.init();

try {
    // Get input from the actor's input schema
    const input = await Actor.getInput();

    // Mandatory fields in input schema
    const username = input.username; // or hashtag, trend, etc.
    const sessionFile = input.sessionFile || 'session.txt'; // default path in Apify folder
    const proxyGroups = input.apifyProxyGroups || ''; // Apify proxy group names
    const filetype = input.filetype || 'json'; // output file type
    const since = input.since || 0; // scrape posts after this timestamp
    const number = input.number ?? 0; // number of posts to scrape (0 = all)

    // Build CLI command
    const cliPath = path.join('.', 'cli.js'); // path to the TikTok scraper CLI
    const cmd = [
        'node', cliPath,
        'user', username,                     // change to 'hashtag' or 'trend' if needed
        '--session-file', sessionFile,
        '--proxy', proxyGroups,
        '--filetype', filetype,
        '--since', since,
        '--number', number,
    ];

    // Run the CLI command synchronously
    console.log('Running TikTok scraper CLI...');
    const output = execSync(cmd.join(' '), { encoding: 'utf-8' });

    console.log('CLI output:', output);

    // Store the CLI output in Apify dataset
    await Actor.pushData({ result: output });

    console.log('Scraping finished. Data saved to default dataset.');

} catch (err) {
    console.error('Error during scraping:', err);
    await Actor.setValue('ERROR', err.message);
} finally {
    await Actor.exit();
}
