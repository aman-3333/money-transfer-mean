const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, getCaptcha } = require('../controllers/authController.js');

router.get('/captcha', getCaptcha);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/register2', registerUser);
module.exports = router;
