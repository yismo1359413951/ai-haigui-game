const defaultHandler = (res) => {
  res.status(200).json({
    success: true,
    data: { message: 'ok' },
  })
}

module.exports = async (req, res) => {
  // 兼容 OPTIONS 预检
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 这个 endpoint 用于验证 Vercel API 代理链路是否通畅
  defaultHandler(res)
}

