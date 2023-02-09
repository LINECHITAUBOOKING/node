const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/userLike/:userEmail', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT * FROM hotel_user_like WHERE user_email=?',
    [req.params.userEmail]
  )
  res.json(results)
})

module.exports = router
