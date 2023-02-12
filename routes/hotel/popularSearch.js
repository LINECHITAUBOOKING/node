const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/popularSearch', async (req, res, next) => {
  let [data] = await pool.query(
    'SELECT * FROM hotel_account WHERE id>=2 AND id<=6'
  )
  res.json(data)
})
router.get('/popularSearch2', async (req, res, next) => {
  let [data] = await pool.query(
    'SELECT * FROM hotel_account WHERE id>=7 AND id<=11'
  )
  res.json(data)
})

module.exports = router
