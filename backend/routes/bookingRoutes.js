import express from 'express';
import {
    createBooking,
    getMyBookings,
    updateBookingStatus
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/status', protect, updateBookingStatus);

export default router;
