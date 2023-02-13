var express = require('express')
var router = express.Router()
const pool = require('../../utils/db')
/* GET users listing. */

router.get('/list/:email', async (req, res, next) => {
  console.log('有嬤', req.params.email)
  let [results] = await pool.execute(
    'SELECT users.email,total_order_list.*,order_list_detail.*,hotel_room_list.* FROM users INNER JOIN total_order_list ON users.email=total_order_list.user_email JOIN order_list_detail ON order_list_detail.order_id=total_order_list.id JOIN hotel_room_list ON hotel_room_list.id=order_list_detail.product_id WHERE total_order_list.user_email = ? ',
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
    'SELECT order_list_detail.*,order_list_detail.amount AS detail_amount, total_order_list.*,hotel_room_list.* FROM order_list_detail INNER JOIN total_order_list ON order_list_detail.order_id = total_order_list.id JOIN hotel_room_list ON order_list_detail.product_id=hotel_room_list.id WHERE total_order_list.id = ? ',
    [req.params.id]
  )
  if (results.length === 0) {
    return res.status(400).json({ error: '找不到訂單' })
  }
  res.json(results)
})

router.post('/order/:orderid/:lineid', async (req, res, next) => {
  console.log('有嬤', req.params.orderid, req.params.lineid)
  let [results] = await pool.execute(
    'UPDATE total_order_list SET linepay_id = ? WHERE total_order_list.id = ?',
    [req.params.lineid, req.params.orderid]
  )
  console.log('line', req.params.lineid)
  if (results.length === 0) {
    return res.status(400).json({ error: '找不到訂單' })
  }
  res.json(results)
})


router.get('/listdetail/:email/:id', async (req, res, next) => {
  console.log('有嬤', req.params.email, req.params.id)
  let [results] = await pool.execute(
    'SELECT order_list_detail.*,order_list_detail.amount AS detail_amount, total_order_list.*,hotel_room_list.* FROM order_list_detail INNER JOIN total_order_list ON order_list_detail.order_id = total_order_list.id JOIN hotel_room_list ON order_list_detail.product_id=hotel_room_list.id WHERE total_order_list.id = ? ',
    [req.params.id]
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
