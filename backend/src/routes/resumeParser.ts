import express from 'express';
import multer from 'multer';
import { uploadAndParseResume } from '../controllers/resumeParserController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

router.post('/parse', authenticate, upload.single('resume'), uploadAndParseResume);

export default router;
