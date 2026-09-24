const { Exam, EXAM_STATUS } = require('../models/Exam');
const AppError = require('../utils/AppError');
const { assertEndTimeAfterStart } = require('../utils/time');

function normalizeExamPayload(payload) {
  const examDate = payload.examDate ? new Date(payload.examDate) : null;
  if (examDate && Number.isNaN(examDate.getTime())) {
    throw new AppError('Exam date is invalid', 400);
  }

  try {
    assertEndTimeAfterStart(payload.startTime, payload.endTime);
  } catch (error) {
    throw new AppError(error.message, 400);
  }

  return {
    subject: payload.subject?.trim(),
    academicYear: payload.academicYear?.trim(),
    section: payload.section?.trim(),
    examDate,
    startTime: payload.startTime?.trim(),
    endTime: payload.endTime?.trim()
  };
}

async function createExam(payload) {
  const data = normalizeExamPayload(payload);
  return Exam.create({ ...data, status: EXAM_STATUS.SCHEDULED });
}

async function listExams(filters = {}) {
  const query = {};
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.section) query.section = filters.section;
  if (filters.status) query.status = filters.status;
  if (filters.date) {
    const day = new Date(filters.date);
    if (Number.isNaN(day.getTime())) {
      throw new AppError('Date is invalid', 400);
    }
    const start = new Date(day);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setUTCHours(23, 59, 59, 999);
    query.examDate = { $gte: start, $lte: end };
  }

  return Exam.find(query).sort({ examDate: 1, startTime: 1 });
}

async function getExamById(id) {
  const exam = await Exam.findById(id);
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }
  return exam;
}

async function updateExam(id, payload) {
  const exam = await getExamById(id);
  const data = normalizeExamPayload({
    subject: payload.subject ?? exam.subject,
    academicYear: payload.academicYear ?? exam.academicYear,
    section: payload.section ?? exam.section,
    examDate: payload.examDate ?? exam.examDate,
    startTime: payload.startTime ?? exam.startTime,
    endTime: payload.endTime ?? exam.endTime
  });

  Object.assign(exam, data);
  await exam.save();
  return exam;
}

async function cancelExam(id) {
  const exam = await getExamById(id);
  exam.status = EXAM_STATUS.CANCELLED;
  await exam.save();
  return exam;
}

async function deleteExam(id) {
  const exam = await Exam.findByIdAndDelete(id);
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }
  return exam;
}

async function getStudentTimetable(student) {
  if (!student.academicYear || !student.section) {
    throw new AppError('Student academic year or section is missing', 400);
  }

  const exams = await Exam.find({
    academicYear: student.academicYear,
    section: student.section
  }).sort({ examDate: 1, startTime: 1 });

  return exams;
}

async function getDashboardStats() {
  const [total, scheduled, cancelled, upcoming] = await Promise.all([
    Exam.countDocuments(),
    Exam.countDocuments({ status: EXAM_STATUS.SCHEDULED }),
    Exam.countDocuments({ status: EXAM_STATUS.CANCELLED }),
    Exam.countDocuments({
      status: EXAM_STATUS.SCHEDULED,
      examDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
  ]);

  return { total, scheduled, cancelled, upcoming };
}

module.exports = {
  createExam,
  listExams,
  getExamById,
  updateExam,
  cancelExam,
  deleteExam,
  getStudentTimetable,
  getDashboardStats
};
