const express = require("express");
const router = express.Router();
// internal import
const { getLogin, login, logout } = require("../controllers/loginController");
const {
  doLoginValidators,
  loginValidationHandler,
} = require("../middleware/common/login/loginValidators");
const checkLogin = require("../middleware/common/checkLogin");

router.get("/:userId", checkLogin, getLogin);
router.post("/", doLoginValidators, loginValidationHandler, login);
router.delete("/", logout);

module.exports = router;
