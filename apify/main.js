import { Actor } from 'apify';
import { execSync } from 'child_process';

await Actor.init();

const input = await Actor.getInput();

const {
  type,
  query,
  number,
  download,
  filetype,
  sessionFile,
  proxy
} = input;

let command = `node cli.js ${type}`;

if (query) command += ` ${query}`;
if (number) command += ` -n ${number}`;
if (download) command += ` -d`;
if (filetype) command += ` -t ${filetype}`;
if (sessionFile) command += ` --session-file ${sessionFile}`;
if (proxy === 'RESIDENTIAL') {
  command += ` --proxy ${process.env.APIFY_PROXY_URL}`;
}

console.log('Running:', command);

execSync(command, { stdio: 'inherit' });

await Actor.exit();
