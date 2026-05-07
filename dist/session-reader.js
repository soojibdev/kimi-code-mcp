import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
const KIMI_DIR = path.join(os.homedir(), '.kimi');
const SESSIONS_DIR = path.join(KIMI_DIR, 'sessions');
const KIMI_JSON = path.join(KIMI_DIR, 'kimi.json');
/** Build hash → workDir mapping from kimi.json */
function buildWorkDirMap() {
    const map = new Map();
    try {
        const raw = fs.readFileSync(KIMI_JSON, 'utf-8');
        const data = JSON.parse(raw);
        for (const wd of data.work_dirs || []) {
            const hash = crypto.createHash('md5').update(wd.path).digest('hex');
            map.set(hash, wd.path);
        }
    }
    catch { /* kimi.json not found or invalid */ }
    return map;
}
export function listSessions(opts) {
    const limit = opts?.limit ?? 20;
    const workDirMap = buildWorkDirMap();
    const sessions = [];
    // Optionally filter by workDir hash
    let targetHash;
    if (opts?.workDir) {
        targetHash = crypto.createHash('md5').update(opts.workDir).digest('hex');
    }
    let hashDirs;
    try {
        hashDirs = fs.readdirSync(SESSIONS_DIR);
    }
    catch {
        return [];
    }
    for (const hashDir of hashDirs) {
        if (targetHash && hashDir !== targetHash)
            continue;
        const hashPath = path.join(SESSIONS_DIR, hashDir);
        if (!fs.statSync(hashPath).isDirectory())
            continue;
        const workDir = workDirMap.get(hashDir) || `(unknown: ${hashDir})`;
        let sessionDirs;
        try {
            sessionDirs = fs.readdirSync(hashPath);
        }
        catch {
            continue;
        }
        for (const sessionDir of sessionDirs) {
            const metaPath = path.join(hashPath, sessionDir, 'metadata.json');
            try {
                const raw = fs.readFileSync(metaPath, 'utf-8');
                const meta = JSON.parse(raw);
                if (meta.archived)
                    continue;
                sessions.push({
                    sessionId: meta.session_id,
                    title: meta.title || '(untitled)',
                    workDir,
                    workDirHash: hashDir,
                    lastModified: new Date(meta.wire_mtime * 1000).toISOString(),
                    archived: meta.archived,
                });
            }
            catch { /* skip invalid sessions */ }
        }
    }
    // Sort by last modified descending
    sessions.sort((a, b) => b.lastModified.localeCompare(a.lastModified));
    return sessions.slice(0, limit);
}
