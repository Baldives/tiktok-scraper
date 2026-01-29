import { Actor } from 'apify';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

await Actor.init();

const input = await Actor.getInput();
const sessionFilePath = path.resolve('session.txt'); // your session file
let session = '';

// Read session.txt if it exists
if (fs.existsSync(sessionFilePath)) {
    session = fs.readFileSync(sessionFilePath, 'utf-8').trim();
}

// Build CLI command
const cmdParts = ['node', 'cli.js'];

// Required: type and query
if (!input.type || !input.query) {
    throw new Error('Input "type" and "query" are required!');
}
cmdParts.push(input.type, input.query);

// Optional flags
if (input.number) cmdParts.push('-n', input.number.toString());
if (input.download) cmdParts.push('-d');
if (input.noWaterMark) cmdParts.push('-w');
if (input.filepath) cmdParts.push('--filepath', input.filepath);
if (input.filetype) cmdParts.push('--filetype', input.filetype);
if (input.filename) cmdParts.push('--filename', input.filename);
if (input.asyncDownload) cmdParts.push('--asyncDownload', input.asyncDownload.toString());
if (input.hd) cmdParts.push('--hd');
if (input.zip) cmdParts.push('--zip');
if (session) cmdParts.push('--session-file', sessionFilePath);
if (input.proxy) cmdParts.push('--proxy', input.proxy);
if (input.proxyFile) cmdParts.push('--proxy-file', input.proxyFile);

// Join command for execution
const cmd = cmdParts.join(' ');

console.log('Running command:', cmd);

const runScraper = () => {
    return new Promise((resolve, reject) => {
        const process = exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });

        process.stdout.pipe(process.stdout);
        process.stderr.pipe(process.stderr);
    });
};

try {
    const { stdout, stderr } = await runScraper();
    console.log('Scraper finished.');
    await Actor.setValue('OUTPUT', stdout);
} catch (err) {
    console.error('Scraper failed:', err);
    throw err;
}

await Actor.exit();
