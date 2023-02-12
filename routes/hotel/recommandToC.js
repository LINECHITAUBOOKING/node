const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/recommandToC', async (req, res, next) => {
  let [data] = await pool.query(
    'SELECT * FROM hotel_account WHERE id>=11 AND id<=22'
  )
  res.json(data)
})

module.exports = router
