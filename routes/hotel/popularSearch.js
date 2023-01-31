const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/popularSearch', async (req, res, next) => {
  let [data] = await pool.query(
    'SELECT * FROM hotel_account WHERE id>=1 AND id<=5'
  )
  res.json(data)
})
router.get('/popularSearch2', async (req, res, next) => {
  let [data] = await pool.query(
    'SELECT * FROM hotel_account WHERE id>=6 AND id<=10'
  )
  res.json(data)
})

module.exports = router
