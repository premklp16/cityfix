const Report = require('../models/Report');
const User = require('../models/User');
const Department = require('../models/Department');
const StatusHistory = require('../models/StatusHistory');
const { createNotification } = require('../utils/helpers');

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalReports = await Report.countDocuments();
    const resolvedReports = await Report.countDocuments({ status: 'Resolved' });
    const rejectedReports = await Report.countDocuments({ status: 'Rejected' });
    const openReports = totalReports - resolvedReports - rejectedReports;
    
    const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : 0;

    const categoryDistribution = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const statusDistribution = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const severityDistribution = await Report.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Monthly trends for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        openReports,
        resolvedReports,
        rejectedReports,
        resolutionRate,
        categoryDistribution,
        statusDistribution,
        severityDistribution,
        monthlyTrends,
        recentReports
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.assignReport = async (req, res, next) => {
  try {
    const { reportId, officerId, departmentId } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Verify officer exists and belongs to the department
    const officer = await User.findById(officerId);
    if (!officer) {
      return res.status(404).json({ success: false, error: 'Officer not found' });
    }

    if (officer.role !== 'officer') {
      return res.status(400).json({ success: false, error: 'User is not an officer' });
    }

    if (officer.department.toString() !== departmentId) {
      return res.status(400).json({ success: false, error: 'Officer does not belong to the selected department' });
    }

    const previousStatus = report.status;
    report.assignedTo = officerId;
    report.department = departmentId;
    report.status = 'Assigned';
    await report.save();

    await StatusHistory.create({
      reportId,
      previousStatus,
      newStatus: 'Assigned',
      changedBy: req.user.id,
      note: `Admin assigned report to officer: ${officer.name}`
    });

    if (officerId) {
      await createNotification(
        officerId,
        `You have been assigned a new report: "${report.title}"`,
        'assignment',
        report._id
      );
    }

    const populatedReport = await Report.findById(reportId).populate('assignedTo', 'name').populate('department', 'name');
    res.status(200).json({ success: true, data: populatedReport });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('officers', 'name email');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    await department.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Create or assign officer to department (one officer per department only)
exports.assignOfficerToDepartment = async (req, res, next) => {
  try {
    const { userId, departmentId } = req.body;

    // Verify user exists and is an officer
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role !== 'officer') {
      return res.status(400).json({ success: false, error: 'User must be an officer' });
    }

    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }

    // If officer already assigned to a different department, remove them from the old one
    if (user.department && user.department.toString() !== departmentId) {
      const oldDepartment = await Department.findByIdAndUpdate(
        user.department,
        { $pull: { officers: userId } },
        { new: true }
      );
    }

    // Assign officer to new department
    user.department = departmentId;
    await user.save();

    // Add officer to department's officers list if not already there
    if (!department.officers.includes(userId)) {
      department.officers.push(userId);
      await department.save();
    }

    const populatedDept = await department.populate('officers', 'name email');
    res.status(200).json({ success: true, data: populatedDept });
  } catch (error) {
    next(error);
  }
};

// Get officers by department
exports.getOfficersByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    const officers = await User.find({ 
      department: departmentId, 
      role: 'officer' 
    }).select('name email phone');

    res.status(200).json({ success: true, data: officers });
  } catch (error) {
    next(error);
  }
};

// Remove officer from department
exports.removeOfficerFromDepartment = async (req, res, next) => {
  try {
    const { userId, departmentId } = req.body;

    const user = await User.findByIdAndUpdate(userId, { $unset: { department: 1 } }, { new: true });
    const department = await Department.findByIdAndUpdate(
      departmentId,
      { $pull: { officers: userId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: { user, department } });
  } catch (error) {
    next(error);
  }
};
