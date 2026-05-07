/** Configuration for running a Kimi CLI session */
export interface KimiRunConfig {
    /** The analysis prompt to send to Kimi */
    prompt: string;
    /** Absolute path to the codebase root directory */
    workDir?: string;
    /** Resume a specific session by ID */
    sessionId?: string;
    /** Enable thinking mode for deeper analysis */
    thinking?: boolean;
    /** Timeout in milliseconds (default: 600000) */
    timeoutMs?: number;
    /** Maximum characters in output. Truncated at clean boundary if exceeded. Default: 60000 (~15K tokens) */
    maxOutputChars?: number;
}
export interface KimiResult {
    ok: boolean;
    text: string;
    thinking?: string;
    error?: string;
    /** Session ID if available (for caching) */
    sessionId?: string;
}
export declare function isKimiInstalled(): boolean;
export interface KimiStatus {
    installed: boolean;
    binPath: string;
    version?: string;
    authenticated?: boolean;
    error?: string;
}
export declare function getKimiStatus(): Promise<KimiStatus>;
/**
 * Extract session ID from Kimi's stderr output.
 * Kimi outputs session info to stderr in formats like:
 * - "Session ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 * - "session_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 */
export declare function extractSessionId(stderr: string): string | undefined;
/**
 * Parse Kimi's stream-json output with --final-message-only.
 * The output is one JSON line: {"role":"assistant","content":...}
 * content can be a string or an array of {type, text/think} objects.
 */
export declare function parseKimiOutput(raw: string): {
    text: string;
    thinking?: string;
};
/**
 * Truncate text at a clean markdown boundary (section header or paragraph break)
 * to avoid cutting mid-sentence. Appends a notice directing to kimi_resume.
 */
export declare function truncateAtBoundary(text: string, maxChars: number): string;
export declare function runKimi(config: KimiRunConfig): Promise<KimiResult>;
