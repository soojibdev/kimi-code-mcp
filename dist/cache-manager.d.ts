/**
 * Cache Manager for Kimi Code MCP
 *
 * Phase 1 Implementation: Basic Session Caching
 * - Caches Kimi sessions per working directory
 * - Reuses sessions for subsequent queries to reduce latency and cost
 * - Auto-expires caches after configured timeout
 * - Detects file changes via git commit hash or mtime
 */
/** Configuration options for CacheManager */
export interface CacheManagerConfig {
    /** Maximum number of cached sessions to keep in memory (default: 10) */
    maxSize?: number;
    /** Session TTL in milliseconds (default: 30 minutes) */
    maxAgeMs?: number;
    /** Enable debug logging (default: false) */
    debug?: boolean;
}
/** Represents a cached Kimi session */
export interface CacheEntry {
    /** Kimi session ID (UUID) */
    sessionId: string;
    /** Absolute path to working directory */
    workDir: string;
    /** Hash representing codebase state when cached */
    codebaseHash: string;
    /** When this cache entry was created */
    createdAt: number;
    /** Last time this cache was accessed */
    lastUsedAt: number;
    /** Number of times this cache has been hit */
    hitCount: number;
    /** Whether this cache is currently being warmed up */
    isWarming: boolean;
}
/** Statistics for monitoring cache performance */
export interface CacheStats {
    totalEntries: number;
    totalHits: number;
    totalMisses: number;
    totalEvictions: number;
    averageHitLatency: number;
    averageMissLatency: number;
}
/** Result of cache get operation */
export interface CacheGetResult {
    /** Whether cache was hit */
    hit: boolean;
    /** Session ID if hit, undefined if miss */
    sessionId?: string;
    /** Time taken to resolve in ms */
    resolveTimeMs: number;
}
export declare class CacheManager {
    private cache;
    private maxSize;
    private maxAgeMs;
    private debug;
    private stats;
    constructor(config?: CacheManagerConfig);
    private log;
    /**
     * Get or create a cached session for the given working directory.
     *
     * Flow:
     * 1. Check if valid cache exists (not expired, files unchanged)
     * 2. If hit: update lastUsedAt, increment hitCount, return sessionId
     * 3. If miss: create new session via cache warming, store in cache
     *
     * @param workDir - Absolute path to codebase directory
     * @param warmupOptions - Options for cache warming if miss
     * @returns Promise resolving to CacheGetResult
     */
    getOrCreateSession(workDir: string, warmupOptions?: {
        timeoutMs?: number;
        thinking?: boolean;
    }): Promise<CacheGetResult>;
    /**
     * Check if a cache entry is still valid.
     * Valid means: not expired AND codebase hasn't changed
     */
    private isValid;
    /**
     * Warm up cache by creating a new Kimi session.
     * This reads the codebase into Kimi's 256K context for reuse.
     */
    private warmupCache;
    /**
     * Extract session ID from Kimi's output.
     * The session ID is typically in the JSON response or can be parsed from logs.
     */
    private extractSessionId;
    /**
     * Compute a hash representing the current state of the codebase.
     * Uses git commit hash if available, otherwise falls back to file mtimes.
     */
    private computeCodebaseHash;
    /**
     * Get key files for hashing (config files, main source files)
     */
    private getKeyFiles;
    /**
     * Wait for an in-progress cache warmup to complete.
     */
    private waitForWarmup;
    private sleep;
    /**
     * Evict oldest entries if cache exceeds max size.
     * Uses LRU (Least Recently Used) eviction policy.
     */
    private evictIfNeeded;
    /**
     * Manually invalidate a cache entry.
     */
    invalidate(workDir: string): boolean;
    /**
     * Invalidate all cache entries.
     */
    invalidateAll(): number;
    /**
     * Get current cache statistics.
     */
    getStats(): CacheStats;
    /**
     * List all current cache entries (for debugging).
     */
    listEntries(): Array<Pick<CacheEntry, 'workDir' | 'sessionId' | 'hitCount' | 'lastUsedAt'>>;
    /**
     * Normalize path for consistent cache key usage.
     */
    private normalizePath;
}
export declare function getGlobalCacheManager(config?: CacheManagerConfig): CacheManager;
export declare function resetGlobalCacheManager(): void;
