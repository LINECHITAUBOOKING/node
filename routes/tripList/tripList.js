const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.get('/:URLkeyword', async (req, res) => {
  let keyword = req.params.URLkeyword //r=台北+n=客家&風箏 //r=none&n=none
  // console.log(keyword)

  const keywordArr = keyword.split('+') //[r=台北,n=客家&風箏] //[r=none,n=none]
  // console.log(keywordArr)

  const regionKeyword = keywordArr[0] !== 'r=none' ? keywordArr[0].slice(2) : ''
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

  // SELECT TRIP.trip_id,TRIP.trip_name,PLAN.price_adu,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIP.comment_grade,TRIP.comment_amount,LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow
  // FROM `trip_event` AS TRIP JOIN `trip_service_list` AS LIST ON TRIP.trip_id = LIST.trip_id JOIN `trip_plan` AS PLAN ON TRIP.trip_id = PLAN.master WHERE region = "台北" AND (trip_name LIKE "%陽明山%")
  const preparedParamsArr = countParams()
  const preparedParams = preparedParamsArr.toString().replaceAll(',', ' ')

  console.log('PPArr', preparedParamsArr)
  console.log('preparedParams', preparedParams)
  console.log('regionKeyword', regionKeyword)
  console.log('ReadyNameKeyword', ReadyNameKeyword)

  // const normalSql = `SELECT * FROM trip_event  WHERE region = ? AND (trip_name LIKE ${preparedParams})`
  // const nameOnlySql = `SELECT * FROM trip_event WHERE trip_name LIKE ${preparedParams}`
  // const regionOnlySql = `SELECT * FROM trip_event WHERE region = ?`
  const normalSql = `SELECT TRIP.trip_id,TRIP.trip_name,PLAN.master,PLAN.price_adu,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIp.comment_grade,TRIP.comment_amount,LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow 
  FROM trip_event AS TRIP JOIN trip_service_list AS LIST ON TRIP.trip_id = LIST.trip_id JOIN trip_plan AS PLAN ON TRIP.trip_id = PLAN.master WHERE region = ? AND (TRIP.trip_name LIKE ${preparedParams})`

  const nameOnlySql = `SELECT TRIP.trip_id,TRIP.trip_name,PLAN.master,PLAN.price_adu,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIp.comment_grade,TRIP.comment_amount,LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow 
  FROM trip_event AS TRIP JOIN trip_service_list AS LIST ON TRIP.trip_id = LIST.trip_id JOIN trip_plan AS PLAN ON TRIP.trip_id = PLAN.master WHERE TRIP.trip_name LIKE ${preparedParams}`

  const regionOnlySql = `SELECT TRIP.trip_id,TRIP.trip_name,PLAN.master,PLAN.price_adu,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIp.comment_grade,TRIP.comment_amount,LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow 
  FROM trip_event AS TRIP JOIN trip_service_list AS LIST ON TRIP.trip_id = LIST.trip_id JOIN trip_plan AS PLAN ON TRIP.trip_id = PLAN.master WHERE region = ?`

  const allSql = `SELECT TRIP.trip_id,TRIP.trip_name,PLAN.master,PLAN.price_adu,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIp.comment_grade,TRIP.comment_amount,LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow 
  FROM trip_event AS TRIP JOIN trip_service_list AS LIST ON TRIP.trip_id = LIST.trip_id JOIN trip_plan AS PLAN ON TRIP.trip_id = PLAN.master `

  //沒關鍵字 或 關鍵字為 all ->搜尋全部
  if (
    keyword === 'all' &&
    regionKeyword === '' &&
    ReadyNameKeyword[0] === '%none'
  ) {
    let [results] = await pool.execute(allSql)
    let filteredResult = results.filter(
      (plan, index) =>
        index === results.findIndex((other) => plan.master === other.master)
    )

    res.json(filteredResult)
  }
  // 搜尋地名+關鍵字
  else if (regionKeyword && ReadyNameKeyword[0] !== '%none%') {
    let [results] = await pool.execute(normalSql, [
      regionKeyword,
      ...ReadyNameKeyword,
    ])
    let filteredResult = results.filter(
      (plan, index) =>
        index === results.findIndex((other) => plan.master === other.master)
    )
    res.json(filteredResult)
  }
  //搜尋 關鍵字沒地名
  else if (regionKeyword === '' && ReadyNameKeyword[0] !== '%none%') {
    let [results] = await pool.execute(nameOnlySql, [...ReadyNameKeyword])
    let filteredResult = results.filter(
      (plan, index) =>
        index === results.findIndex((other) => plan.master === other.master)
    )
    res.json(filteredResult)
  }
  //搜尋 地名 沒關鍵字
  else if (regionKeyword !== '' && ReadyNameKeyword[0] === '%none%') {
    let [results] = await pool.execute(regionOnlySql, [regionKeyword])
    let filteredResult = results.filter(
      (plan, index) =>
        index === results.findIndex((other) => plan.master === other.master)
    )
    res.json(filteredResult)
  } else {
    res.json([{ 出現預料條件之外的錯誤: '哭阿' }])
  }
})

module.exports = router
