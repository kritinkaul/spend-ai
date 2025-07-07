const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `file-${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/pdf'];
    const allowedExtensions = ['.csv', '.pdf'];
    
    const hasValidMimeType = allowedTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and PDF files are allowed!'), false);
    }
  }
});

// POST /api/upload - Upload and parse transactions file
router.post('/upload', upload.single('file'), uploadController.uploadTransactions);

// GET /api/uploads - Get upload history
router.get('/uploads', uploadController.getUploads);

// GET /api/uploads/:id/status - Get upload status
router.get('/uploads/:id/status', uploadController.getUploadStatus);

module.exports = router; 