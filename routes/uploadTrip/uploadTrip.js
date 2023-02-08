const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

module.exports = router
