# kimi-code-mcp

English | **[中文說明](README_zh.md)**

---

MCP server that connects [Kimi Code](https://www.kimi.com/code) (K2.5, 256K context) with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — letting Claude orchestrate while Kimi handles the heavy reading.

<div align="center">
  <img src="assets/llm-cost-vs-intelligence.png" alt="LLM Cost vs Intelligence — Kimi K2.5 delivers frontier-level intelligence at a fraction of the cost" width="720" />
  <br />
  <sub>Kimi K2.5 sits on the efficiency frontier — near-Claude intelligence at 10x lower cost. <a href="https://www.kimi.com/code">kimi.com/code</a></sub>
</div>

> [!TIP]
> **Stop paying Claude to read files.** Kimi K2.5 delivers frontier-class code intelligence at a fraction of the cost (see chart above). Delegate bulk codebase scanning to Kimi (256K context, near-zero cost) and let Claude focus on what it does best — reasoning, decisions, and precise code edits. One `kimi_analyze` call can replace 50+ file reads.

## What is Kimi Code?

[**Kimi Code**](https://www.kimi.com/code/en) is an AI code agent by Moonshot AI, powered by the **Kimi K2.5** model (1T MoE, 256K context). It works across Terminal, IDE, and CLI — writing, debugging, refactoring, and analyzing code autonomously.

Key specs:
- **256K token context** — reads entire codebases in one pass
- **Parallel agent spawning** — handles concurrent tasks
- **Shell, file, and web access** — full developer toolchain
- **Install**: `curl -L code.kimi.com/install.sh | bash`

> [!WARNING]
> **Kimi Code membership required.** This MCP server calls the Kimi CLI under the hood, which requires an active [Kimi Code plan](https://www.kimi.com/code/en). Make sure you have a valid subscription and have run `kimi login` before use.
>
> | Plan | Price | Notes |
> |------|-------|-------|
> | **Moderato** | **$0** (7-day free trial) | Then $19/mo. Good for trying it out |
> | **Allegretto** | $39/mo | Recommended — higher weekly quota + concurrency |
> | **Allegro** | $99/mo | For daily, heavy-duty development |
> | **Vivace** | $199/mo | Max quota for large codebases |
>
> Annual billing saves up to $480. All plans include [Kimi membership benefits](https://www.kimi.com/code/en).

## Quick Start

```bash
# 1. Install Kimi CLI and log in
curl -L code.kimi.com/install.sh | bash
kimi login

# 2. Install via npm
npm install -g kimi-mcp-server
```

Add to `.mcp.json` (project-level or `~/.claude/mcp.json` for global):

```json
{
  "mcpServers": {
    "kimi-code": {
      "command": "npx",
      "args": ["-y", "kimi-mcp-server"]
    }
  }
}
```

Or build from source:

```bash
git clone https://github.com/howardpen9/kimi-code-mcp.git
cd kimi-code-mcp && npm install && npm run build
```

```json
{
  "mcpServers": {
    "kimi-code": {
      "command": "node",
      "args": ["/absolute/path/to/kimi-code-mcp/dist/index.js"]
    }
  }
}
```

Run `/mcp` in Claude Code to verify — you should see `kimi-code` with 7 tools.

## Kimi Code API Setup

> [!NOTE]
> **Kimi Code API and Moonshot API are separate providers** — their API keys are not interchangeable.

There are two ways to configure the Kimi Code API for the CLI:

### Option 1: OAuth Login (Recommended)

In the Kimi Code CLI shell, run:

```bash
kimi
```

Then use the `/login` (or `/setup`) command:

```
/login
```

1. Select **Kimi Code** as the platform
2. Your browser opens for OAuth authorization
3. Config is saved automatically to `~/.kimi/config.toml`

### Option 2: Manual API Key Configuration

#### Get your API Key

1. Visit [code.kimi.com](https://code.kimi.com)
2. Sign in → **Settings** → **API Keys**
3. Create a new key (starts with `sk-`, shown only once)

#### Edit config file

```bash
nano ~/.kimi/config.toml
```

Add:

```toml
[providers.kimi-code]
type = "kimi"
base_url = "https://api.kimi.com/coding/v1"
api_key = "sk-your-api-key"

[models.kimi-for-coding]
provider = "kimi-code"
model = "kimi-for-coding"
max_context_size = 262144
capabilities = ["thinking"]

[defaults]
model = "kimi-for-coding"
```

#### Using environment variables (recommended for security)

```bash
# Add to ~/.zshrc (macOS) or ~/.bashrc (Linux)
export KIMICODE_API_KEY="sk-your-api-key"
```

Then reference it in `config.toml`:

```toml
[providers.kimi-code]
type = "kimi"
base_url = "https://api.kimi.com/coding/v1"
api_key = "${KIMICODE_API_KEY}"
```

### Multi-provider config example

You can configure both Kimi Code and Moonshot side by side:

```toml
[providers.kimi-code]
type = "kimi"
base_url = "https://api.kimi.com/coding/v1"
api_key = "${KIMICODE_API_KEY}"

[providers.moonshot-cn]
type = "kimi"
base_url = "https://api.moonshot.cn/v1"
api_key = "${MOONSHOT_API_KEY}"

[models.kimi-for-coding]
provider = "kimi-code"
model = "kimi-for-coding"
max_context_size = 262144
capabilities = ["thinking"]

[models.kimi-k2]
provider = "moonshot-cn"
model = "kimi-k2-0905-preview"
max_context_size = 256000
capabilities = ["thinking"]

[defaults]
model = "kimi-for-coding"
```

Switch models at any time with `/model` or `/model kimi-k2` in the CLI.

### Kimi Code vs Moonshot

| Feature | Kimi Code | Moonshot |
|---------|-----------|----------|
| Focus | Optimized for coding | General-purpose chat |
| Endpoint | `api.kimi.com/coding/v1` | `api.moonshot.cn/v1` |
| API Key | Separate — apply at [code.kimi.com](https://code.kimi.com) | Separate |
| SearchWeb / FetchURL | Built-in | Not available |
| Context | 262K | 256K |

## What You Can Do

Just tell Claude what you need. It will delegate to Kimi automatically:

| Prompt | What happens |
|--------|-------------|
| "Analyze this codebase's architecture" | Kimi reads all files (256K ctx), Claude acts on the report |
| "Scan for security vulnerabilities, then review Kimi's findings" | Kimi audits, Claude cross-examines — AI pair review |
| "Map all dependencies of the auth module, then plan the refactoring" | Kimi builds the dependency graph, Claude plans the changes |
| "Review the recent changes for regressions and edge cases" | Kimi reviews full context (not just the diff), Claude synthesizes |
| "Resume the last Kimi session and ask about the API design" | Kimi retains 256K tokens of context across sessions |

## Why This Exists

Claude Code is powerful but expensive. Every file it reads costs tokens. Meanwhile, many tasks — pre-reviewing large codebases, scanning for patterns, generating audit reports — are **high-certainty work** that doesn't need Claude's full reasoning power.

> [!IMPORTANT]
> **The cost equation:** Claude reads 50 files to understand your architecture = expensive. Kimi reads 50 files via `kimi_analyze` = near-zero cost. Claude then acts on Kimi's structured report = minimal tokens. **Total savings: 60-80% fewer Claude tokens on analysis-heavy tasks.**

### How It Saves Tokens

```
                          ┌─────────────────────────────┐
                          │   You (the developer)       │
                          └──────────┬──────────────────┘
                                     │ prompt
                                     ▼
                          ┌─────────────────────────────┐
                          │   Claude Code (conductor)   │
                          │   - orchestrates workflow    │
                          │   - makes decisions          │
                          │   - writes & edits code      │
                          └──────┬──────────────┬───────┘
                      precise    │              │  delegate
                      edits      │              │  bulk reading
                      (tokens)   │              │  (FREE)
                                 ▼              ▼
                          ┌──────────┐   ┌──────────────┐
                          │ your     │   │  Kimi Code   │
                          │ codebase │   │  (K2.5)      │
                          └──────────┘   │  - 256K ctx  │
                                         │  - reads all │
                                         │  - reports   │
                                         └──────────────┘
```

1. **Claude** receives your task → decides it needs codebase understanding
2. **Claude** calls `kimi_analyze` via MCP → Kimi reads the entire codebase (256K context, near-zero cost)
3. **Kimi** returns a structured analysis
4. **Claude** acts on the analysis with precise, targeted edits

**Result: Claude only spends tokens on decision-making and code writing, not on reading files.**

### Mutual Code Review with K2.5

Kimi Code is powered by K2.5 — a 1T MoE model designed for deep code comprehension. This enables **AI pair review**:

1. **Kimi pre-reviews** — 256K context means it sees the entire codebase at once: security issues, anti-patterns, dead code, architectural problems
2. **Claude cross-examines** — reviews Kimi's findings, challenges questionable items, adds its own insights
3. **Two perspectives** — different models catch different things. What one misses, the other finds

## Use Kimi as a Code Reviewer

Beyond ad-hoc analysis, you can use Kimi as a **dedicated reviewer** in your workflow:

### PR Review Workflow

```
┌──────────────┐   diff    ┌──────────────┐  structured  ┌──────────────┐
│   Your PR    │ ────────► │  Kimi Code   │  findings    │  Claude Code │
│  (changes)   │           │  (reviewer)  │ ────────────►│  (decision)  │
└──────────────┘           └──────────────┘              └──────────────┘
```

### Continuous Audit Pattern

| When | What | Why |
|------|------|-----|
| Before merging | Kimi scans diff + affected modules | Catch regressions early |
| Weekly | Full codebase sweep | Accumulated tech debt |
| Pre-release | Security-focused audit | Ship with confidence |

Each review session can be **resumed** (`kimi_resume`) — Kimi retains up to 256K tokens of context from previous sessions, building understanding over time.

### What Kimi Reviews Well

| Review Type | Why Kimi Excels |
|-------------|----------------|
| Security audit | 256K context sees full attack surface, not just isolated files |
| Dead code detection | Can trace imports/exports across entire codebase |
| API consistency | Compares patterns across all endpoints simultaneously |
| Dependency analysis | Maps full dependency graph in one pass |
| Architecture review | Sees the forest and the trees at the same time |

## Tools

| Tool | Description | Timeout |
|------|-------------|---------|
| `kimi_analyze` | Deep codebase analysis (architecture, audit, refactoring) | 10 min |
| `kimi_query` | Quick programming questions, no codebase context | 2 min |
| `kimi_list_sessions` | List existing Kimi sessions with metadata | instant |
| `kimi_resume` | Resume a previous session (up to 256K token context) | 10 min |
| `kimi_status` | Check CLI installation, version, and authentication status | instant |
| `kimi_cache_status` | View session cache statistics and performance metrics | instant |
| `kimi_cache_invalidate` | Manually invalidate cached sessions (by dir or all) | instant |

### Output Control Parameters

`kimi_analyze` and `kimi_resume` support these parameters to control output size:

| Parameter | Values | Default | Effect |
|-----------|--------|---------|--------|
| `detail_level` | `summary` / `normal` / `detailed` | `normal` | Controls prompt-side verbosity instructions |
| `max_output_tokens` | number | `15000` | Hard ceiling — output truncated at clean boundary if exceeded |
| `include_thinking` | boolean | `false` | Include Kimi's internal reasoning chain (10-30K extra tokens) |

`kimi_query` also supports `max_output_tokens` and `include_thinking`.

## Token Economics

> [!NOTE]
> The savings come from **compression ratio**, not from free reading. Kimi's subscription cost still applies, but the key benefit is reducing expensive Claude Code token consumption.

```
                    Without kimi-code-mcp        With kimi-code-mcp (normal)
                    ─────────────────────        ───────────────────────────
Raw source:         50 files × ~4K = 200K        Kimi reads (subscription cost)
Claude reads:       200K tokens                  5-15K token report
Claude token cost:  $$$                          $
```

**Compression ratio by `detail_level`:**

| Level | Compression | Output Size | Equivalent Source | Best For |
|-------|------------|-------------|-------------------|----------|
| `summary` | 40-100x | ~2-5K tokens | ~8-20K chars / ~200-500 lines of code | Quick orientation, file inventory |
| `normal` | 15-40x | ~5-15K tokens | ~20-60K chars / ~500-1500 lines of code | Architecture review, dependency mapping |
| `detailed` | 5-15x | ~15-40K tokens | ~60-160K chars / ~1500-4000 lines of code | Security audit with code snippets |

**When savings happen:**
- Large codebases (50+ files) — architecture understanding, cross-file scanning
- Security audits, dead code detection, API consistency checks
- Pre-review before targeted edits (scan first → edit specific files)

**When to skip and let Claude read directly:**
- Small codebases (<10 files) — direct reading is faster
- Single-file modifications — Claude's built-in file reading is sufficient
- When you need every line of code — `detailed` output approaches raw reading cost

## How It Works

```
┌──────────────┐  stdio/MCP   ┌──────────────┐  subprocess   ┌──────────────┐
│  Claude Code │ ◄──────────► │ kimi-code-mcp│ ────────────► │ Kimi CLI     │
│  (conductor) │              │ (MCP server) │               │ (K2.5, 256K) │
└──────────────┘              └──────────────┘               └──────────────┘
```

1. Claude Code calls an MCP tool (e.g., `kimi_analyze`)
2. This server spawns the `kimi` CLI with the prompt and codebase path
3. Kimi autonomously reads files, analyzes the code (up to 256K tokens)
4. The result is parsed from Kimi's JSON output and returned to Claude Code
5. Claude acts on the structured results — edits, plans, or further analysis

### CLI Invocation Reference

The MCP server calls the Kimi CLI in non-interactive (print) mode:

```bash
kimi --work-dir <path> --print -p "<prompt>"
```

| Flag | Purpose |
|------|---------|
| `--print` | Non-interactive mode — outputs result and exits (required for subprocess use) |
| `-p` / `--prompt` | Pass prompt directly (bypasses interactive shell) |
| `--work-dir` / `-w` | Set codebase root directory |
| `-S <id>` | Resume a specific session by ID |
| `--no-thinking` | Disable thinking mode |

> [!NOTE]
> There is no `kimi analyze` subcommand. The MCP tool is named `kimi_analyze`, but the underlying CLI uses the flags above. Use this syntax to call Kimi directly for debugging or scripting.

## Advanced Setup

For development (auto-recompile on changes):

```json
{
  "mcpServers": {
    "kimi-code": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/kimi-code-mcp/src/index.ts"]
    }
  }
}
```

## npm

Published as [`kimi-mcp-server`](https://www.npmjs.com/package/kimi-mcp-server) on npm.

```bash
npx kimi-mcp-server          # run directly
npm install -g kimi-mcp-server # install globally
```

## Project Structure

```
src/
├── index.ts           # MCP server setup, tool definitions
├── kimi-runner.ts     # Spawns kimi CLI, parses output, handles timeouts
└── session-reader.ts  # Reads Kimi session metadata from ~/.kimi/
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
