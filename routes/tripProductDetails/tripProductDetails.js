const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.get('/:URLkeyword', async (req, res) => {
  let keyword = req.params.URLkeyword //旅遊行程的名字 trip_name

  //! 準備不同的sql
  //const commentSql
  const tripSql = `
  SELECT 
  TRIP.trip_id,TRIP.trip_name,TRIP.address,TRIP.geo_locationX,geo_locationY,TRIP.region,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIP.comment_grade,TRIP.comment_amount,
  LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow 
  FROM trip_event AS TRIP JOIN trip_service_list AS LIST ON TRIP.trip_id = LIST.trip_id WHERE trip_name = ?`

  const planSql = `
  SELECT 
  PLAN.plan_id,PLAN.plan_name,PLAN.plan_content,PLAN.notice,PLAN.price_adu,PLAN.price_eld,PLAN.price_chi,PLAN.amount_adu,PLAN.amount_eld,PLAN.amount_chi,PLAN.start_date,PLAN.end_date,PLAN.exception_date 
  FROM trip_plan AS PLAN WHERE PLAN.master_trip_name = ?`

  // let [commentSql]
  let [tripResults] = await pool.execute(tripSql, [keyword])
  let [planResults] = await pool.execute(planSql, [keyword])
  let finalResults = [tripResults, planResults]
  res.json(finalResults)
})

module.exports = router
