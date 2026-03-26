# TECH_DESIGN · AI海龟汤游戏

---

## 一、技术栈

### 前端
| 技术 | 版本 | 用途 | 选择原因 |
|---|---|---|---|
| React | 18 | 界面框架 | 组件化适合聊天界面，生态成熟 |
| TypeScript | 5 | 类型系统 | 提前发现类型错误，和PRD数据结构直接对应 |
| Vite | 5 | 构建工具 | 启动速度快，配置简单 |
| Tailwind CSS | 3 | 样式 | 无需写CSS文件，和PRD设计规范直接对应 |
| React Router | 6 | 页面路由 | 管理大厅/游戏/结果三个页面的跳转 |

### 后端
| 技术 | 版本 | 用途 | 选择原因 |
|---|---|---|---|
| Node.js | 18+ | 运行环境 | 和前端同语言，降低学习成本 |
| Express | 4 | 后端框架 | 轻量，适合小型API服务 |
| 白山智算 MiniMax-M2.5 | - | AI模型 | 余额已有，中文能力强，兼容OpenAI格式 |

### 部署
| 平台 | 用途 |
|---|---|
| Vercel | 前端部署，自动CI/CD，免费 |
| Railway | 后端部署，免费额度够MVP使用 |
| GitHub | 代码仓库，Vercel和Railway从这里拉代码 |

---

## 二、项目结构

```
ai-haigui-game/
├── web/                          # 前端项目
│   ├── src/
│   │   ├── components/           # 可复用UI组件（不含业务逻辑）
│   │   │   ├── GameCard.tsx      # 游戏大厅的题目卡片
│   │   │   ├── ChatBox.tsx       # 聊天区域容器
│   │   │   ├── Message.tsx       # 单条消息气泡
│   │   │   └── StoryReveal.tsx   # 汤底揭晓动画组件
│   │   ├── pages/                # 页面级组件（含业务逻辑）
│   │   │   ├── Home.tsx          # 游戏大厅页面
│   │   │   ├── Game.tsx          # 游戏页面
│   │   │   └── Result.tsx        # 结果页面
│   │   ├── api/                  # 后端API调用封装
│   │   │   └── index.ts          # 所有请求统一管理，不直接调用AI
│   │   ├── types/                # TypeScript类型定义
│   │   │   └── index.ts          # TStoryPreview、TMessage、TGameState等
│   │   ├── context/              # 全局状态
│   │   │   └── GameContext.tsx   # 游戏状态Context
│   │   ├── hooks/                # 自定义Hooks
│   │   │   └── useGame.ts        # 游戏逻辑+sessionStorage持久化
│   │   ├── App.tsx               # 路由配置
│   │   └── main.tsx              # 入口文件
│   ├── .env.local                # 前端环境变量（不提交GitHub）
│   ├── .env.example              # 环境变量示例（提交GitHub）
│   └── vite.config.ts            # Vite配置（含开发环境代理）
│
├── server/                       # 后端项目
│   ├── data/
│   │   └── stories.json          # 完整题库（含汤底，仅后端可读）
│   ├── routes/
│   │   ├── stories.js            # GET /api/stories 路由
│   │   └── chat.js               # POST /api/chat、POST /api/judge 路由
│   ├── middleware/
│   │   └── rateLimit.js          # 频率限制中间件
│   ├── index.js                  # Express服务器入口
│   ├── .env                      # 后端环境变量（不提交GitHub）
│   └── .env.example              # 环境变量示例（提交GitHub）
│
├── .gitignore                    # 必须包含：node_modules、.env、.env.local
└── README.md                     # 项目说明和启动步骤
```

**重要**：`.gitignore`必须包含以下内容，否则API Key会泄露：
```
node_modules/
.env
.env.local
server/.env
```

---

## 三、数据模型

```typescript
// ✅ 前端可见（不含汤底）
// 由 GET /api/stories 返回，用于大厅展示
type TStoryPreview = {
  id: string
  title: string
  category: 'red' | 'clear' | 'honkaku' | 'henkaku'  // 红汤/清汤/本格/变格
  difficulty: 'easy' | 'medium' | 'hard'
  surface: string  // 汤面，展示给玩家
}

// ❌ 仅后端持有，存放在 server/data/stories.json
// 前端任何接口均不返回 bottom 和 keyClues
type TStory = TStoryPreview & {
  bottom: string       // 汤底
  keyClues: string[]   // 核心要素，3-5条，用于胜负判定
}

// 聊天消息
type TMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type: 'yes' | 'no' | 'irrelevant' | 'invalid' | 'question' | 'info'
  timestamp: number
}

// 游戏状态（持久化到sessionStorage）
// 注意：不包含bottom字段，汤底始终由后端持有
type TGameState = {
  storyId: string
  surface: string
  messages: TMessage[]           // 完整消息历史（不截断，渲染时只显示最新100条）
  status: 'playing' | 'submitting' | 'partial' | 'won' | 'revealed'
  questionCount: number
  yesCount: number
  startTime: number
}

// 统一API响应格式
type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: 'RATE_LIMIT' | 'AI_ERROR' | 'NOT_FOUND' | 'INVALID_INPUT'
    message: string  // 用户可读的错误描述
  }
}
```

---

## 四、路由设计

```
前端路由（React Router）
/              → Home.tsx    游戏大厅
/game/:id      → Game.tsx    游戏页面，:id为题目ID
/result        → Result.tsx  结果页面（通过state传递，防止直接访问）

后端路由（Express）
GET  /api/stories         → 返回所有TStoryPreview（不含bottom和keyClues）
POST /api/chat            → 接收问题，调用DeepSeek，返回是/否/无关
POST /api/judge           → 接收答案，逐条对比keyClues，返回判定结果
```

**注意**：删除了`GET /api/stories/:id/bottom`接口。
原因：没有用户系统时无法校验"游戏是否结束"，任何人都能直接调用拿到汤底。
替代方案：游戏结束时由`/api/judge`在判定通过后一次性返回汤底，`/api/chat`的放弃路径也返回汤底。

---

## 五、核心流程

```
1. 大厅加载
   前端 → GET /api/stories → 后端返回TStoryPreview列表 → 渲染GameCard
   （bottom和keyClues不在返回数据中）

2. 开始游戏
   前端跳转 /game/:id → 从列表数据读取surface显示汤面
   sessionStorage检查：有未完成游戏则恢复，无则新建TGameState

3. 玩家提问
   前端 POST /api/chat { question, storyId }
   → 后端从stories.json读取bottom
   → 组装System Prompt（含汤底，仅在后端）
   → 调用白山智算 MiniMax-M2.5 API
   → 返回 { success: true, data: { answer: '是'|'否'|'无关'|'无法回答'|'invalid', tip?: string } }
   → 前端更新messages，存入sessionStorage

4. 玩家点击「还原真相」
   前端 POST /api/judge { answer, storyId }
   → 后端读取keyClues
   → 组装判定Prompt
   → 调用白山智算 MiniMax-M2.5 API逐条比对
   → 若通关：返回 { success: true, data: { result: 'won', bottom: '完整汤底' } }
   → 若未通关：返回 { success: true, data: { result: 'partial', missing: 2 } }

5. 玩家放弃
   前端 POST /api/judge { action: 'giveup', storyId }
   → 后端直接返回 { success: true, data: { result: 'revealed', bottom: '完整汤底' } }
   → 前端清除sessionStorage，跳转Result页面
```

---

## 六、AI接口封装

```typescript
// web/src/api/index.ts
// 所有请求指向后端，不直接调用DeepSeek

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// 发送问题
export async function askAI(
  question: string,
  storyId: string
): Promise<{ answer: string; tip?: string }> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, storyId }),
    signal: AbortSignal.timeout(15000)  // 15秒超时
  })
  const data: TApiResponse<{ answer: string; tip?: string }> = await res.json()
  if (!data.success) throw new Error(data.error?.message || '请求失败')
  return data.data!
}

// 提交答案或放弃
export async function judgeAnswer(
  storyId: string,
  answer?: string,  // 传answer表示提交，不传表示放弃
): Promise<{ result: 'won' | 'partial' | 'revealed'; bottom?: string; missing?: number }> {
  const res = await fetch(`${BASE_URL}/api/judge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId, answer, action: answer ? 'judge' : 'giveup' }),
    signal: AbortSignal.timeout(15000)
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error?.message || '请求失败')
  return data.data
}
```

---

## 七、useGame Hook结构

```typescript
// web/src/hooks/useGame.ts
const useGame = (storyId: string) => {
  // 初始化：从sessionStorage恢复或新建状态
  // 每次状态变更自动同步到sessionStorage
  // 游戏结束（won/revealed）时清除sessionStorage

  return {
    story,            // TStoryPreview，当前题目基本信息
    messages,         // TMessage[]，完整消息历史
    displayMessages,  // TMessage[]，渲染用，最新100条
    status,           // 游戏状态
    questionCount,
    yesCount,
    isLoading,        // AI思考中
    sendQuestion,     // (question: string) => Promise<void>
    submitAnswer,     // (answer: string) => Promise<void>
    giveUp,           // () => Promise<void>
  }
}
```

**sessionStorage读写时机**：
- 读：`useGame`初始化时，检查`sessionStorage.getItem('haigui_game_state')`
- 写：每次`messages`或`status`变更后自动写入
- 清：`status`变为`won`或`revealed`时清除

---

## 八、后端Express结构

```javascript
// server/index.js
const express = require('express')
const cors = require('cors')
const rateLimit = require('./middleware/rateLimit')

const app = express()
app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}))
app.use('/api', rateLimit)  // 所有/api接口加频率限制

app.use('/api/stories', require('./routes/stories'))
app.use('/api', require('./routes/chat'))

app.listen(process.env.PORT || 3000)
```

```javascript
// server/middleware/rateLimit.js
// 同一IP每分钟最多20次请求
// 超出返回429 + { success: false, error: { code: 'RATE_LIMIT', message: '发送太频繁，请稍等几秒' } }
```

---

## 九、开发环境代理配置

```typescript
// web/vite.config.ts
// 解决开发环境跨域问题
// 前端请求 /api/* 自动转发到后端 http://localhost:3000
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

**生产环境CORS**：后端Express已配置`cors({ origin: FRONTEND_URL })`，Vercel部署后把前端域名填入`FRONTEND_URL`环境变量即可。

---

## 十、环境变量

```bash
# server/.env（后端，不提交GitHub）
AI_API_KEY=你的白山智算API Key
AI_API_URL=https://api.edgefn.net/v1/chat/completions
AI_MODEL=MiniMax-M2.5
PORT=3000
FRONTEND_URL=http://localhost:5173  # 生产环境改为Vercel域名

# web/.env.local（前端，不提交GitHub）
VITE_API_BASE_URL=http://localhost:3000  # 生产环境改为Railway域名
```

---

## 十一、初始化命令

```bash
# 1. 创建前端项目
npm create vite@latest web -- --template react-ts
cd web
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom

# 2. 创建后端项目
mkdir server && cd server
npm init -y
npm install express cors

# 3. 把PRD.md、TECH_DESIGN.md、AGENTS.md放到项目根目录

# 4. 启动开发环境（需要两个终端）
# 终端1：cd server && node index.js
# 终端2：cd web && npm run dev
```

---

## 十二、关键技术决策记录

| 决策 | 选择 | 原因 |
|---|---|---|
| 是否做后端 | 做 | API Key和汤底安全，不欠技术债 |
| AI响应方式 | 非流式 | MVP实现简单，后期再改流式 |
| 状态管理 | Hooks + Context | 项目规模小，不需要Redux |
| 题库存储 | 后端JSON文件 | 不需要数据库，降低复杂度 |
| 汤底获取时机 | 游戏结束时由judge接口返回 | 无法用单独接口校验游戏是否结束 |
| 消息存储 | sessionStorage存完整数据，渲染只显示最新100条 | 防止提问次数和历史对不上 |
| 前端不直接调白山API | 是 | 保护API Key，所有AI调用走后端 |

---

## 十三、补充说明与注意事项

### Node.js版本要求
最低版本：Node.js 18.0.0
原因：`AbortSignal.timeout()`在18以下不支持。
检查方法：`node --version`，低于18需要升级。

### stories.json格式示例
```json
[
  {
    "id": "001",
    "title": "海龟汤",
    "category": "red",
    "difficulty": "easy",
    "surface": "一个男人走进餐厅，点了一碗海龟汤，喝了一口后当场崩溃痛哭，随后离开餐厅跳海自尽了。",
    "bottom": "这个男人曾和妻子在海难中被困荒岛。妻子先死，他为了活命吃了妻子的肉，并欺骗自己那是海龟汤。获救后他一直活在愧疚中。今天餐厅的海龟汤让他第一次尝到了真正的海龟汤味道，才意识到当年吃的根本不是海龟汤，是妻子的肉。他无法承受这个真相，选择自杀。",
    "keyClues": [
      "男主角曾与妻子被困荒岛",
      "妻子死后男主角靠吃妻子的肉存活",
      "他一直以为自己吃的是海龟汤",
      "真正的海龟汤味道让他意识到了真相"
    ]
  }
]
```

### 启动顺序（必须遵守）
**必须先启动后端，再启动前端。**
先启动前端的话，大厅页面会立刻报网络错误，不是代码问题，是后端还没运行。

```bash
# 终端1：先启动后端
cd server && node index.js
# 看到 "Server running on port 3000" 再开终端2

# 终端2：再启动前端
cd web && npm run dev
```

### 后端接口验证方法
前端代码写之前，先用curl验证后端接口是否正常：
```bash
# 验证题目列表接口
curl http://localhost:3000/api/stories

# 验证聊天接口
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"他是男性吗","storyId":"001"}'
```
返回JSON数据说明后端正常，再开始写前端。

### Railway部署要求
Railway部署时会执行`npm start`，需要在`server/package.json`里加：
```json
"scripts": {
  "start": "node index.js"
}
```
没有这个脚本，Railway会报"找不到启动命令"，部署失败。

### 生产环境CORS兜底配置
```javascript
// server/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 
    (process.env.NODE_ENV === 'production' 
      ? '必须配置FRONTEND_URL环境变量' 
      : 'http://localhost:5173')
}))
```
生产环境没配`FRONTEND_URL`会直接报错提醒，而不是静默允许所有来源。

### 单局API成本估算
```
System Prompt（含汤底约200字）≈ 300 Token，每次提问都计费
平均每个问题：用户50Token + AI回答5Token = 55Token
平均每局50个问题
单局成本：300×50（System Prompt）+ 55×50（对话）= 17,750 Token
白山MiniMax-M2.5定价：输入¥2.1/百万tokens，输出¥8.4/百万tokens
单局成本 ≈ 17,750 Token × 均价0.005元/千Token ≈ 0.09元，100人玩 ≈ 9元
结论：成本可控，白山余额已有，无需额外充值
```
