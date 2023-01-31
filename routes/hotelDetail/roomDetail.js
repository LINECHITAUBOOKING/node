const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/:companyName/rooms', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT hotel_room_list.*, room_service_list.* FROM hotel_room_list INNER JOIN room_service_list ON hotel_room_list.room_name=room_service_list.room WHERE hotel_room_list.hotel_name=? AND room_service_list.hotel=?',
    [req.params.companyName, req.params.companyName]
  )
  //   let [results2] = await pool.execute(
  //     'SELECT * FROM hotel_service_list WHERE hotel_service_list.hotel=?',
  //     [req.params.companyName]
  //   )
  res.json(results)
})
module.exports = router
