import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath;

function run(args, cwd = root) {
   const command = npmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm');
   const commandArgs = npmCli ? [npmCli, ...args] : args;
   const result = spawnSync(command, commandArgs, { cwd, stdio: 'inherit' });
   if (result.error) {
      console.error(result.error.message);
   }
   if (result.status !== 0) process.exit(result.status ?? 1);
}

const backend = path.join(root, 'backend');
const frontend = path.join(root, 'frontend');
const envFile = path.join(backend, '.env');

if (!existsSync(envFile)) {
   copyFileSync(path.join(backend, '.env.example'), envFile);
   console.log('Created backend/.env from .env.example');
}

run(['install']);
run(['install'], backend);

run(['run', 'db:generate'], backend);
run(['run', 'db:deploy'], backend);
run(['run', 'db:seed'], backend);
run(['install'], frontend);
