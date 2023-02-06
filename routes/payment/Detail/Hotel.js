const express = require('express')
const router = express.Router()

const pool = require('../../../utils/db')

router.get('/:companyName/:roomName', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT  hotel_room_list.id AS hotel_room_list_id,hotel_room_list.*, room_service_list.*,room_service_list.id AS room_service_id,hotel_account.company_name,hotel_account.address FROM hotel_room_list INNER JOIN room_service_list ON hotel_room_list.room_name=room_service_list.room JOIN hotel_account ON hotel_account.company_name=hotel_room_list.hotel_name WHERE hotel_room_list.hotel_name=? AND room_service_list.hotel=? AND hotel_room_list.room_name=?',
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
router.get('/:user', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT user_credit_card.*, users.* FROM user_credit_card INNER JOIN users ON user_credit_card.user_email=users.email  WHERE user_credit_card.user_email=? ',
    [req.params.user]
  )
  //   SELECT hotel_room_list.*, room_service_list.*,hotel_account.* FROM hotel_room_list INNER JOIN room_service_list ON hotel_room_list.room_name=room_service_list.room JOIN hotel_account ON hotel_account.company_name=hotel_room_list.hotel_name WHERE hotel_room_list.hotel_name='台北宏都金殿飯店' AND room_service_list.hotel='台北宏都金殿飯店' AND hotel_room_list.room_name='高級套房';
  //   let [results2] = await pool.execute(
  //     'SELECT * FROM hotel_service_list WHERE hotel_service_list.hotel=?',
  //     [req.params.companyName]
  //   )
  res.json(results)
})
router.post('/order', async (req, res) => {
  console.log('POST /api/order', req.body)
  // req.body.stockId, req.body.stockName
  const memo = '無'
  const order_id = 'NH' + req.body.orderIdNum
  const description = JSON.stringify([
    { booker: req.body.formData, memo: memo },
  ])
  console.log('======description======', description)
  let [results] = await pool.query(
    'INSERT INTO `total_order_list` (`id`, `user_email`, `order_date`, `total_price`, `total_amount`, `state`, `valid`) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      order_id,
      req.body.userEmail,
      req.body.orderDate,
      req.body.totalPrice,
      req.body.amount,
      0,
      1,
    ]
  )
  let [details] = await pool.query(
    'INSERT INTO `order_list_detail` (`id`, `order_id`, `product_id`, `company_name`, `price`, `amount`, `start_date`, `end_date`, `description`, `discount`, `vaild`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
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
      req.body.discount,
      1,
    ]
  )
  //   INSERT INTO `order_list_detail` (`id`, `order_id`, `product_id`, `price`, `amount`, `start_date`, `end_date`, `description`, `discount`, `vaild`) VALUES (NULL, 'H1675571798103', '3', '1000', '10', '2023-02-01', '2023-02-02', '{booker: {lastName: \'張\',firstName: \'三明\',email: \'Chung1125@wanggg.com\',tel: \'0913255468\',country: \'台灣\',lang: \'中文\',},memo:\'房間不要有頭髮\'}', '20', '1');
  // console.log(results);
  res.json({})
})
module.exports = router
