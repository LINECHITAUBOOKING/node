const express = require('express')
const router = express.Router()

const moment = require('moment')

const pool = require('../../../utils/db')

router.get('/creditCard/:user', async (req, res, next) => {
  let [creditcard] = await pool.query(
    'SELECT credit_card.*, users.email FROM credit_card INNER JOIN users ON credit_card.user_email=users.email  WHERE credit_card.user_email=? ',
    [req.params.user]
  )
  res.json(creditcard)
})

router.get('/:orderId', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT trip_order_detail.* ,trip_order_detail.id AS order_detail_id , trip_order_list.*,trip_event.trip_id AS event_id,trip_event.trip_name,trip_plan.plan_id AS plan_number ,trip_plan.plan_name FROM trip_order_list INNER JOIN trip_order_detail ON trip_order_list.id=trip_order_detail.order_id JOIN trip_event ON trip_order_detail.trip_id=trip_event.trip_id JOIN trip_plan ON trip_plan.plan_id=trip_order_detail.plan_id WHERE  trip_order_list.id=?;',
    [req.params.orderId]
  )

  console.log('orderId', req.params.orderId)

  res.json(results)
})

router.post('/order/CheckOut', async (req, res) => {
  console.log('POST /api/order', req.body)
  // req.body.stockId, req.body.stockName

  let [details] = await pool.query(
    'UPDATE `trip_order_list` SET `state` = ? WHERE `trip_order_list`.`id` = ?;',
    [1, req.body.orderId]
  )

  res.json({})
})

module.exports = router
