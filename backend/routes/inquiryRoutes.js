import express from 'express';
import {
    createInquiry,
    getMyInquiries,
    updateInquiry
} from '../controllers/inquiryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInquiry);
router.get('/my-inquiries', protect, getMyInquiries);
router.put('/:id', protect, updateInquiry);

export default router;
