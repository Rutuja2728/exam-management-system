const { User } = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Unauthorized', 401);
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError('Unauthorized', 401);
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
