const express = require('express')
const stories = require('../data/stories.json')

const router = express.Router()

router.get('/', (req, res) => {
  const previews = stories.map(({ bottom, keyClues, ...preview }) => preview)
  res.json({ success: true, data: previews })
})

module.exports = router
