# API 文档（本地开发）

> 前后端交互基于 `/api/*` 路径。开发环境通过 Vite `proxy` 转发请求到 `http://localhost:3000`。

## 错误与返回结构

所有接口统一返回：
- 成功：`{ success: true, data: ... }`
- 失败：`{ success: false, error: { code: string, message: string } }`

错误码常见：
- `RATE_LIMIT`：请求过于频繁
- `AI_ERROR`：AI 调用失败
- `NOT_FOUND`：资源不存在（题目不存在）
- `INVALID_INPUT`：输入无效（视后端实现）

---

## GET `/api/test`

- 用途：服务健康检查。
- Response：
```json
{ "success": true, "data": { "message": "ok" } }
```

---

## GET `/api/stories`

- 用途：获取题目预览列表（不含 `bottom` 与 `keyClues`）。
- Response：
```json
{
  "success": true,
  "data": [
    {
      "id": "story-001",
      "title": "海风换回的名字",
      "category": "red",
      "difficulty": "easy",
      "surface": "..."
    }
  ]
}
```

---

## POST `/api/chat`

- 入参：`{ "question": string, "storyId": string }`
- 行为：
  - 后端从 `stories.json` 读取该故事的 `surface/bottom`
  - 组装 System Prompt（含汤底）
  - 调用白山/DeepSeek 聚合接口
  - 过滤 `<think>` 并只返回 `是/否/无关/无法回答`
- Response：
```json
{ "success": true, "data": { "answer": "是", "tip": "..." } }
```

---

## POST `/api/judge`

- 入参：
  - 还原真相：`{ "storyId": string, "answer": string, "action": "judge" }`
  - 放弃本局：`{ "storyId": string, "answer": undefined, "action": "giveup" }`
- 行为：
  - `giveup`：直接返回 `{ result: "revealed", bottom }`
  - `judge`：返回三档 `{ result: "won" | "partial" | "wrong", ... }`
- Response：
```json
// giveup
{ "success": true, "data": { "result": "revealed", "bottom": "..." } }

// judge won
{ "success": true, "data": { "result": "won", "bottom": "..." } }

// judge partial
{ "success": true, "data": { "result": "partial", "missing": 2 } }

// judge wrong
{ "success": true, "data": { "result": "wrong" } }
```

