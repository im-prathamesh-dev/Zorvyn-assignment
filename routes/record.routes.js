const express = require("express");
const router = express.Router();
const { 
  createRecord, 
  getRecords, 
  updateRecord, 
  deleteRecord,
  getSummary
} = require("../controllers/record.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.use(authMiddleware);

router.get("/summary", roleMiddleware("viewer", "analyst", "admin"), getSummary);

router.post("/", roleMiddleware("admin"), createRecord);
router.get("/", roleMiddleware("analyst", "admin"), getRecords);

router.put("/:id", roleMiddleware("admin"), updateRecord);
router.delete("/:id", roleMiddleware("admin"), deleteRecord);

module.exports = router;
