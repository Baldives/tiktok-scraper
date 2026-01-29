// apify/main.js
import { Actor } from 'apify';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

await Actor.init();

try {
    const input = await Actor.getInput();
    const { type, query, number = 0, filetype = 'json', download = false, sessionFile, apifyProxyGroups } = input;

    // Validate type
    if (!['user', 'hashtag', 'trend', 'music', 'video'].includes(type)) {
        throw new Error(`Invalid type "${type}". Must be one of: user, hashtag, trend, music, video`);
    }

    // Download session file if it's a URL
    let sessionPath = sessionFile;
    if (sessionFile.startsWith('http')) {
        const response = await axios.get(sessionFile);
        sessionPath = 'session.txt';
        fs.writeFileSync(sessionPath, response.data);
    }

    // Build CLI command
    const cliPath = path.join('.', 'cli.js');
    const cmd = [
        'node', cliPath,
        type, query,
        '--session-file', sessionPath,
        '--filetype', filetype,
        '--number', number,
        download ? '-d' : '',
        apifyProxyGroups ? `--proxy ${apifyProxyGroups}` : ''
    ].filter(Boolean);

    console.log('Running TikTok scraper CLI:', cmd.join(' '));

    const output = execSync(cmd.join(' '), { encoding: 'utf-8' });

    console.log('CLI output:', output);

    await Actor.pushData({ result: output });

    console.log('Scraping finished. Data saved to default dataset.');

} catch (err) {
    console.error('Error during scraping:', err);
    await Actor.setValue('ERROR', err.message);
} finally {
    await Actor.exit();
}
