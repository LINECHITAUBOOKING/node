const express = require('express')
const router = express.Router()

const pool = require('../utils/db');

router.get('/hotel', async (req, res, next) => {
    let [data] = await pool.query('SELECT * FROM hotel_account');
    res.json(data)
})


module.exports = router
