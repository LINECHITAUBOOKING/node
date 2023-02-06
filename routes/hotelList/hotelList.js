const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/:region', async (req, res, next) => {
  let [data] = await pool.query(
    'SELECT hotel_account.*, hotel_service_list.* FROM hotel_account INNER JOIN hotel_service_list ON hotel_account.company_name=hotel_service_list.hotel WHERE hotel_account.region=?',
    [req.params.region]
  )
  res.json(data)
})

module.exports = router
