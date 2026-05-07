import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../kimi-runner.js', () => ({
  isKimiInstalled: vi.fn(),
  runKimi: vi.fn(),
}))

vi.mock('child_process', () => ({
  execSync: vi.fn(() => ''),
}))

import { kimiImplementHandler } from './kimi-implement.js'
import { isKimiInstalled, runKimi } from '../kimi-runner.js'
import { execSync } from 'child_process'

describe('kimiImplementHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isKimiInstalled).mockReturnValue(true)
    vi.mocked(execSync).mockReturnValue('' as any)
    vi.mocked(runKimi).mockResolvedValue({ ok: true, text: 'Done', sessionId: undefined })
  })

  it('returns error when kimi not installed', async () => {
    vi.mocked(isKimiInstalled).mockReturnValue(false)
    const result = await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp' })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('not installed')
  })

  it('returns error when git status is dirty', async () => {
    vi.mocked(execSync).mockReturnValue(' M src/index.ts\n' as any)
    const result = await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp/repo' })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('uncommitted changes')
  })

  it('includes no-commit instruction when allow_commit is false (default)', async () => {
    await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp/repo' })
    const prompt = vi.mocked(runKimi).mock.calls[0][0].prompt
    expect(prompt).toContain('Do NOT run git')
  })

  it('omits no-commit instruction when allow_commit is true', async () => {
    await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp/repo', allow_commit: true })
    const prompt = vi.mocked(runKimi).mock.calls[0][0].prompt
    expect(prompt).not.toContain('Do NOT run git')
  })

  it('passes work_dir and resume_session to runKimi', async () => {
    await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp/repo', resume_session: 'abc-123' })
    const config = vi.mocked(runKimi).mock.calls[0][0]
    expect(config.workDir).toBe('/tmp/repo')
    expect(config.sessionId).toBe('abc-123')
  })

  it('returns error when runKimi fails', async () => {
    vi.mocked(runKimi).mockResolvedValue({ ok: false, text: '', error: 'timeout' })
    const result = await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp/repo' })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('timeout')
  })

  it('returns text on success', async () => {
    vi.mocked(runKimi).mockResolvedValue({ ok: true, text: 'hello() added', sessionId: undefined })
    const result = await kimiImplementHandler({ task: 'add hello()', work_dir: '/tmp/repo' })
    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toBe('hello() added')
  })
})
