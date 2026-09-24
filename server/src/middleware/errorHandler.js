const AppError = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(new AppError('Not found', 404));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({
      success: false,
      message: first ? first.message : 'Validation error'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid identifier'
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? 'Something went wrong' : err.message || 'Something went wrong';

  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = { errorHandler, notFoundHandler };
