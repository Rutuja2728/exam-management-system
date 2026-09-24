const asyncHandler = require('../utils/asyncHandler');
const { loginUser, registerUser } = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body.email, req.body.password);
  res.json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user.toSafeObject()
  });
});

module.exports = { register, login, me };
