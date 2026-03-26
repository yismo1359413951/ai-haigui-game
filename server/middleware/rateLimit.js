const counters = new Map()
const WINDOW_MS = 60 * 1000
const LIMIT = 20

module.exports = (req, res, next) => {
  const key = req.ip ?? 'unknown'
  const now = Date.now()
  const entry = counters.get(key)

  if (!entry || now - entry.startAt >= WINDOW_MS) {
    counters.set(key, { startAt: now, count: 1 })
    return next()
  }

  if (entry.count >= LIMIT) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: '发送太频繁，请稍等几秒',
      },
    })
  }

  entry.count += 1
  return next()
}
