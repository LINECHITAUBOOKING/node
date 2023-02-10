const express = require('express')
const router = express.Router()

const pool = require('../../utils/db')

router.get('/TripDetail/trip/:tripId', async (req, res, next) => {
  let [tripDetail] = await pool.query(
    'SELECT trip_event.trip_id,trip_event.trip_name, trip_plan.*  FROM trip_event INNER JOIN trip_plan ON trip_event.trip_id=trip_plan.master  WHERE trip_event.trip_id=? ',
    [req.params.tripId]
  )
  res.json(tripDetail)
})
router.get('/TripDetail/plan/:planId', async (req, res, next) => {
  let [planDetail] = await pool.query(
    'SELECT trip_plan.price_adu,trip_plan.price_eld,trip_plan.price_chi  FROM  trip_plan  WHERE trip_plan.plan_id=? ',
    [req.params.planId]
  )
  res.json(planDetail)
})
module.exports = router
