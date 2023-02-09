const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/:companyName/orderList', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT * FROM order_list_detail WHERE company_name=?',
    [req.params.companyName]
  )
  //   let [results2] = await pool.execute(
  //     'SELECT * FROM hotel_service_list WHERE hotel_service_list.hotel=?',
  //     [req.params.companyName]
  //   )
  res.json(results)
})
module.exports = router
