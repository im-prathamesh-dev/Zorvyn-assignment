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

// Protect all record routes with auth
router.use(authMiddleware);

// Analytics/Summary route (Dashboard Data)
// Note: Must be above /:id route!
router.get("/summary", roleMiddleware("viewer", "analyst", "admin"), getSummary);

// Base records routes
router.post("/", roleMiddleware("admin"), createRecord);
router.get("/", roleMiddleware("analyst", "admin"), getRecords);

// Specific record routes
router.put("/:id", roleMiddleware("admin"), updateRecord);
router.delete("/:id", roleMiddleware("admin"), deleteRecord);

module.exports = router;
