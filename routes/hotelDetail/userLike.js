const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.post('/setUserLike/:companyName', async (req, res, next) => {
  const { email, hotel } = req.body
  console.log(req.body)
  await pool.execute(
    'INSERT INTO hotel_user_like (user_email, company_name) VALUES (?, ?)',
    [email, hotel]
  ),
    (error, results) => {
      if (error) {
        return res.json({ status: 'error', message: error.message })
      }
      res.json({ status: 'success', message: 'User created' })
    }
})
module.exports = router
