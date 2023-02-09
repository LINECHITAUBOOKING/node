const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.get('/:URLkeyword', async (req, res) => {
  let keyword = req.params.URLkeyword //r=台北+n=客家&風箏 //r=none&n=none
  // console.log(keyword)

  const keywordArr = keyword.split('+') //[r=台北,n=客家&風箏] //[r=none,n=none]
  // console.log(keywordArr)

  const regionKeyword = keywordArr[0].slice(2)
  // console.log('地名 keyword:', regionKeyword)

  const rawNameKeyword = keywordArr[1].slice(2).split('&') // [客家,風箏] //[none]
  // console.log('關鍵字keyword:', rawNameKeyword)

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

  // SELECT TRIP.trip_id,TRIP.trip_name,PLAN.price_adu,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIP.comment_grade,TRIP.comment_amount,LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow  FROM `trip_event` AS TRIP JOIN `trip_service_list` AS LIST ON TRIP.trip_id = LIST.trip_id JOIN `trip_plan` AS PLAN ON TRIP.trip_id = PLAN.master WHERE region = "台北" AND (trip_name LIKE "%陽明山%")
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
    res.json([{ 出現預料條件之外的錯誤: '哭阿' }])
  }
})

module.exports = router
