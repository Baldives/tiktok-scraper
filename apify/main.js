import { Actor } from 'apify';
import { execFile } from 'child_process';
import path from 'path';
import util from 'util';

const execFileAsync = util.promisify(execFile);

await Actor.init();

const input = await Actor.getInput();

const {
    type,
    query,
    number,
    filetype,
    download,
    sessionFile,
} = input;

// Validate minimal input
if (!type || !query) {
    throw new Error('Both "type" and "query" are required');
}

// Build CLI arguments
const args = [
    type,                 // hashtag
    query,                // funnycats
    '--number', String(number || 10),
    '--filetype', filetype || 'json',
    '--session-file', sessionFile || '',
];

// Explicitly prevent downloads
if (download === false) {
    // do nothing, default is no download
}

// Run scraper CLI
const cliPath = path.join(process.cwd(), 'cli.js');

const { stdout, stderr } = await execFileAsync(
    'node',
    [cliPath, ...args],
    { maxBuffer: 1024 * 1024 * 10 }
);

if (stdout) console.log(stdout);
if (stderr) console.error(stderr);

await Actor.exit();
