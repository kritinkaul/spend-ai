import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { transactionService } from '../services/transactionService';
import { AppError } from '../utils/AppError';

// Default user ID for system operations (no authentication)
const DEFAULT_USER_ID = 'system-user';

// Ensure default user exists
async function ensureDefaultUser() {
  const existingUser = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID }
  });
  
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        email: 'system@spendai.app',
        password: 'not-used',
        firstName: 'System',
        lastName: 'User'
      }
    });
  }
}

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded.', 400));
    }

    await ensureDefaultUser();
    const { originalname, mimetype, path: filePath, size } = req.file;

    const upload = await prisma.upload.create({
      data: {
        userId: DEFAULT_USER_ID,
        fileName: originalname,
        fileType: mimetype === 'text/csv' ? 'CSV' : 'PDF',
        fileSize: size,
        status: 'PENDING',
      },
    });

    // Don't await this, run it in the background
    transactionService.processFile(upload.id, filePath, mimetype, DEFAULT_USER_ID);

    res.status(202).json({
      success: true,
      data: { upload },
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new AppError('Upload ID is required', 400));
        }
        const upload = await prisma.upload.findUnique({
            where: { id },
        });

        if (!upload) {
            return next(new AppError('Upload not found', 404));
        }

        res.json({
            success: true,
            data: {
                status: upload.status,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUploads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uploads = await prisma.upload.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: { uploads },
        });
    } catch (error) {
        next(error);
    }
}; 