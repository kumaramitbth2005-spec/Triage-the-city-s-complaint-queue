const Activity = require('../models/Activity');

// GET /api/activities
exports.getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.action) filter.action = req.query.action;

    const [data, total] = await Promise.all([
      Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};
