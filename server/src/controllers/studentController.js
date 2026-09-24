const asyncHandler = require('../utils/asyncHandler');
const examService = require('../services/examService');

const getProfile = asyncHandler(async (req, res) => {
  const { name, email, academicYear, section } = req.user;
  res.json({
    success: true,
    data: { name, email, academicYear, section }
  });
});

const getExams = asyncHandler(async (req, res) => {
  const exams = await examService.getStudentTimetable(req.user);
  const message =
    exams.length === 0 ? 'No exams scheduled for your section.' : 'Exams retrieved successfully';

  res.json({
    success: true,
    data: exams,
    message
  });
});

module.exports = { getProfile, getExams };
