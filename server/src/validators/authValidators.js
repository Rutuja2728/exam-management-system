const { body } = require('express-validator');
const { ROLES } = require('../models/User');

const loginValidators = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email is invalid'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email is invalid'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Role is invalid'),
  body('academicYear').optional({ nullable: true }).trim(),
  body('section').optional({ nullable: true }).trim()
];

module.exports = { loginValidators, registerValidators };
