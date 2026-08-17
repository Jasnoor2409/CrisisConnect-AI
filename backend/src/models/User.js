import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must not exceed 60 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true, // normalise before storing
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Please enter a valid email address',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // password is selected: false so it is never returned in queries by default
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['citizen', 'responder', 'admin'],
        message: 'Role must be citizen, responder, or admin',
      },
      default: 'citizen',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ── Pre-save hook: hash password only when it has been modified ───────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password to the stored hash ────────────────
// (Not used in registration, but scaffolded for login feature later)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
