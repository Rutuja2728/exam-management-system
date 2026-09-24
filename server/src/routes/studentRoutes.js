const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requireStudent } = require('../middleware/authorize');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.use(authenticate, requireStudent);

router.get('/profile', studentController.getProfile);
router.get('/exams', studentController.getExams);

module.exports = router;
