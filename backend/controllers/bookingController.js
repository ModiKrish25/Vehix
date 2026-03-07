import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import RentalListing from '../models/RentalListing.js';

// @desc    Create new rental booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { rentalListingId, startDate, endDate, totalPrice } = req.body;

    if (!rentalListingId || !startDate || !endDate || !totalPrice) {
        res.status(400);
        throw new Error('Please provide all required booking fields');
    }

    const listing = await RentalListing.findById(rentalListingId);
    if (!listing) {
        res.status(404);
        throw new Error('Rental listing not found');
    }

    // MVP: In a real app we'd validate dates against existing bookings here

    const booking = await Booking.create({
        rentalListing: rentalListingId,
        customer: req.user._id,
        startDate,
        endDate,
        totalAmount: totalPrice,
        status: 'Pending'
    });

    res.status(201).json(booking);
});

// @desc    Get logged in user's bookings (Digital Garage)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ customer: req.user._id })
        .populate({
            path: 'rentalListing',
            populate: {
                path: 'vehicleProfile',
                model: 'VehicleProfile'
            }
        })
        .sort('-createdAt');
    res.json(bookings);
});

// @desc    Update booking status (Admin/Host)
// @route   PUT /api/bookings/:id/status
// @access  Private/Host/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // MVP: simple status update
    booking.status = status;
    const updatedBooking = await booking.save();

    res.json(updatedBooking);
});

export {
    createBooking,
    getMyBookings,
    updateBookingStatus
};
