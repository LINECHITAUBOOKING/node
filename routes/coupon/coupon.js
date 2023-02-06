var express = require('express')
var router = express.Router()
const pool = require('../../utils/db')
/* GET users listing. */

router.get('/coupon/:email/:code', async (req, res, next) => {
  const { email } = req.body

  console.log('新增', req.params.code, req.params.email)
  let [coupon] = await pool.execute('SELECT * FROM coupon WHERE code = ?', [
    req.params.code,
  ])

  if (coupon.length === 0) {
    return res.status(400).json({
      errors: [
        {
          msg: '無此優惠券',
          param: 'code',
        },
      ],
    })
  }

  console.log([
    req.params.email,
    coupon[0].name,
    1,
    coupon[0].expire_date,
    coupon[0].discount,
    coupon[0].valid,
  ])
  let result = await pool.execute(
    'INSERT INTO user_coupon (name, coupon_name, amount, expire_date,discount,valid) VALUES (?, ?, ?, ?,?,?);',
    [
      req.params.email,
      coupon[0].name,
      1,
      coupon[0].expire_date,
      coupon[0].discount,
      coupon[0].valid,
    ]
  )

  res.json()
})
router.get('/couponitem/:email', async (req, res, next) => {
  console.log('已拿到的', req.params.email)
  /* let [results] = await pool.execute('SELECT * FROM coupon WHERE code = ?', [
    req.params.code,
  ]) */
  const [results] = await pool.execute(
    'SELECT users.email,user_coupon.* FROM users INNER JOIN user_coupon ON users.email=user_coupon.name WHERE user_coupon.name = ?',
    [req.params.email]
  )
  /*   if (results.length === 0) {
    return res.status(400).json({ error: '找不到訂單' })
  } */

  res.json(results)
  // console.log(results)
})

module.exports = router
