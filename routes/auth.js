const express = require('express')
const router = express.Router()
const pool = require('../utils/db')
const argon2 = require('argon2')
const jsonwebtoken = require('jsonwebtoken')
const authenticateJWT = require('../middleware/jwt')

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
      { id: user.id, username: user.username, role: user.role },
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

  if (username) {
    // generate an access token
    const accessToken = jsonwebtoken.sign(
      { id: username.id, username: username.username, role: username.role },
      accessTokenSecret,
      { expiresIn: '60m' }
    )

    // generate an refreshToken token
    const refreshToken = jsonwebtoken.sign(
      { id: username.id, username: username.username, role: username.role },
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
  console.log(email, password)
  // filter user from the users array by username and password
  let [user] = await pool.execute('SELECT * FROM users WHERE email=? ', [email])
  if (user.length === 0) {
    return res.status(401).json({ errors: ['尚未註冊'] })
  }
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
      { id: user.id, username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: '60m' }
    )

    // generate an refreshToken token
    const refreshToken = jsonwebtoken.sign(
      { id: user.id, username: user.username, role: user.role },
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
  const { email, username, password, confirmPassword } = req.body
  const hashedPassword = await argon2.hash(req.body.password)
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
  let result = await pool.execute(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?);',
    [req.body.email, hashedPassword, req.body.username]
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
