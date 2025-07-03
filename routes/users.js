const express = require("express");
const {
  getAllUsers,
  getSingleUserById,
  deleteUser,
  updateUserById,
  createNewUser,
  getSubscriptionDetailsById,
} = require("../controllers/user-controller");

const router = express.Router();

router.get("/", getAllUsers);

router.get("/subscription-details/:id", getSubscriptionDetailsById);

router.get("/:id", getSingleUserById);

router.post("/", createNewUser);

router.put("/:id", updateUserById);

router.delete("/:id", deleteUser);

module.exports = router;
