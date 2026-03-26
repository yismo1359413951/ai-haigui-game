require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('./middleware/rateLimit')
const fs = require('fs')
const path = require('path')

const storiesRouter = require('./routes/stories')
const chatRouter = require('./routes/chat')

const app = express()
const PORT = process.env.PORT || 3000

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
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? '必须配置FRONTEND_URL环境变量'
        : 'http://localhost:5177'),
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

app.use('/api/stories', storiesRouter)
app.use('/api', chatRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
