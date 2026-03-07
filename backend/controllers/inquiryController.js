import asyncHandler from 'express-async-handler';
import Inquiry from '../models/Inquiry.js';

// @desc    Create a new inquiry (offer/message)
// @route   POST /api/inquiries
// @access  Private
const createInquiry = asyncHandler(async (req, res) => {
    const { listing, listingModel, receiver, message, offerPrice } = req.body;

    if (!listing || !listingModel || !receiver || !message) {
        res.status(400);
        throw new Error('Please provide listing, receiver, and message');
    }

    const inquiry = await Inquiry.create({
        listing,
        listingModel,
        sender: req.user._id,
        receiver,
        message,
        offerPrice: offerPrice || null,
        status: 'Open'
    });

    res.status(201).json(inquiry);
});

// @desc    Get logged in user's sent & received inquiries
// @route   GET /api/inquiries/my
// @access  Private
const getMyInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
        .populate('sender', 'fullName avatar')
        .populate('receiver', 'fullName avatar')
        .populate({
            path: 'listing',
            populate: { path: 'vehicle', model: 'VehicleProfile' } // generic population assuming field is 'vehicle'
        })
        .sort('-updatedAt');

    res.json(inquiries);
});

// @desc    Update inquiry status or reply
// @route   PUT /api/inquiries/:id
// @access  Private
const updateInquiry = asyncHandler(async (req, res) => {
    const { status, read } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
        res.status(404);
        throw new Error('Inquiry not found');
    }

    // Verify user is sender or receiver
    if (inquiry.sender.toString() !== req.user._id.toString() && inquiry.receiver.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this inquiry');
    }

    if (status) inquiry.status = status;
    if (read !== undefined) inquiry.read = read;

    const updatedInquiry = await inquiry.save();
    res.json(updatedInquiry);
});

export {
    createInquiry,
    getMyInquiries,
    updateInquiry
};
