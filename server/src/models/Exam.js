const mongoose = require('mongoose');

const EXAM_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CANCELLED: 'CANCELLED'
};

const examSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(EXAM_STATUS),
      default: EXAM_STATUS.SCHEDULED
    }
  },
  { timestamps: true }
);

examSchema.index({ academicYear: 1, section: 1, examDate: 1, startTime: 1 });

const Exam = mongoose.model('Exam', examSchema);

module.exports = { Exam, EXAM_STATUS };
