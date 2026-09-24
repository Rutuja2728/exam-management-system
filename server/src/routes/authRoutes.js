const express = require('express');
const { login, register, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { loginValidators, registerValidators } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.get('/me', authenticate, me);

module.exports = router;
