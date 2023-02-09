const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/:URLkeyword', async (req, res) => {
  let keyword = req.params.URLkeyword //t=產品ID

  return keyword
})

module.exports = router
