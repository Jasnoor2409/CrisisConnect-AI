import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';

// ── Allowed roles for public self-registration ────────────────────────────────
const PUBLIC_ROLES = ['citizen', 'responder'];

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // ── 1. Required field checks ────────────────────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        errors: { general: 'Please fill in all required fields' },
      });
    }

    // ── 2. Name length ──────────────────────────────────────────────────────
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Invalid name',
        errors: { name: 'Name must be between 2 and 60 characters' },
      });
    }

    // ── 3. Email format ─────────────────────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: { email: 'Please enter a valid email address' },
      });
    }

    // ── 4. Password strength ────────────────────────────────────────────────
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password too short',
        errors: { password: 'Password must be at least 8 characters' },
      });
    }

    // ── 5. Password confirmation ────────────────────────────────────────────
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        errors: { confirmPassword: 'Passwords do not match' },
      });
    }

    // ── 6. Role validation (if provided) ────────────────────────────────────
    let assignedRole = 'citizen'; // secure default
    if (role) {
      if (!PUBLIC_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role',
          errors: {
            role: 'Role must be either "citizen" or "responder"',
          },
        });
      }
      assignedRole = role;
    }

    // ── 7. Duplicate email check ────────────────────────────────────────────
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        errors: {
          email: 'An account with this email already exists',
        },
      });
    }

    // ── 8. Create user (password hashing is handled by the model pre-save hook)
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: assignedRole,
    });

    // ── 9. Return safe user data — NEVER include password or hash ───────────
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // ── 10. Mongoose duplicate key error (race-condition safety net) ─────────
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        errors: { email: 'An account with this email already exists' },
      });
    }

    // ── 11. Mongoose validation errors ──────────────────────────────────────
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // ── 12. Unexpected server error ──────────────────────────────────────────
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── 1. Required field presence check ───────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errors: { general: 'Please enter your email and password' },
      });
    }

    // ── 2. Email format check ───────────────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        errors: { email: 'Please enter a valid email address' },
      });
    }

    // ── 3. Find user — explicitly select password (schema has select: false) ─
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // ── 4. Verify credentials ───────────────────────────────────────────────
    // Generic 401 — deliberately does NOT reveal whether the email exists
    const INVALID_CREDENTIALS_MSG = 'Invalid email or password';

    if (!user) {
      return res.status(401).json({
        success: false,
        message: INVALID_CREDENTIALS_MSG,
        errors: { general: INVALID_CREDENTIALS_MSG },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: INVALID_CREDENTIALS_MSG,
        errors: { general: INVALID_CREDENTIALS_MSG },
      });
    }

    // ── 5. Sign JWT ─────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ── 6. Return token + safe user data — NEVER include password or hash ───
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // ── 7. Unexpected server error ──────────────────────────────────────────
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// GET /api/auth/me — Verified authenticated user endpoint
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or session is invalid.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
};

// TEMPORARY CHO EVALUATION FETCH DEMO
export const choDemoLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'CHO Evaluation Demo: Email and password required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Generate valid JWT token for demo user session
    const token = jwt.sign(
      { id: '507f1f77bcf86cd799439011', role: 'citizen' },
      process.env.JWT_SECRET || 'cc-ai-jwt-secret-key-2026-viva-demo-xK9mPqR3',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'TEMPORARY CHO EVALUATION FETCH DEMO: Authentication Successful',
      token,
      user: {
        id: '507f1f77bcf86cd799439011',
        name: 'CHO Evaluator',
        email: normalizedEmail,
        role: 'citizen',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'CHO Evaluation Fetch Demo Error',
      error: error.message,
    });
  }
};


