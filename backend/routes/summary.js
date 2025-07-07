const express = require('express');
const summaryController = require('../controllers/summaryController');

const router = express.Router();

// GET /api/summary
router.get('/summary', summaryController.getSummary);

module.exports = router; 