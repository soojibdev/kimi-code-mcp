import { execSync } from 'child_process'
import { z } from 'zod'
import { runKimi, isKimiInstalled } from '../kimi-runner.js'

export const kimiImplementSchema = {
  task: z.string().describe(
    'What to implement — be specific about target files, expected behavior, and acceptance criteria'
  ),
  work_dir: z.string().describe('Absolute path to the codebase root directory'),
  allow_commit: z.boolean().optional().describe(
    'Allow Kimi to git commit after editing (default: false — file edits only, user reviews and commits)'
  ),
  max_output_tokens: z.number().optional().describe(
    'Max tokens in response (~4 chars/token). Default: 15000.'
  ),
  resume_session: z.string().optional().describe(
    'Resume a previous Kimi session by ID (from kimi_list_sessions)'
  ),
}

const IMPLEMENT_PREFIX = `You are an autonomous coding agent. Implement the requested task by reading and editing files in the working directory.

RULES:
- Read the relevant files before editing them
- Make minimal, focused changes that accomplish the task
- Follow the existing code style and patterns
- Prefer editing existing files over creating new ones`

const NO_COMMIT_SUFFIX = `

IMPORTANT: Do NOT run git add or git commit. Edit files only — the user will review and commit.`

function checkCleanGit(workDir: string): string | null {
  try {
    const status = execSync('git status --porcelain', {
      cwd: workDir,
      encoding: 'utf-8',
      timeout: 5000,
    })
    if (status.trim()) {
      return `Working directory has uncommitted changes:\n${status}\nPlease commit or stash them before running kimi_implement.`
    }
    return null
  } catch {
    return null  // not a git repo or git unavailable — proceed
  }
}

type KimiImplementArgs = {
  task: string
  work_dir: string
  allow_commit?: boolean
  max_output_tokens?: number
  resume_session?: string
}

export async function kimiImplementHandler({
  task,
  work_dir,
  allow_commit = false,
  max_output_tokens,
  resume_session,
}: KimiImplementArgs) {
  if (!isKimiInstalled()) {
    return {
      content: [{ type: 'text' as const, text: 'Error: kimi CLI not installed. Install via: uv tool install kimi-cli' }],
      isError: true,
    }
  }

  const gitError = checkCleanGit(work_dir)
  if (gitError) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${gitError}` }],
      isError: true,
    }
  }

  const prompt = IMPLEMENT_PREFIX + (allow_commit ? '' : NO_COMMIT_SUFFIX) + '\n\n## Task\n\n' + task
  const maxChars = max_output_tokens ? max_output_tokens * 4 : 60_000

  const result = await runKimi({
    prompt,
    workDir: work_dir,
    sessionId: resume_session,
    thinking: true,
    timeoutMs: 600_000,
    maxOutputChars: maxChars,
  })

  if (!result.ok) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${result.error}` }],
      isError: true,
    }
  }

  return { content: [{ type: 'text' as const, text: result.text }] }
}
