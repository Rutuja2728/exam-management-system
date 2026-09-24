const { User, ROLES } = require('../models/User');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

async function registerUser(payload) {
  const role = payload.role || ROLES.STUDENT;

  if (role === ROLES.ADMIN) {
    throw new AppError('Admin registration is not allowed', 403);
  }

  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already exists', 409);
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role,
    academicYear: payload.academicYear || null,
    section: payload.section || null
  });

  const token = signToken(user);
  return { user: user.toSafeObject(), token };
}

async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const matches = await user.comparePassword(password);
  if (!matches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user);
  return { user: user.toSafeObject(), token };
}

module.exports = { registerUser, loginUser };
