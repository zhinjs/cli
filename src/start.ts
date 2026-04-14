import {CAC} from "cac";
import {spawn} from "child_process";
import * as path from "path";
import * as fs from "fs";

/**
 * Parse .env files and return key-value pairs.
 * Supports: KEY=value, KEY = 'value', KEY = "value", # comments
 */
function loadDotEnv(cwd: string): Record<string, string> {
    const envFiles = ['.env.local', `.env.${process.env.NODE_ENV || 'development'}`, '.env'];
    const result: Record<string, string> = {};
    for (const file of envFiles) {
        const fullPath = path.join(cwd, file);
        if (!fs.existsSync(fullPath)) continue;
        const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            let value = trimmed.slice(eqIdx + 1).trim();
            // Strip surrounding quotes
            if ((value.startsWith("'") && value.endsWith("'")) ||
                (value.startsWith('"') && value.endsWith('"'))) {
                value = value.slice(1, -1);
            }
            // Don't override already-set env vars (matches dotenv convention)
            if (!(key in result)) result[key] = value;
        }
    }
    return result;
}

/**
 * Resolve the compiled entry for `zhin.js/setup` (lib/setup.js).
 */
function resolveSetupEntry(): string {
    try {
        return require.resolve('zhin.js/setup', { paths: [process.cwd()] });
    } catch {
        return path.join(process.cwd(), 'node_modules', 'zhin.js', 'lib', 'setup.js');
    }
}

/**
 * Resolve the TypeScript source entry for `zhin.js/setup` (src/setup.ts).
 */
function resolveSetupSource(): string {
    const libEntry = resolveSetupEntry();
    // lib/setup.js → src/setup.ts
    return libEntry.replace(/lib[/\\]setup\.js$/, path.join('src', 'setup.ts'));
}

/**
 * Find `tsx` binary: prefer local node_modules/.bin, then global.
 */
function findTsx(): string {
    try {
        const localBin = path.join(process.cwd(), 'node_modules', '.bin', 'tsx');
        require('fs').accessSync(localBin, require('fs').constants.X_OK);
        return localBin;
    } catch {
        return 'tsx';
    }
}

function launchDev(): void {
    const entry = resolveSetupSource();
    const tsx = findTsx();
    const dotEnv = loadDotEnv(process.cwd());
    const env = { ...dotEnv, ...process.env, NODE_ENV: process.env.NODE_ENV || 'development', ZHIN_DEV: '1' };
    const cp = spawn(tsx, [entry], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env,
    });
    cp.on('close', code => process.exit(code ?? 0));
}

function launchStart(daemon: boolean): void {
    const entry = resolveSetupEntry();
    const args: string[] = ['--enable-source-maps', '--input-type=module', '-e', `import ${JSON.stringify('file://' + entry)}`];
    const dotEnv = loadDotEnv(process.cwd());
    const env = { ...dotEnv, ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' };
    const cp = spawn(process.execPath, args, {
        stdio: daemon ? 'ignore' : 'inherit',
        cwd: process.cwd(),
        env,
        detached: daemon,
    });
    if (daemon) {
        cp.unref();
        console.log(`Zhin started in daemon mode (pid: ${cp.pid})`);
        process.exit(0);
    }
    cp.on('close', code => process.exit(code ?? 0));
}

export default function registerStartCommand(cli: CAC) {
    cli.command('start', '生产模式启动')
        .option('--daemon', '后台守护进程模式')
        .action(async (options) => {
            launchStart(!!options?.daemon);
        });

    cli.command('dev', '开发模式启动（支持热重载）')
        .action(async () => {
            launchDev();
        });
}
