const request = require('supertest');
const { getApp, createAdmin, createStudent, createExam } = require('./helpers');

describe('Authentication', () => {
  test('login succeeds for valid credentials', async () => {
    await createAdmin();
    const res = await request(getApp()).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Admin@123'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  test('invalid authentication is rejected', async () => {
    await createAdmin();
    const res = await request(getApp()).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'wrong'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('invalid JWT is rejected', async () => {
    const res = await request(getApp())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-valid-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  test('student cannot access admin endpoints', async () => {
    await createStudent();
    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'student.a@example.com',
      password: 'Student@123'
    });

    const res = await request(getApp())
      .get('/api/admin/exams')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  test('admin cannot access student-only endpoints', async () => {
    await createAdmin();
    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Admin@123'
    });

    const res = await request(getApp())
      .get('/api/student/exams')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(403);
  });
});

describe('Admin exam CRUD and validation', () => {
  async function adminToken() {
    await createAdmin();
    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Admin@123'
    });
    return login.body.data.token;
  }

  const validExam = {
    subject: 'DBMS',
    academicYear: '2nd Year',
    section: 'A',
    examDate: '2026-10-10',
    startTime: '10:00',
    endTime: '12:00'
  };

  test('admin can create an exam', async () => {
    const token = await adminToken();
    const res = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send(validExam);

    expect(res.status).toBe(201);
    expect(res.body.data.subject).toBe('DBMS');
    expect(res.body.data.status).toBe('SCHEDULED');
  });

  test('admin can update an exam', async () => {
    const token = await adminToken();
    const created = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send(validExam);

    const res = await request(getApp())
      .put(`/api/admin/exams/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validExam, subject: 'Operating Systems' });

    expect(res.status).toBe(200);
    expect(res.body.data.subject).toBe('Operating Systems');
  });

  test('admin can cancel an exam', async () => {
    const token = await adminToken();
    const created = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send(validExam);

    const res = await request(getApp())
      .patch(`/api/admin/exams/${created.body.data._id}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  test('missing subject is rejected', async () => {
    const token = await adminToken();
    const { subject, ...rest } = validExam;
    const res = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send(rest);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Subject is required');
  });

  test('missing date is rejected', async () => {
    const token = await adminToken();
    const { examDate, ...rest } = validExam;
    const res = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send(rest);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Exam date is required');
  });

  test('end time before start time is rejected', async () => {
    const token = await adminToken();
    const res = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validExam, startTime: '10:00', endTime: '09:00' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('End time must be later than start time');
  });

  test('end time equal to start time is rejected', async () => {
    const token = await adminToken();
    const res = await request(getApp())
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validExam, startTime: '10:00', endTime: '10:00' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('End time must be later than start time');
  });
});

describe('Student timetable filtering (security)', () => {
  test('student retrieves only matching year and section', async () => {
    await createStudent({ email: 'student.a@example.com', academicYear: '2nd Year', section: 'A' });
    await createExam({ subject: 'Exam 1', academicYear: '2nd Year', section: 'A' });
    await createExam({ subject: 'Exam 2', academicYear: '2nd Year', section: 'B' });
    await createExam({ subject: 'Exam 3', academicYear: '1st Year', section: 'A' });

    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'student.a@example.com',
      password: 'Student@123'
    });

    const res = await request(getApp())
      .get('/api/student/exams')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subject).toBe('Exam 1');
  });

  test('query parameters cannot override student year or section', async () => {
    await createStudent({ email: 'student.a@example.com', academicYear: '2nd Year', section: 'A' });
    await createExam({ subject: 'Exam 1', academicYear: '2nd Year', section: 'A' });
    await createExam({ subject: 'Exam 2', academicYear: '2nd Year', section: 'B' });
    await createExam({ subject: 'Exam 3', academicYear: '1st Year', section: 'A' });

    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'student.a@example.com',
      password: 'Student@123'
    });

    const res = await request(getApp())
      .get('/api/student/exams?academicYear=2nd%20Year&section=B')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subject).toBe('Exam 1');
    expect(res.body.data.some((exam) => exam.subject === 'Exam 2')).toBe(false);
  });

  test('student missing academic year or section is rejected', async () => {
    const student = await createStudent({ email: 'student.missing@example.com' });
    const { User } = require('../src/models/User');
    await User.updateOne({ _id: student._id }, { $unset: { academicYear: 1, section: 1 } });

    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'student.missing@example.com',
      password: 'Student@123'
    });

    const res = await request(getApp())
      .get('/api/student/exams')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Student academic year or section is missing');
  });

  test('empty timetable returns a friendly message', async () => {
    await createStudent({
      email: 'student.empty@example.com',
      academicYear: '3rd Year',
      section: 'C'
    });

    const login = await request(getApp()).post('/api/auth/login').send({
      email: 'student.empty@example.com',
      password: 'Student@123'
    });

    const res = await request(getApp())
      .get('/api/student/exams')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toBe('No exams scheduled for your section.');
  });
});
