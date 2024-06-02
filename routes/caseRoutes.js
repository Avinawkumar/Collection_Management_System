const express = require('express');
const caseController = require('../controllers/caseController');

const router = express.Router();

router.get('/cases', caseController.getAggregatedCases);

module.exports = router;