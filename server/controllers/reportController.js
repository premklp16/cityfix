const Report = require('../models/Report');
const StatusHistory = require('../models/StatusHistory');
const Follow = require('../models/Follow');
const Department = require('../models/Department');
const { uploadToCloudinary } = require('../config/cloudinary');
const { notifyFollowers, createNotification } = require('../utils/helpers');
const { CATEGORY_TO_DEPARTMENT } = require('../config/categories');

exports.createReport = async (req, res, next) => {
  try {
    const { title, description, category, location, severity } = req.body;
    let coordinates = undefined;
    
    // Parse coordinates if provided
    if (req.body.coordinates) {
      const parsedCoords = JSON.parse(req.body.coordinates);
      if (parsedCoords && parsedCoords.lat && parsedCoords.lng) {
        coordinates = {
          type: 'Point',
          coordinates: [parsedCoords.lng, parsedCoords.lat] // GeoJSON format: [longitude, latitude]
        };
      }
    } else if (req.body.lat && req.body.lng) {
      coordinates = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
      };
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'cityfix/reports')
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map(result => result.url);
    }

    // Auto-assign department based on category
    let department = null;
    const departmentName = CATEGORY_TO_DEPARTMENT[category];
    if (departmentName) {
      const dept = await Department.findOne({ name: departmentName });
      if (dept) {
        department = dept._id;
      }
    }

    // ── Duplicate detection (before creation) ──
    const force = req.body.force === 'true' || req.body.force === true;

    if (!force && coordinates) {
      const duplicateReports = await Report.find({
        category,
        coordinates: {
          $nearSphere: {
            $geometry: coordinates,
            $maxDistance: 200,
          },
        },
        status: { $ne: 'Resolved' },
      })
        .select('title location severity status createdAt')
        .limit(5);

      if (duplicateReports.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Potential duplicate reports found nearby',
          duplicateReports,
        });
      }
    }

    // Create report (no duplicates found, or force=true)
    const report = await Report.create({
      title,
      description,
      category,
      location,
      coordinates,
      severity,
      images: imageUrls,
      department,
      createdBy: req.user.id
    });

    // Initial status history
    await StatusHistory.create({
      reportId: report._id,
      previousStatus: null,
      newStatus: 'Reported',
      changedBy: req.user.id,
      note: 'Report created'
    });

    const populatedReport = await report.populate('department', 'name');
    res.status(201).json({ success: true, data: populatedReport });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      severity, 
      search,
      sort = 'newest' 
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'Resolved' };
    }
    if (severity) query.severity = severity;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'most-upvoted') sortOption = { upvoteCount: -1 };

    const startIndex = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort(sortOption)
      .skip(startIndex)
      .limit(parseInt(limit))
      .populate('createdBy', 'name profileImage')
      .populate('assignedTo', 'name')
      .populate('department', 'name');

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reports,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'name profileImage')
      .populate('assignedTo', 'name')
      .populate('department', 'name');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const statusHistory = await StatusHistory.find({ reportId: report._id })
      .populate('changedBy', 'name')
      .sort({ timestamp: -1 });

    res.status(200).json({ 
      success: true, 
      data: report
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const { status, assignedTo, department, note, resolutionNotes } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Role check: Only officer and admin can update status
    if (req.user.role === 'citizen') {
      return res.status(403).json({ success: false, error: 'Not authorized to update reports' });
    }

    const previousStatus = report.status;
    
    // Update fields
    if (status) report.status = status;
    if (assignedTo) report.assignedTo = assignedTo;
    if (department) report.department = department;
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;

    // Handle resolution image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'cityfix/resolutions')
      );
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.url);
      report.resolutionImages = [...(report.resolutionImages || []), ...newImages];
    }

    await report.save();

    // Create status history if status changed
    if (status && status !== previousStatus) {
      await StatusHistory.create({
        reportId: report._id,
        previousStatus,
        newStatus: status,
        changedBy: req.user.id,
        note
      });

      // Notify creator and followers
      const msg = `Report "${report.title}" status changed to ${status}`;
      if (report.createdBy.toString() !== req.user.id.toString()) {
        await createNotification(report.createdBy, msg, 'status_change', report._id);
      }
      await notifyFollowers(report._id, msg, 'status_change', req.user.id);
    }

    const updatedReport = await Report.findById(report._id)
      .populate('assignedTo', 'name')
      .populate('department', 'name')
      .populate('createdBy', 'name profileImage');
    res.status(200).json({ success: true, data: updatedReport });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Only creator or admin can delete
    if (report.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this report' });
    }

    await report.deleteOne(); // deleteOne triggers pre hooks if any, or just deletes
    
    // Cleanup related data
    await StatusHistory.deleteMany({ reportId: report._id });
    // Should ideally also delete comments, follows related to this report.

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category, severity, sort = 'newest' } = req.query;
    const query = { createdBy: req.user.id };
    
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'Resolved' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'most-upvoted') sortOption = { upvoteCount: -1 };

    const startIndex = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort(sortOption)
      .skip(startIndex)
      .limit(parseInt(limit))
      .populate('createdBy', 'name profileImage');

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reports,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyReports = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius = 5,
      category,
      severity,
      status,
      sort = 'distance',
      limit = 50,
    } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Please provide lat and lng' });
    }

    const maxDistanceMeters = Math.min(parseFloat(radius) || 5, 50) * 1000;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);

    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    else filter.status = { $ne: 'Resolved' };

    const sortStage = {};
    if (sort === 'newest') sortStage.createdAt = -1;
    else if (sort === 'oldest') sortStage.createdAt = 1;
    else if (sort === 'severity') sortStage.severity = 1;
    else sortStage.distance = 1;

    const reports = await Report.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: maxDistanceMeters,
          query: filter,
        }
      },
      { $sort: sortStage },
      { $limit: limitNum }
    ]);

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};
