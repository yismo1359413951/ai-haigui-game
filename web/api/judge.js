const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const parseJsonBody = async (req) => {
  let raw = ''
  for await (const chunk of req) raw += chunk.toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'OPTIONS') {
    sendJson(res, 405, {
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Method not allowed' },
    })
    return
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  try {
    const body = await parseJsonBody(req)
    const backendBase = process.env.VITE_API_BASE_URL ?? ''
    const upstreamUrl = `${backendBase}/api/judge`

    if (!backendBase) {
      sendJson(res, 500, {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing backend base URL in VITE_API_BASE_URL',
        },
      })
      return
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await upstreamRes.text()
    try {
      const data = JSON.parse(text)
      sendJson(res, upstreamRes.status, data)
    } catch {
      res.statusCode = 502
      res.end(text)
    }
  } catch (err) {
    sendJson(res, 500, {
      success: false,
      error: {
        code: 'AI_ERROR',
        message: err instanceof Error ? err.message : 'Server error',
      },
    })
  }
}

