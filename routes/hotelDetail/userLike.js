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
router.get('/userLike/:userEmail/1', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT hotel_account.*, hotel_user_like.* FROM hotel_account INNER JOIN hotel_user_like ON hotel_user_like.company_name=hotel_account.company_name WHERE hotel_user_like.valid=1 AND  user_email=?',
    [req.params.userEmail]
  )
  res.json(results)
})

module.exports = router
