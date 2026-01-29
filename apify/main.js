// apify/main.js
import { Actor } from 'apify';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

await Actor.init();

try {
    // Get input from Apify
    const input = await Actor.getInput();

    if (!input || !input.query) {
        throw new Error('Input missing. Please provide a "query" field.');
    }

    // Build CLI command parts
    const cmdParts = ['npx', 'tiktok-scraper'];

    // Choose scraping method
    switch (input.type) {
        case 'user':
            cmdParts.push('user', input.query);
            break;
        case 'hashtag':
            cmdParts.push('hashtag', input.query);
            break;
        case 'trend':
            cmdParts.push('trend');
            break;
        case 'music':
            cmdParts.push('music', input.query);
            break;
        case 'video':
            cmdParts.push('video', input.query);
            break;
        default:
            throw new Error('Invalid "type" in input. Must be one of: user, hashtag, trend, music, video');
    }

    // Number of posts
    if (typeof input.number === 'number') {
        cmdParts.push('-n', input.number.toString());
    }

    // Output file type
    if (input.filetype) {
        cmdParts.push('-t', input.filetype);
    }

    // Output filename
    if (input.filename) {
        cmdParts.push('-f', input.filename);
    }

    // No download (important!)
    cmdParts.push('--download', 'false');

    // Use session from session.txt in Apify folder
    if (input.sessionFile) {
        cmdParts.push('--session-file', input.sessionFile);
    } else {
        // Default path in actor storage
        cmdParts.push('--session-file', 'apify/session.txt');
    }

    // Residential proxy support
    if (input.useApifyProxy) {
        const proxyGroups = input.apifyProxyGroups?.join(',') || 'RESIDENTIAL';
        const proxySession = input.apifyProxySession || `session-${Date.now()}`;
        cmdParts.push('--proxy', `http://proxy.apify.com:8000?session=${proxySession}&groups=${proxyGroups}`);
    }

    // Convert to a single command string
    const cmd = cmdParts.join(' ');

    console.log('Running command:', cmd);

    // Execute CLI command
    const { stdout, stderr } = await execPromise(cmd);

    console.log('CLI stdout:\n', stdout);
    if (stderr) {
        console.error('CLI stderr:\n', stderr);
    }

    // Save output to default key-value store
    await Actor.setValue('OUTPUT', stdout);

    console.log('Scraping finished successfully.');
} catch (err) {
    console.error('Error:', err);
    await Actor.setValue('ERROR', err.message);
} finally {
    await Actor.exit();
}
