const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  // 这个 endpoint 用于验证 Vercel API 代理链路是否通畅
  sendJson(res, 200, { success: true, data: { message: 'ok' } })
}

