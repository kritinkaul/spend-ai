import express from 'express';
import { upload } from '../middleware/upload';
import { uploadFile, getUploads, getUploadStatus } from '../controllers/uploadController';

const router = express.Router();

router.get('/', getUploads);
router.post('/', upload.single('file'), uploadFile);
router.get('/status/:id', getUploadStatus);

export default router; 