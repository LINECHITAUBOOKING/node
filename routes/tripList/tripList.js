const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.get('/:URLkeyword', async (req, res) => {
  let keyword = req.params.URLkeyword //r=台北n=客家&風箏 //r=nonen=none //x=台北x=客家&風箏
  console.log(keyword)

  const keywordArr = keyword.split('x=') //[r,台北?n,客家&風箏] //[r,none,none] //[台北,客家&風箏]
  console.log(keywordArr)

  const regionKeyword = keywordArr[0].slice(0, 2) !== 'no' ? keywordArr[0] : ''

  const rawNameKeyword = keywordArr[1].split('&') // [客家,風箏] //[none]

  let emptyNameKeywordArr = []

  function prepareNameKeyword() {
    rawNameKeyword.forEach((element) => {
      emptyNameKeywordArr.push('%' + element + '%')
    })
    return emptyNameKeywordArr
  }

  const ReadyNameKeyword = prepareNameKeyword()

  let emptyParamArr = []

  function countParams() {
    for (let i = 0; i < ReadyNameKeyword.length; i++) {
      emptyParamArr.push('?')
      emptyParamArr.push('OR')
    }
    emptyParamArr.pop()
    return emptyParamArr
  }

  const preparedParamsArr = countParams()
  const preparedParams = preparedParamsArr.toString().replaceAll(',', ' ')

  console.log('PPArr', preparedParamsArr)
  console.log('preparedParams', preparedParams)
  console.log('regionKeyword', regionKeyword)
  console.log('ReadyNameKeyword', ReadyNameKeyword)

  const normalSql = `SELECT * FROM trip_event  WHERE region = ? AND (trip_name LIKE ${preparedParams})`
  const nameOnlySql = `SELECT * FROM trip_event WHERE trip_name LIKE ${preparedParams}`
  const regionOnlySql = `SELECT * FROM trip_event WHERE region = ?`

  if (keyword === 'all') {
    let [results] = await pool.execute('SELECT * FROM `trip_event`')
    res.json(results)
  } else if (regionKeyword && ReadyNameKeyword[0] !== '%none%') {
    let [results] = await pool.execute(normalSql, [
      regionKeyword,
      ...ReadyNameKeyword,
    ])
    res.json(results)
  } else if (regionKeyword === '' && ReadyNameKeyword[0] !== '%none%') {
    let [results] = await pool.execute(nameOnlySql, [...ReadyNameKeyword])
    console.log()
    res.json(results)
  } else if (regionKeyword !== '' && ReadyNameKeyword[0] === '%none%') {
    let [results] = await pool.execute(regionOnlySql, [regionKeyword])
    res.json(results)
  } else {
    res.json([{ 不同意的請舉手: '沒有' }])
  }
})

module.exports = router
