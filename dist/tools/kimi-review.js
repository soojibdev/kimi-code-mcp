import { z } from 'zod';
import { runKimi, isKimiInstalled } from '../kimi-runner.js';
export const kimiReviewSchema = {
    scope: z.string().describe('What to review — file path, directory, or description (e.g. "src/auth/", "the payment flow")'),
    work_dir: z.string().describe('Absolute path to the codebase root directory'),
    focus: z.enum(['security', 'performance', 'maintainability', 'all']).default('all')
        .describe('Review focus area (default: all)'),
    detail_level: z.enum(['summary', 'normal', 'detailed']).default('normal')
        .describe('Output verbosity: summary ~2K tokens, normal ~5K tokens (default), detailed ~15K tokens'),
};
const REVIEW_PREFIX = `You are an expert code reviewer. Review the specified scope and provide structured findings.

RULES:
- Read files but do NOT edit them
- Be specific: reference file paths and line numbers where relevant
- Prioritise actionable, high-signal findings over style nitpicks`;
const FOCUS_INSTRUCTIONS = {
    security: '\nFOCUS: Security vulnerabilities, injection risks, authentication flaws, data exposure, insecure defaults.',
    performance: '\nFOCUS: Performance bottlenecks, inefficient algorithms, memory leaks, N+1 queries, unnecessary blocking.',
    maintainability: '\nFOCUS: Code clarity, coupling, DRY violations, poor naming, missing tests, documentation gaps.',
    all: '\nFOCUS: Security, performance, and maintainability — balance coverage across all three.',
};
const DETAIL_FORMATS = {
    summary: '\nOUTPUT: Maximum ~2000 words. Bullet points only. No code snippets.',
    normal: '\nOUTPUT: Maximum ~5000 words. Use sections. Include file:line references.',
    detailed: '\nOUTPUT: Maximum ~15000 words. Include relevant code snippets (under 30 lines each).',
};
const OUTPUT_STRUCTURE = `

STRUCTURE YOUR RESPONSE AS:
### Strengths
### Issues
#### Critical (Must Fix)
#### Important (Should Fix)
#### Minor (Nice to Have)
### Recommendations`;
const MAX_CHARS_BY_DETAIL = {
    summary: 8_000,
    normal: 20_000,
    detailed: 60_000,
};
export async function kimiReviewHandler({ scope, work_dir, focus = 'all', detail_level = 'normal', }) {
    if (!isKimiInstalled()) {
        return {
            content: [{ type: 'text', text: 'Error: kimi CLI not installed. Install via: uv tool install kimi-cli' }],
            isError: true,
        };
    }
    const prompt = REVIEW_PREFIX
        + FOCUS_INSTRUCTIONS[focus]
        + DETAIL_FORMATS[detail_level]
        + OUTPUT_STRUCTURE
        + '\n\n## Scope\n\n' + scope;
    const result = await runKimi({
        prompt,
        workDir: work_dir,
        thinking: false,
        timeoutMs: 300_000,
        maxOutputChars: MAX_CHARS_BY_DETAIL[detail_level],
    });
    if (!result.ok) {
        return {
            content: [{ type: 'text', text: `Error: ${result.error}` }],
            isError: true,
        };
    }
    return { content: [{ type: 'text', text: result.text }] };
}
