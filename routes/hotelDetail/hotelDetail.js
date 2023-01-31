const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/:companyName', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT hotel_account.*, hotel_service_list.* FROM hotel_account INNER JOIN hotel_service_list ON hotel_service_list.hotel=hotel_account.company_name WHERE hotel_account.company_name=?',
    [req.params.companyName]
  )
  //   let [results2] = await pool.execute(
  //     'SELECT * FROM hotel_service_list WHERE hotel_service_list.hotel=?',
  //     [req.params.companyName]
  //   )
  res.json(results)
})
module.exports = router
