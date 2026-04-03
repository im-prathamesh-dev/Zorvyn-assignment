const express = require("express");
const router = express.Router();
const { getAllUsers, updateUserRole, updateUserStatus, createUser } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// All user routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.post("/", createUser);
router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole);
router.put("/:id/status", updateUserStatus);

module.exports = router;
