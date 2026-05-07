export interface KimiSession {
    sessionId: string;
    title: string;
    workDir: string;
    workDirHash: string;
    lastModified: string;
    archived: boolean;
}
export declare function listSessions(opts?: {
    workDir?: string;
    limit?: number;
}): KimiSession[];
