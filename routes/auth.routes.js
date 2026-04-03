const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Public routes (no authentication required)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (authentication + role-based access)
router.use(authMiddleware);
router.post("/admin/register", roleMiddleware("admin"), (req, res) => {
  res.json({ message: "Admin endpoint" });
});

module.exports = router;