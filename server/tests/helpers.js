process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../src/app');
const { User, ROLES } = require('../src/models/User');
const { Exam, EXAM_STATUS } = require('../src/models/Exam');

let mongoServer;
let app;

jest.setTimeout(120000);

beforeAll(async () => {
  // Prefer an explicit test URI when MongoMemoryServer binary download is unavailable.
  const uri = process.env.TEST_MONGODB_URI;
  if (uri) {
    await mongoose.connect(uri);
  } else {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
  app = createApp();
}, 300000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 120000);

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

async function createAdmin() {
  return User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: ROLES.ADMIN
  });
}

async function createStudent(overrides = {}) {
  return User.create({
    name: overrides.name || 'Rahul Sharma',
    email: overrides.email || 'student.a@example.com',
    password: overrides.password || 'Student@123',
    role: ROLES.STUDENT,
    academicYear: overrides.academicYear === undefined ? '2nd Year' : overrides.academicYear,
    section: overrides.section === undefined ? 'A' : overrides.section
  });
}

async function createExam(overrides = {}) {
  return Exam.create({
    subject: overrides.subject || 'Database Management Systems',
    academicYear: overrides.academicYear || '2nd Year',
    section: overrides.section || 'A',
    examDate: overrides.examDate || new Date('2026-10-10'),
    startTime: overrides.startTime || '10:00',
    endTime: overrides.endTime || '12:00',
    status: overrides.status || EXAM_STATUS.SCHEDULED
  });
}

module.exports = {
  getApp: () => app,
  createAdmin,
  createStudent,
  createExam
};
