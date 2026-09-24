const { body, param, query } = require('express-validator');
const { TIME_PATTERN } = require('../utils/time');
const { EXAM_STATUS } = require('../models/Exam');

const examBodyValidators = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('examDate').notEmpty().withMessage('Exam date is required').isISO8601().withMessage('Exam date is invalid'),
  body('startTime')
    .trim()
    .notEmpty()
    .withMessage('Start time is required')
    .matches(TIME_PATTERN)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .trim()
    .notEmpty()
    .withMessage('End time is required')
    .matches(TIME_PATTERN)
    .withMessage('End time must be in HH:mm format')
];

const examIdValidator = [param('id').isMongoId().withMessage('Invalid exam id')];

const examListQueryValidators = [
  query('academicYear').optional().trim(),
  query('section').optional().trim(),
  query('date').optional().isISO8601().withMessage('Date is invalid'),
  query('status')
    .optional()
    .isIn(Object.values(EXAM_STATUS))
    .withMessage('Status is invalid')
];

module.exports = {
  examBodyValidators,
  examIdValidator,
  examListQueryValidators
};
