require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('./middleware/rateLimit')
const fs = require('fs')
const path = require('path')

const storiesRouter = require('./routes/stories')
const chatRouter = require('./routes/chat')

const app = express()
// Railway 生成的对外端口常常是 8080；若平台没有注入 PORT，就用 8080 作为兜底
const PORT = process.env.PORT || 8080

const debugLog = (line) => {
  try {
    fs.appendFileSync(
      path.join(__dirname, 'debug.log'),
      `${new Date().toISOString()} ${line}\n`,
      'utf8',
    )
  } catch {
    // ignore debug write failure
  }
}

app.use(express.json())
const configuredFrontendUrl = (process.env.FRONTEND_URL || '').trim()
const isProd = process.env.NODE_ENV === 'production'

// CORS:
// - 生产环境应该配置 FRONTEND_URL（例如你的 Vercel 域名）
// - 但即使没配，也绝不能把中文/非法字符串写进 Access-Control-Allow-Origin（会直接抛 ERR_INVALID_CHAR）
app.use(
  cors({
    origin: (origin, callback) => {
      // 非浏览器请求（curl / server-to-server）可能没有 Origin
      if (!origin) return callback(null, true)

      if (configuredFrontendUrl) {
        return callback(null, origin === configuredFrontendUrl)
      }

      if (isProd) {
        console.warn(
          '[CORS] FRONTEND_URL is not set in production; allowing all origins temporarily',
        )
      }
      return callback(null, true)
    },
  }),
)

// 联调日志：只要请求进入/api，这里一定会打印
app.use('/api', (req, res, next) => {
  console.log('[DAY14] /api hit', { method: req.method, path: req.path })
  debugLog(`[DAY14] /api hit ${req.method} ${req.path}`)
  next()
})

app.use('/api', rateLimit)

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    data: { message: 'ok' },
  })
})

// Health check endpoint（Railway/平台可能默认探测根路径 `/`）
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: { message: 'ok' },
  })
})

// Additional health endpoints (some platforms probe these paths instead of `/`)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'ok' },
  })
})

app.get('/healthz', (req, res) => {
  res.json({
    success: true,
    data: { message: 'ok' },
  })
})

app.get('/ready', (req, res) => {
  res.json({
    success: true,
    data: { message: 'ok' },
  })
})

app.get('/live', (req, res) => {
  res.json({
    success: true,
    data: { message: 'ok' },
  })
})

app.use('/api/stories', storiesRouter)
app.use('/api', chatRouter)

// Bind to all network interfaces so Railway's public routing can reach the service.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
