const express = require('express');
const { deleteAllData } = require('../controllers/uploadController');

const router = express.Router();

// DELETE /api/analysis/all-data
router.delete('/analysis/all-data', deleteAllData);

module.exports = router; 