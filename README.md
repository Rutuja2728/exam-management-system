# Exam Management System — Basic Exam Timetable

A simple production-quality exam timetable application. Admins create and manage exams. Students see **only** the exams that match their stored academic year **and** section.

## Project Overview

Colleges need a reliable way to publish exam schedules without leaking another section’s timetable. This system stores users and exams in MongoDB, authenticates with JWT, and filters student timetables on the **server** using the authenticated student’s profile.

## Features

### Admin

- Login
- Dashboard counts (total, scheduled, cancelled, upcoming)
- Create, list, filter, edit, cancel, and delete exams
- Server-side validation for required fields and exam times

### Student

- Login
- View profile (name, email, academic year, section)
- View **their** exam timetable only

Students cannot request another year or section by changing query parameters.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, CSS
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Validation: express-validator
- Tests: Jest, Supertest, mongodb-memory-server

## Architecture

```text
React (Vite)  →  Express REST API  →  MongoDB
```

The browser never talks to MongoDB directly. All authorization and timetable filtering happen in Express.

## Database Models

### User

| Field | Notes |
| --- | --- |
| name | required |
| email | unique, required |
| password | bcrypt hash, never stored as plain text |
| role | `ADMIN` or `STUDENT` |
| academicYear | required for students, optional for admin |
| section | required for students, optional for admin |
| createdAt / updatedAt | timestamps |

### Exam

| Field | Notes |
| --- | --- |
| subject | required |
| academicYear | required |
| section | required |
| examDate | required |
| startTime | `HH:mm`, required |
| endTime | `HH:mm`, required, must be later than start time |
| status | `SCHEDULED` or `CANCELLED` |
| createdAt / updatedAt | timestamps |

## Authentication

- `POST /api/auth/login` returns a JWT.
- The token payload contains `userId` and `role`.
- Protected routes send `Authorization: Bearer <token>`.
- `GET /api/auth/me` returns the current user.
- `POST /api/auth/register` is a demo helper that can create **students only**.

Passwords are hashed with bcrypt before save.

## Authorization

- `authenticate` loads the user from the JWT.
- `requireAdmin` protects `/api/admin/*`.
- `requireStudent` protects `/api/student/*`.
- Students receive **403 Forbidden** on admin APIs.
- Admins receive **403 Forbidden** on student APIs.
- Invalid or missing JWT returns **401 Unauthorized**.

React route guards exist for UX. They are **not** a security boundary.

## Critical filtering logic

Student timetable lookup **ignores** `?academicYear=` and `?section=` from the client.

```js
const student = req.user; // from JWT, not from query params

const exams = await Exam.find({
  academicYear: student.academicYear,
  section: student.section
}).sort({ examDate: 1, startTime: 1 });
```

A student in `2nd Year` / `Section A` only receives exams for that pair. `2nd Year B`, `1st Year A`, and other combinations are never returned.

If academic year or section is missing on the student record, the API returns **400** with:

`Student academic year or section is missing`

If no exams match, the API returns:

```json
{
  "success": true,
  "data": [],
  "message": "No exams scheduled for your section."
}
```

## API Documentation

Base URL (local): `http://localhost:5000/api`

### Auth

#### `POST /api/auth/login`

```json
{ "email": "admin@example.com", "password": "Admin@123" }
```

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "System Admin", "role": "ADMIN" }
  }
}
```

#### `POST /api/auth/register`

Creates a student account (demo). Admin role is rejected.

#### `GET /api/auth/me`

Requires JWT. Returns the authenticated user.

### Admin exams (JWT + ADMIN)

#### `POST /api/admin/exams`

```json
{
  "subject": "Database Management Systems",
  "academicYear": "2nd Year",
  "section": "A",
  "examDate": "2026-10-10",
  "startTime": "10:00",
  "endTime": "12:00"
}
```

Missing fields return **400**, for example `{ "success": false, "message": "Subject is required" }`.

End time must be strictly later than start time.

#### `GET /api/admin/exams`

Optional query: `academicYear`, `section`, `date`, `status`.

#### `GET /api/admin/exams/:id`

#### `PUT /api/admin/exams/:id`

Same body as create.

#### `PATCH /api/admin/exams/:id/cancel`

Sets `status` to `CANCELLED` (soft cancel).

#### `DELETE /api/admin/exams/:id`

Permanently removes the record.

#### `GET /api/admin/dashboard`

Returns `{ total, scheduled, cancelled, upcoming }`.

### Student (JWT + STUDENT)

#### `GET /api/student/profile`

```json
{
  "success": true,
  "data": {
    "name": "Rahul Sharma",
    "email": "student.a@example.com",
    "academicYear": "2nd Year",
    "section": "A"
  }
}
```

#### `GET /api/student/exams`

Uses the authenticated student’s year and section only. Query parameters cannot override this.

## Setup

### 1. Clone or copy the project

```bash
cd exam-management-system
npm install
```

Then install each workspace:

```bash
cd server
npm install
cd ../client
npm install
```

From the repository root you can also run:

```bash
npm run install:all
```

### 2. MongoDB

Use a local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas).

Copy environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

On macOS/Linux use `cp`.

### 3. Environment variables

`server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/exam_management
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=http://localhost:5173
```

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit real secrets. `.env` is gitignored.

### 4. Seed demo data

With MongoDB running:

```bash
cd server
npm run seed
```

### 5. Run the app

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Or from the root after installing `concurrently`:

```bash
npm install
npm run install:all
npm run dev
```

- API: http://localhost:5000
- App: http://localhost:5173

### 6. Tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB and do not need your local database.

### 7. Production frontend build

```bash
cd client
npm run build
```

## Demo Credentials

| Role | Email | Password | Year / Section |
| --- | --- | --- | --- |
| Admin | admin@example.com | Admin@123 | — |
| Student A (Rahul Sharma) | student.a@example.com | Student@123 | 2nd Year / A |
| Student B (Priya Patil) | student.b@example.com | Student@123 | 2nd Year / B |

Seeded exams include **2nd Year A**, **2nd Year B**, and **1st Year A** so you can confirm filtering immediately.

Rahul must see 2nd Year A exams only, even if a client calls:

`GET /api/student/exams?academicYear=2nd%20Year&section=B`

## Deployment

- Frontend → Vercel (`client/`, framework Vite). Set `VITE_API_URL` to the public API URL (include `/api`). `client/vercel.json` rewrites SPA routes.
- Backend → Render or Railway (`server/`, start command `npm start`). Use `server/render.yaml` as a starting point.
- Database → MongoDB Atlas.

Backend production variables:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL` (the deployed Vercel origin)

Allow the frontend origin in CORS via `CLIENT_URL`.

## Project structure

```text
exam-management-system/
├── client/
├── server/
├── README.md
├── .gitignore
└── package.json
```
#   e x a m - m a n a g e m e n t - s y s t e m  
 