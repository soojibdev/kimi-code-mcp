import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../kimi-runner.js', () => ({
  isKimiInstalled: vi.fn(),
  runKimi: vi.fn(),
}))

import { kimiReviewHandler } from './kimi-review.js'
import { isKimiInstalled, runKimi } from '../kimi-runner.js'

describe('kimiReviewHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isKimiInstalled).mockReturnValue(true)
    vi.mocked(runKimi).mockResolvedValue({ ok: true, text: '### Strengths\n- Good code', sessionId: undefined })
  })

  it('returns error when kimi not installed', async () => {
    vi.mocked(isKimiInstalled).mockReturnValue(false)
    const result = await kimiReviewHandler({ scope: 'src/', work_dir: '/tmp/repo' })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('not installed')
  })

  it('includes read-only instruction in prompt', async () => {
    await kimiReviewHandler({ scope: 'src/', work_dir: '/tmp/repo' })
    const prompt = vi.mocked(runKimi).mock.calls[0][0].prompt
    expect(prompt).toContain('do NOT edit')
  })

  it('includes security focus when focus=security', async () => {
    await kimiReviewHandler({ scope: 'src/', work_dir: '/tmp/repo', focus: 'security' })
    const prompt = vi.mocked(runKimi).mock.calls[0][0].prompt
    expect(prompt.toLowerCase()).toContain('security')
  })

  it('passes work_dir to runKimi', async () => {
    await kimiReviewHandler({ scope: 'src/', work_dir: '/tmp/repo' })
    expect(vi.mocked(runKimi).mock.calls[0][0].workDir).toBe('/tmp/repo')
  })

  it('returns error when runKimi fails', async () => {
    vi.mocked(runKimi).mockResolvedValue({ ok: false, text: '', error: 'auth failed' })
    const result = await kimiReviewHandler({ scope: 'src/', work_dir: '/tmp/repo' })
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('auth failed')
  })

  it('returns text on success', async () => {
    const result = await kimiReviewHandler({ scope: 'src/', work_dir: '/tmp/repo' })
    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('Strengths')
  })
})
