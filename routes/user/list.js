var express = require('express')
var router = express.Router()
const pool = require('../../utils/db')
/* GET users listing. */

router.get('/list/:email', async (req, res, next) => {
  console.log('有嬤', req.params.email)
  let [results] = await pool.execute(
    'SELECT users.email,total_order_list.* FROM users INNER JOIN total_order_list ON users.email=total_order_list.user_email WHERE total_order_list.user_email = ?',
    [req.params.email]
  )
  if (results.length === 0) {
    return res.status(400).json({ error: '找不到訂單' })
  }
  res.json(results)
})
router.get('/list/:email/:id', async (req, res, next) => {
  console.log('有嬤', req.params.email, req.params.id)
  let [results] = await pool.execute(
    'SELECT users.email,total_order_list.* FROM users INNER JOIN total_order_list ON users.email=total_order_list.user_email WHERE total_order_list.user_email = ? AND total_order_list.id = ?',
    [req.params.email, req.params.id]
  )
  if (results.length === 0) {
    return res.status(400).json({ error: '找不到訂單' })
  }
  res.json(results)
})

router.get('/pay/:email', async (req, res, next) => {
  console.log('有嬤', req.params.email)
  let [results] = await pool.execute(
    'SELECT * FROM credit_card WHERE user_email = ?',
    [req.params.email]
  )
  if (results.length === 0) {
    return res.status(400).json({ error: '找不到訂單' })
  }
  res.json(results)
})

module.exports = router
