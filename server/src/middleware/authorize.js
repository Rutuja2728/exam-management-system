const AppError = require('../utils/AppError');
const { ROLES } = require('../models/User');

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}

const requireAdmin = requireRole(ROLES.ADMIN);
const requireStudent = requireRole(ROLES.STUDENT);

module.exports = { requireAdmin, requireStudent, requireRole };
