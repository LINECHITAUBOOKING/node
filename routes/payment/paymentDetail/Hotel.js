const express = require('express')
const router = express.Router()

const pool = require('../../../utils/db')

router.get('/:companyName/:roomName', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT hotel_room_list.*, room_service_list.*,hotel_account.company_name,hotel_account.address FROM hotel_room_list INNER JOIN room_service_list ON hotel_room_list.room_name=room_service_list.room JOIN hotel_account ON hotel_account.company_name=hotel_room_list.hotel_name WHERE hotel_room_list.hotel_name=? AND room_service_list.hotel=? AND hotel_room_list.room_name=?',
    [req.params.companyName, req.params.companyName, req.params.roomName]
  )
  //   SELECT hotel_room_list.*, room_service_list.*,hotel_account.* FROM hotel_room_list INNER JOIN room_service_list ON hotel_room_list.room_name=room_service_list.room JOIN hotel_account ON hotel_account.company_name=hotel_room_list.hotel_name WHERE hotel_room_list.hotel_name='台北宏都金殿飯店' AND room_service_list.hotel='台北宏都金殿飯店' AND hotel_room_list.room_name='高級套房';
  console.log('companyName', req.params.companyName)
  console.log('roomName', req.params.companyName)
  //   let [results2] = await pool.execute(
  //     'SELECT * FROM hotel_service_list WHERE hotel_service_list.hotel=?',
  //     [req.params.companyName]
  //   )
  res.json(results)
})
module.exports = router
