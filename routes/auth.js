const express = require('express')
const router = express.Router()
const pool = require('../utils/db')
const argon2 = require('argon2')
const jsonwebtoken = require('jsonwebtoken')
const authenticateJWT = require('../middleware/jwt')
const transporter = require('../config/mail.js').transporter
require('dotenv').config()

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

// users demo data

const users = [
  { id: 1, username: 'pony', password: '11111', role: 'admin' },
  { id: 2, username: 'harry', password: '12345', role: 'user' },
  { id: 3, username: 'eddy', password: '33333', role: 'admin' },
]

let refreshTokens = []

// request new access token
router.get('/jwt-token', (req, res) => {
  //const { token } = req.body
  const token = req.cookies.refreshToken

  if (!token) {
    return res.sendStatus(401)
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403)
  }

  jsonwebtoken.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }

    const accessToken = jsonwebtoken.sign(
      { email: user.email, username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: '60m' }
    )

    res.json({
      accessToken,
    })
  })
})

// request new csrf token
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

router.post('/google', async (req, res) => {
  const { username, email } = req.body
  console.log(username, email)
  let [members] = await pool.execute('SELECT * FROM users WHERE email = ?', [
    req.body.email,
  ])
  if (members.length == 0) {
    // 表示這個 email 有存在資料庫中
    // 如果已經註冊過，就回覆 400
    let result = await pool.execute(
      'INSERT INTO users (email, name) VALUES (?, ?);',
      [req.body.email, req.body.username]
    )
  }
  /*  let result = await pool.execute(
    'INSERT INTO users (email, name) VALUES (?, ?);',
    [req.body.email, req.body.username]
  ) */

  if (username) {
    // generate an access token
    const accessToken = jsonwebtoken.sign(
      {
        id: username.id,
        username: username.username,
        role: username.role,
        email: email,
      },
      accessTokenSecret,
      { expiresIn: '60m' }
    )

    // generate an refreshToken token
    const refreshToken = jsonwebtoken.sign(
      {
        id: username.id,
        username: username.username,
        role: username.role,
        email: email,
      },
      refreshTokenSecret,
      { expiresIn: '60d' }
    )

    refreshTokens.push(refreshToken)

    // now in react state !
    //res.cookie('accessToken', accessToken, { httpOnly: true })

    // refresh token is in browser cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true })

    // only need to pass access token to react state
    // refresh token is in browser cookie
    res.json({
      accessToken,
      // refreshToken,
    })
  } else {
    res.send('Username or password incorrect')
  }
})
router.post('/login', async (req, res) => {
  // read username and password from request body
  const { email, password } = req.body
  let [user] = await pool.execute('SELECT * FROM users WHERE email=? ', [email])
  if (user.length === 0) {
    return res.status(401).json({ errors: ['尚未註冊'] })
  }
  console.log(email, password)
  let [uservalid] = await pool.execute(
    'SELECT valid FROM users WHERE email = ? ',
    [email]
  )
  // console.log('valid', uservalid[0].valid)
  if (uservalid[0].valid === 0) {
    return res.status(402).json({ errors: ['尚未驗證'] })
  }
  // filter user from the users array by username and password

  let users = user[0]
  console.log(users)

  /*  const user = member.find((u)   => {
    return u.username === username && u.password === password
  }) */
  console.log(user)
  let result = await argon2.verify(users.password, req.body.password)
  if (result === false) {
    return res.status(403).json({ errors: ['密碼錯誤'] })
  }
  if (result) {
    // generate an access token
    const accessToken = jsonwebtoken.sign(
      { email: email, username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: '60m' }
    )

    // generate an refreshToken token
    const refreshToken = jsonwebtoken.sign(
      { email: email, username: user.username, role: user.role },
      refreshTokenSecret,
      { expiresIn: '60d' }
    )

    refreshTokens.push(refreshToken)

    // now in react state !

    //res.cookie('accessToken', accessToken, { httpOnly: true })

    // refresh token is in browser cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true })

    // only need to pass access token to react state
    // refresh token is in browser cookie
    res.json({
      accessToken,
      // refreshToken,
    })
  } else {
    res.send('Username or password incorrect')
  }
})

router.post('/register', async (req, res) => {
  // read username and password from request body
  const { email, account, password, confirmPassword } = req.body
  const hashedPassword = await argon2.hash(req.body.password)
  const date = new Date()

  console.log(date)
  let [members] = await pool.execute('SELECT * FROM users WHERE email = ?', [
    req.body.email,
  ])
  if (members.length > 0) {
    // 表示這個 email 有存在資料庫中
    // 如果已經註冊過，就回覆 400
    return res.status(400).json({
      errors: [
        {
          msg: 'email 已經註冊過',
          param: 'email',
        },
      ],
    })
  }
  const hash = (Math.random() + 1).toString(36).substring(7)

  const mailOptions = {
    from: `"來七桃"<${process.env.EMAIL_ADDRESS}>`,
    to: `${email}`,
    subject: '驗證信',
    text: `123456 \r\n`,

    // html: `<p>請點選以下連結進行驗證:</p>
    // <a href="http://localhost:3000/token/${hash}">Verify email</a>`,
    html: `<body style="margin:0; padding:0;" bgcolor="#F0F0F0" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
    <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#F0F0F0;">
      <tr>
        <td align="center" valign="top" bgcolor="#F0F0F0" style="background-color: #F0F0F0;">
          <br>
          <table border="0" width="600" cellpadding="0" cellspacing="0" class="container" style="width: 600px; max-width: 600px;">
            <tr>
              <td class="container-padding content" align="left" style="padding-left: 24px; padding-right: 24px; padding-top: 12px; padding-bottom: 12px; background-color: #ffffff;">
                <div style="min-height: auto; padding: 15px; text-align: center; max-height: 100px; max-width: 100%;">
                <h1><em>來七桃</em></h1>
                </div>
                <br/>
                <div style="height: 1px; border-bottom: 1px solid #cccccc; clear: both;"></div>
                <br/>
                  <p>親愛的用戶，</p>
<p>恭喜您成為來七桃一般會員 請點選以下連結進行驗證:</p>
<a href="http://localhost:3000/token/${hash}">點我認證</a>
<p>想要獲得更多資訊，歡迎到來七桃逛逛</p>
                 
                <br/>
              </td>
            </tr>
            <tr>
              <td class="container-padding footer-text" align="left" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; line-height: 16px; color: #aaaaaa; padding-left: 24px; padding-right: 24px;">
                <br><br>
                <strong>來七桃</strong>
                <br><br>
                這封電郵是寄到${email}。<br>
                您會收到這封電郵是由於您使用這個電郵地址註冊成為來七桃的會員。
                <br><br>
                <br><br>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`,
  }

  //Send Email
  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      return res.status(400).json({ Status: 'Failure', Details: err })
    } else {
      return res.json({ Status: 'Success' })
    }
  })
  let result = await pool.execute(
    'INSERT INTO users (account, password, email, created,code) VALUES (?, ?, ?, ?,?);',
    [req.body.username, hashedPassword, req.body.email, date, hash]
  )
  res.json()
})

router.post('/pay', async (req, res) => {
  // read username and password from request body
  const { name, number, date, cvc, email } = req.body
  console.log(req.body)
  let [members] = await pool.execute(
    'SELECT * FROM credit_card WHERE user_email = ?',
    [req.body.email]
  )
  if (members.length > 0) {
    let result = await pool.execute(
      'UPDATE credit_card SET cardholder_name = ?, card_number = ?, exp_date = ?, cvc = ? WHERE user_email = ?;',
      [
        req.body.name,
        req.body.number,
        req.body.date,
        req.body.cvc,
        req.body.email,
      ]
    )
  } else {
    let result = await pool.execute(
      'INSERT INTO credit_card (user_email, cardholder_name, card_number, exp_date	, cvc) VALUES (?, ?, ?, ?, ?);',
      [
        req.body.email,
        req.body.name,
        req.body.number,
        req.body.date,
        req.body.cvc,
      ]
    )
  }

  res.json()
})
router.get('/token/:token', async (req, res) => {
  // read username and password from request body
  const hash = req.params.token
  console.log(hash)
  let result = await pool.execute(
    'UPDATE users SET valid = ? WHERE code = ?;',
    ['1', hash]
  )

  res.json()
})

router.post('/setting', async (req, res) => {
  // read username and password from request body
  const { name, city, country, nickname, birthday, phone, email } = req.body
  console.log(req.body)

  let result = await pool.execute(
    'UPDATE users SET name = ?, city = ?, country = ?, nickname = ?, birthday = ?, phone = ? WHERE email = ?;',
    [
      req.body.name,
      req.body.city,
      req.body.country,
      req.body.nickname,
      req.body.birthday,
      req.body.phone,
      req.body.email,
    ]
  )

  res.json()
})

router.post('/setting-password', async (req, res) => {
  // read username and password from request body
  const { password, newpassord } = req.body
  console.log(req.body)
  const hashedPassword = await argon2.hash(req.body.newpassword)
  console.log(hashedPassword)
  let result = await pool.execute(
    'UPDATE users SET password = ? WHERE email = ?;',
    [hashedPassword, req.body.email]
  )
  res.json()
})

router.get('/logout', authenticateJWT, (req, res) => {
  refreshTokens = refreshTokens.filter((t) => t !== req.cookies.accessToken)

  // clear refresh token Cookie
  // now in react state !
  // res.clearCookie('accessToken', { httpOnly: true })
  res.clearCookie('refreshToken', { httpOnly: true })

  res.json({ message: 'Logout successful' })
})

// check login
router.get('/check-login', authenticateJWT, (req, res) => {
  res.json({ message: 'login' })
})

module.exports = router
