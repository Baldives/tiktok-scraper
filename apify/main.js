import Apify from 'apify';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

Apify.main(async () => {
    const input = await Apify.getInput();
    if (!input) throw new Error('No input provided');

    const {
        type,
        query,
        number,
        download,
        filetype,
        sessionFile,
        proxy,
    } = input;

    // Build CLI arguments
    const args = [];

    // Command + ID
    if (type === 'trend') {
        args.push('trend');
    } else {
        if (!query) {
            throw new Error(`"query" is required for type "${type}"`);
        }
        args.push(type, query);
    }

    if (number !== undefined) {
        args.push('--number', String(number));
    }

    if (download) {
        args.push('--download');
    }

    if (filetype) {
        args.push('--filetype', filetype);
    }

    if (sessionFile) {
        args.push('--session-file', sessionFile);
    }

    // Apify Residential Proxy
    if (proxy === 'RESIDENTIAL') {
        const proxyUrl = await Apify.createProxyConfiguration({
            groups: ['RESIDENTIAL'],
        }).then(cfg => cfg.newUrl());

        args.push('--proxy', proxyUrl);
    }

    Apify.log.info('Running tiktok-scraper with args:', args);

    await execFileAsync('node', ['cli.js', ...args], {
        cwd: process.cwd(),
        stdio: 'inherit',
    });
});
