// const Case = require('./models/case');
const Case = require('../models/case');
const logger = require('../utils/logger');

exports.getAggregatedCases = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const aggregatedData = await Case.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: '$city',
          totalCases: { $sum: 1 },
        },
      },
    ]);

    res.json(aggregatedData);
  } catch (err) {
    logger.error('Error fetching aggregated data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};