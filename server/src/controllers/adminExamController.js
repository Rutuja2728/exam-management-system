const asyncHandler = require('../utils/asyncHandler');
const examService = require('../services/examService');

const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body);
  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: exam
  });
});

const getExams = asyncHandler(async (req, res) => {
  const exams = await examService.listExams({
    academicYear: req.query.academicYear,
    section: req.query.section,
    date: req.query.date,
    status: req.query.status
  });
  res.json({ success: true, data: exams });
});

const getExam = asyncHandler(async (req, res) => {
  const exam = await examService.getExamById(req.params.id);
  res.json({ success: true, data: exam });
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Exam updated successfully',
    data: exam
  });
});

const cancelExam = asyncHandler(async (req, res) => {
  const exam = await examService.cancelExam(req.params.id);
  res.json({
    success: true,
    message: 'Exam cancelled successfully',
    data: exam
  });
});

const deleteExam = asyncHandler(async (req, res) => {
  await examService.deleteExam(req.params.id);
  res.json({
    success: true,
    message: 'Exam deleted successfully'
  });
});

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await examService.getDashboardStats();
  res.json({ success: true, data: stats });
});

module.exports = {
  createExam,
  getExams,
  getExam,
  updateExam,
  cancelExam,
  deleteExam,
  getDashboard
};
