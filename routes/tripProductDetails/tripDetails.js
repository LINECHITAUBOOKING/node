const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.get('/:URLkeyword', async (req, res) => {
  let keyword = req.params.URLkeyword //旅遊行程的名字 trip_name

  const tripSql = `
  SELECT 
  TRIP.trip_id,TRIP.trip_name,TRIP.address,TRIP.geo_locationX,geo_locationY,TRIP.region,TRIP.introduction,TRIP.intro_pic,TRIP.pic_intro,TRIP.all_pic,TRIP.comment_grade,TRIP.comment_amount,
  LIST.culture_history,LIST.amusement,LIST.meal,LIST.no_shopping,LIST.self_trip,LIST.guide_trip,LIST.mountain,LIST.in_water,LIST.snow 
  FROM trip_event AS TRIP JOIN trip_service_list AS LIST ON TRIP.trip_id = LIST.trip_id WHERE trip_name = ?`

  let [tripResults] = await pool.execute(tripSql, [keyword])

  res.json(tripResults)
})

module.exports = router
