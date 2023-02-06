const express = require('express')
const router = express.Router()

const pool = require('../utils/db')

router.get('/:region', async (req, res, next) => {
  const region = req.params.region
  let [data] = await pool.query('SELECT * FROM scenic_spot WHERE Region=?', [
    region,
  ])
  res.json(data)
  console.log(data)
})

module.exports = router
