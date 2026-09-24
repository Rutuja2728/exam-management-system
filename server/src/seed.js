require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('./config/db');
const { User, ROLES } = require('./models/User');
const { Exam, EXAM_STATUS } = require('./models/Exam');

async function seed() {
  await connectDatabase();

  // Intentional recreate so demo credentials stay predictable.
  await User.deleteMany({});
  await Exam.deleteMany({});

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: ROLES.ADMIN
  });

  const studentA = await User.create({
    name: 'Rahul Sharma',
    email: 'student.a@example.com',
    password: 'Student@123',
    role: ROLES.STUDENT,
    academicYear: '2nd Year',
    section: 'A'
  });

  const studentB = await User.create({
    name: 'Priya Patil',
    email: 'student.b@example.com',
    password: 'Student@123',
    role: ROLES.STUDENT,
    academicYear: '2nd Year',
    section: 'B'
  });

  await Exam.insertMany([
    {
      subject: 'Database Management Systems',
      academicYear: '2nd Year',
      section: 'A',
      examDate: new Date('2026-10-10'),
      startTime: '10:00',
      endTime: '12:00',
      status: EXAM_STATUS.SCHEDULED
    },
    {
      subject: 'Operating Systems',
      academicYear: '2nd Year',
      section: 'B',
      examDate: new Date('2026-10-11'),
      startTime: '10:00',
      endTime: '12:00',
      status: EXAM_STATUS.SCHEDULED
    },
    {
      subject: 'Java Programming',
      academicYear: '1st Year',
      section: 'A',
      examDate: new Date('2026-10-12'),
      startTime: '10:00',
      endTime: '12:00',
      status: EXAM_STATUS.SCHEDULED
    }
  ]);

  console.log('Seed complete');
  console.log('Admin:', admin.email, '/ Admin@123');
  console.log('Student A:', studentA.email, '/ Student@123 — 2nd Year Section A');
  console.log('Student B:', studentB.email, '/ Student@123 — 2nd Year Section B');

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore disconnect errors during failure
  }
  process.exit(1);
});
