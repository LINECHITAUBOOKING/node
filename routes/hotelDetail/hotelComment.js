const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/:companyName/comment', async (req, res, next) => {
  let [results] = await pool.execute(
    'SELECT * FROM hotel_comment WHERE hotel=? AND valid=?',
    [req.params.companyName, 1]
  )

  res.json(results)
})
module.exports = router
