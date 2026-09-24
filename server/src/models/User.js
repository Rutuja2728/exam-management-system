const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT'
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    academicYear: { type: String, default: null, trim: true },
    section: { type: String, default: null, trim: true }
  },
  { timestamps: true }
);

userSchema.pre('validate', function validateStudentFields(next) {
  if (this.role === ROLES.STUDENT) {
    if (!this.academicYear) {
      this.invalidate('academicYear', 'Academic year is required for students');
    }
    if (!this.section) {
      this.invalidate('section', 'Section is required for students');
    }
  }
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    academicYear: this.academicYear,
    section: this.section,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES };
