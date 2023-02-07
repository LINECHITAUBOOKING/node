const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.use(express.json())
router.use(express.urlencoded({ extended: true }))
router.post('/plan-page', async (req, res) => {
  console.log(req.body)
  res.json(req.body)
})

module.exports = router
