const express = require('express')
const router = express.Router()
const pool = require('../../utils/db')

router.get('/:URLkeyword/plans', async (req, res) => {
  let keyword = req.params.URLkeyword //旅遊行程的名字 trip_name

  const planSql = `
  SELECT 
  PLAN.plan_id,PLAN.plan_name,PLAN.plan_content,PLAN.plan_notice,PLAN.price_adu,PLAN.price_eld,PLAN.price_chi,PLAN.amount_adu,PLAN.amount_eld,PLAN.amount_chi,PLAN.start_date,PLAN.end_date,PLAN.exception_date 
  FROM trip_plan AS PLAN WHERE PLAN.master_trip_name = ?`

  let [planResults] = await pool.execute(planSql, [keyword])

  res.json(planResults)
})

module.exports = router
