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
  const order_id = 'NH' + req.body.orderIdNum
  const description = JSON.stringify([
    { booker: req.body.formData, memo: req.body.memo },
  ])
  console.log('======description======', description)
  let [resultsTotalOrderList] = await pool.query(
    'INSERT INTO `total_order_list` (`id`, `user_email`, `order_date`, `total_price`, `total_amount`, `state`,`discount`,`hotel_img`, `valid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)',
    [
      order_id,
      req.body.userEmail,
      req.body.orderDate,
      req.body.totalPrice,
      req.body.amount,
      0,
      req.body.discount,
      req.body.hotelImg,
      1,
    ]
  )
  console.log('amount', req.body.amount)
  let [OrderListDetails] = await pool.query(
    'INSERT INTO `order_list_detail` (`id`, `order_id`, `product_id`, `company_name`, `price`, `amount`, `start_date`, `end_date`, `description`, `vaild`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [
      null,
      order_id,
      req.body.productId,
      req.body.companyName,
      req.body.price,
      req.body.amount,
      req.body.startDate,
      req.body.endDate,
      description,
      1,
    ]
  )
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
router.get('/:companyName/:roomName', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT  hotel_room_list.id AS hotel_room_list_id,hotel_room_list.*, room_service_list.*,room_service_list.id AS room_service_id,hotel_account.company_name,hotel_account.address,hotel_account.company_banner FROM hotel_room_list INNER JOIN room_service_list ON hotel_room_list.room_name=room_service_list.room JOIN hotel_account ON hotel_account.company_name=hotel_room_list.hotel_name WHERE hotel_room_list.hotel_name=? AND room_service_list.hotel=? AND hotel_room_list.room_name=?',
    [req.params.companyName, req.params.companyName, req.params.roomName]
  )
  // NOTE  JOIN了 訂單房型飯店 ，要想怎麼傳值到CheckOut
  //  SELECT order_list_detail.*, total_order_list.*,hotel_room_list.*, room_service_list.*,hotel_account.company_name,hotel_account.address FROM total_order_list INNER JOIN order_list_detail ON total_order_list.id=order_list_detail.order_id JOIN hotel_room_list ON order_list_detail.product_id=hotel_room_list.id JOIN room_service_list ON room_service_list.id=hotel_room_list.id JOIN hotel_account ON hotel_room_list.hotel_name=hotel_account.company_name WHERE  total_order_list.user_email='lpy102817@gmail.com' AND hotel_room_list.id='4' AND total_order_list.order_date='2023-02-05 16:25:19';';
  console.log('companyName', req.params.companyName)
  console.log('roomName', req.params.companyName)
  //   let [results2] = await pool.execute(
  //     'SELECT * FROM hotel_service_list WHERE hotel_service_list.hotel=?',
  //     [req.params.companyName]
  //   )
  res.json(results)
})

module.exports = router
