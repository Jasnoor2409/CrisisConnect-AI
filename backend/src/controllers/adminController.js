/**
 * Admin Controller — CrisisConnect AI
 *
 * Feature 16: Admin Dashboard backend.
 * Provides statistical summaries and oversight capabilities.
 *
 * CHO Lectures:
 *   - 13: reduce() for aggregation
 *   - 56: CRUD, REST, HTTP status codes
 *   - 59: Mongoose population and aggregation
 */

import Incident from '../models/Incident.js';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats — Platform-wide statistics (admin only)
// CHO Lecture 13: Higher-order functions (reduce, map, filter) on real data
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    // Run all queries in parallel (CHO Lecture 27: Promise.all)
    const [
      totalIncidents,
      statusCounts,
      severityCounts,
      categoryCounts,
      recentIncidents,
      totalUsers,
      userRoleCounts,
      resolvedToday,
    ] = await Promise.all([
      // Total incidents count
      Incident.countDocuments(),

      // Status breakdown using MongoDB aggregation
      Incident.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Severity breakdown
      Incident.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Category breakdown
      Incident.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // 10 most recent incidents with reporter info
      Incident.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email role')
        .lean(),

      // Total users
      User.countDocuments(),

      // User role breakdown
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // Incidents resolved today
      Incident.countDocuments({
        status: 'resolved',
        resolvedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    // ── Transform aggregation results into clean objects ──────────────────────
    // CHO Lecture 13: reduce() — turn array of {_id, count} into a flat object
    const statusMap = statusCounts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const severityMap = severityCounts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const categoryMap = categoryCounts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const roleMap = userRoleCounts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        incidents: {
          total: totalIncidents,
          byStatus: statusMap,
          bySeverity: severityMap,
          byCategory: categoryMap,
          resolvedToday,
        },
        users: {
          total: totalUsers,
          byRole: roleMap,
        },
        recentIncidents,
      },
    });
  } catch (error) {
    console.error('Admin Stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching admin statistics.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users — List all users (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.role && ['citizen', 'responder', 'admin'].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')      // Never return password hash
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    console.error('Get All Users error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/users/:userId/role — Change a user's role (admin only)
// No public admin registration — admins promote users here.
// ─────────────────────────────────────────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const VALID_ROLES = ['citizen', 'responder', 'admin'];
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
      });
    }

    // Prevent admin from demoting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot change their own role through this endpoint.',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Update User Role error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating user role.' });
  }
};
