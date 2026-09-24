const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
  examBodyValidators,
  examIdValidator,
  examListQueryValidators
} = require('../validators/examValidators');
const adminExamController = require('../controllers/adminExamController');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminExamController.getDashboard);
router.post('/exams', examBodyValidators, validate, adminExamController.createExam);
router.get('/exams', examListQueryValidators, validate, adminExamController.getExams);
router.get('/exams/:id', examIdValidator, validate, adminExamController.getExam);
router.put('/exams/:id', examIdValidator, examBodyValidators, validate, adminExamController.updateExam);
router.patch('/exams/:id/cancel', examIdValidator, validate, adminExamController.cancelExam);
router.delete('/exams/:id', examIdValidator, validate, adminExamController.deleteExam);

module.exports = router;
