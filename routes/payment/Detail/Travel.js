const express = require('express')
const router = express.Router()

const moment = require('moment')

const pool = require('../../../utils/db')

router.get('/coupon/:couponId', async (req, res, next) => {
  console.log('123')
  let [useCoupon] = await pool.execute(
    'SELECT user_coupon.id,user_coupon.discount FROM `user_coupon`  WHERE id=?',
    [req.params.couponId]
  )

  res.json(useCoupon)
})

router.post('/order', async (req, res, next) => {
  console.log('POST /api/order', req.body)
  // req.body.stockId, req.body.stockName
  const order_id = 'NT' + req.body.orderIdNum
  const description = JSON.stringify([{ booker: req.body.formData }])
  console.log('======description======', description)
  let [resultsTotalOrderList] = await pool.query(
    'INSERT INTO `trip_order_list` (`id`, `user_email`, `order_date`, `discount`, `init_total_price`, `final_total_price`, `plan_amount`, `state`, `valid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)',
    [
      order_id,
      req.body.userEmail,
      req.body.orderDate,
      req.body.discount,
      req.body.totalPrice,
      req.body.finalPrice,
      req.body.amount,
      0,
      1,
    ]
  )
  console.log('amount', req.body.amount)
  req.body.product.map(async (item, index) => {
    let [OrderListDetails] = await pool.query(
      'INSERT INTO `trip_order_detail` (`id`, `order_id`, `trip_id`, `plan_id`, `amount_adu`, `amount_eld`, `amount_chi`, `total_price`, `depart_time`, `description`, `valid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);',
      [
        null,
        order_id,
        item.tripId,
        item.planId,
        item.amountA,
        item.amountE,
        item.amountC,
        item.totalPrice,
        item.departTime,
        description,
        1,
      ]
    )
  })
    let [useCoupon] = await pool.query(
      'UPDATE `user_coupon` SET `valid` = ? WHERE `user_coupon`.`id` = ?;',
      [0, req.body.discountId]
    )
  //   INSERT INTO `order_list_detail` (`id`, `order_id`, `product_id`, `price`, `amount`, `start_date`, `end_date`, `description`, `discount`, `vaild`) VALUES (NULL, 'H1675571798103', '3', '1000', '10', '2023-02-01', '2023-02-02', '{booker: {lastName: \'張\',firstName: \'三明\',email: \'Chung1125@wanggg.com\',tel: \'0913255468\',country: \'台灣\',lang: \'中文\',},memo:\'房間不要有頭髮\'}', '20', '1');
  // console.log(results);
  res.json({})
})
router.get('/userCoupons/:userEmail', async (req, res, next) => {
  console.log('=====', req.params.userEmail)
  const now = moment(Date.now()).format('YYYY-MM-DD')
  // const now = '2023-03-21'

  let [userCoupons] = await pool.execute(
    'SELECT user_coupon.id,user_coupon.coupon_name,user_coupon.expire_date,user_coupon.discount FROM user_coupon  WHERE name= ? AND valid=?',
    [req.params.userEmail, 1]
  )
  console.log('req.body.userEmail', now)

  res.json(userCoupons)
})


module.exports = router
