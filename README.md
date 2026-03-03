# kimi-code-mcp

MCP server that bridges [Kimi Code](https://kimi.ai/) (256K context AI coding assistant) with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and other MCP-compatible clients.

**[中文說明](#中文說明)**

---

## Why?

Claude Code is great at targeted edits and multi-step tasks. Kimi Code excels at reading **entire codebases** (256K context). Together they complement each other:

- Claude Code delegates large-scale analysis to Kimi via MCP tools
- Kimi reads the whole codebase, returns structured insights
- Claude Code acts on those insights with precise edits

## Features

| Tool | Description | Timeout |
|------|-------------|---------|
| `kimi_analyze` | Deep codebase analysis (architecture, audit, refactoring) | 10 min |
| `kimi_query` | Quick programming questions, no codebase context | 2 min |
| `kimi_list_sessions` | List existing Kimi sessions with metadata | instant |
| `kimi_resume` | Resume a previous session (up to 256K token context) | 10 min |

## Prerequisites

1. **Kimi CLI** — install via [uv](https://docs.astral.sh/uv/):
   ```bash
   uv tool install kimi-cli
   ```
2. **Authenticate Kimi**:
   ```bash
   kimi login
   ```
3. **Node.js** >= 18

## Installation

```bash
git clone https://github.com/howardpen9/kimi-code-mcp.git
cd kimi-code-mcp
npm install
npm run build
```

## Usage with Claude Code

Add to your project's `.mcp.json` (or `~/.claude/mcp.json` for global):

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

For development (auto-recompile):

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

### Verify

In Claude Code, run `/mcp` to check the server is connected. You should see `kimi-code` with 4 tools.

## Example Workflows

**Architecture review:**
> "Use kimi_analyze to review the codebase architecture and suggest improvements"

**Cross-file audit:**
> "Ask Kimi to find all API endpoints that lack input validation"

**Resume a session:**
> "List Kimi sessions for this project, then resume the last one to ask about the auth flow"

## How It Works

```
┌──────────────┐  stdio/MCP   ┌──────────────┐  subprocess   ┌──────────┐
│  Claude Code │ ◄──────────► │ kimi-code-mcp│ ──────────── │ kimi CLI │
│  (MCP client)│              │ (MCP server) │              │ (256K AI)│
└──────────────┘              └──────────────┘              └──────────┘
```

1. Claude Code calls an MCP tool (e.g., `kimi_analyze`)
2. This server spawns the `kimi` CLI with the prompt and codebase path
3. Kimi autonomously reads files, analyzes the code (up to 256K tokens)
4. The result is parsed from Kimi's JSON output and returned to Claude Code

## Project Structure

```
src/
├── index.ts           # MCP server setup, tool definitions
├── kimi-runner.ts     # Spawns kimi CLI, parses output, handles timeouts
└── session-reader.ts  # Reads Kimi session metadata from ~/.kimi/
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

---

# 中文說明

## 簡介

`kimi-code-mcp` 是一個 [MCP](https://modelcontextprotocol.io/) 伺服器，將 [Kimi Code](https://kimi.ai/)（256K 上下文 AI 編碼助手）與 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 串接。

## 為什麼需要？

Claude Code 擅長精準編輯和多步驟任務。Kimi Code 擅長**通讀整個程式碼庫**（256K 上下文）。兩者互補：

- Claude Code 透過 MCP 工具把大規模分析委派給 Kimi
- Kimi 讀完整個 codebase，回傳結構化洞察
- Claude Code 根據洞察精準修改程式碼

## 功能

| 工具 | 說明 | 超時 |
|------|------|------|
| `kimi_analyze` | 深度程式碼分析（架構、審計、重構建議） | 10 分鐘 |
| `kimi_query` | 快速問答，不需要 codebase 上下文 | 2 分鐘 |
| `kimi_list_sessions` | 列出現有的 Kimi 分析 session | 即時 |
| `kimi_resume` | 恢復之前的 session（保留最多 256K token 上下文） | 10 分鐘 |

## 前置需求

1. **Kimi CLI**：`uv tool install kimi-cli`
2. **登入 Kimi**：`kimi login`
3. **Node.js** >= 18

## 安裝

```bash
git clone https://github.com/howardpen9/kimi-code-mcp.git
cd kimi-code-mcp
npm install
npm run build
```

## 配置 Claude Code

在專案的 `.mcp.json`（或 `~/.claude/mcp.json` 全域設定）加入：

```json
{
  "mcpServers": {
    "kimi-code": {
      "command": "node",
      "args": ["/你的路徑/kimi-code-mcp/dist/index.js"]
    }
  }
}
```

## 使用範例

- 「用 kimi_analyze 分析這個 codebase 的架構」
- 「請 Kimi 找出所有缺少輸入驗證的 API 端點」
- 「列出這個專案的 Kimi sessions，然後恢復上一次的分析」

## 貢獻

請參閱 [CONTRIBUTING.md](CONTRIBUTING.md)。
