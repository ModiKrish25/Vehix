import RentalListing from '../models/RentalListing.js';
import SaleListing from '../models/SaleListing.js';
import VehicleProfile from '../models/VehicleProfile.js';

// @desc    Get all rental listings
// @route   GET /api/vehicles/rent
// @access  Public
export const getRentalListings = async (req, res, next) => {
    try {
        const { make, type, maxPrice } = req.query;
        let query = { isActive: true };

        // We need to populate vehicleProfile to filter by make/type
        // First get matching vehicle profiles:
        let vpQuery = {};
        if (make) vpQuery.make = { $regex: make, $options: 'i' };
        if (type) vpQuery.type = type;

        const vehicleProfiles = await VehicleProfile.find(vpQuery).select('_id');
        const vpIds = vehicleProfiles.map(vp => vp._id);

        if (make || type) {
            query.vehicleProfile = { $in: vpIds };
        }

        if (maxPrice) {
            query.dailyRate = { $lte: Number(maxPrice) };
        }

        const rentals = await RentalListing.find(query)
            .populate('vehicleProfile')
            .populate('owner', 'fullName avatar');

        res.json({ success: true, count: rentals.length, data: rentals });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all sale listings
// @route   GET /api/vehicles/buy
// @access  Public
export const getSaleListings = async (req, res, next) => {
    try {
        const { make, type, maxPrice, condition } = req.query;
        let query = { status: 'Active' };

        let vpQuery = {};
        if (make) vpQuery.make = { $regex: make, $options: 'i' };
        if (type) vpQuery.type = type;

        const vehicleProfiles = await VehicleProfile.find(vpQuery).select('_id');
        const vpIds = vehicleProfiles.map(vp => vp._id);

        if (make || type) {
            query.vehicleProfile = { $in: vpIds };
        }

        if (maxPrice) {
            query.price = { $lte: Number(maxPrice) };
        }
        if (condition) {
            query.condition = condition;
        }

        const sales = await SaleListing.find(query)
            .populate('vehicleProfile')
            .populate('seller', 'fullName avatar role');

        res.json({ success: true, count: sales.length, data: sales });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single rental listing
// @route   GET /api/vehicles/rent/:id
// @access  Public
export const getRentalById = async (req, res, next) => {
    try {
        const rental = await RentalListing.findById(req.params.id)
            .populate('vehicleProfile')
            .populate('owner', 'fullName avatar');

        if (!rental) {
            return res.status(404).json({ success: false, message: 'Rental listing not found' });
        }
        res.json({ success: true, data: rental });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single sale listing
// @route   GET /api/vehicles/buy/:id
// @access  Public
export const getSaleById = async (req, res, next) => {
    try {
        const sale = await SaleListing.findById(req.params.id)
            .populate('vehicleProfile')
            .populate('seller', 'fullName avatar role');

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale listing not found' });
        }
        res.json({ success: true, data: sale });
    } catch (error) {
        next(error);
    }
};

// ─── ADMIN CONTROLLERS ───────────────────────────────────────────────────────

// @desc    Admin – Add a new rental listing (with vehicle profile)
// @route   POST /api/vehicles/admin/rent
// @access  Private/Admin
export const addRentalListing = async (req, res, next) => {
    try {
        const {
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images,
            hourlyRate, dailyRate, securityDeposit, pickupLocation
        } = req.body;

        const existingProfile = await VehicleProfile.findOne({ vinOrRegNumber });
        if (existingProfile) {
            return res.status(400).json({ success: false, message: 'Vehicle with this registration number already exists' });
        }

        const profile = await VehicleProfile.create({
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images: images || [],
            owner: req.user._id,
        });

        const listing = await RentalListing.create({
            vehicleProfile: profile._id,
            owner: req.user._id,
            hourlyRate, dailyRate, securityDeposit: securityDeposit || 0,
            pickupLocation, isActive: true,
        });

        const populated = await listing.populate('vehicleProfile');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin – Add a new sale listing (with vehicle profile)
// @route   POST /api/vehicles/admin/sale
// @access  Private/Admin
export const addSaleListing = async (req, res, next) => {
    try {
        const {
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images,
            price, condition, negotiable
        } = req.body;

        const existingProfile = await VehicleProfile.findOne({ vinOrRegNumber });
        if (existingProfile) {
            return res.status(400).json({ success: false, message: 'Vehicle with this registration number already exists' });
        }

        const profile = await VehicleProfile.create({
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images: images || [],
            owner: req.user._id,
        });

        const listing = await SaleListing.create({
            vehicleProfile: profile._id,
            seller: req.user._id,
            price, condition, negotiable: negotiable ?? true,
            status: 'Active',
        });

        const populated = await listing.populate('vehicleProfile');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin – Get all vehicles (both rental + sale) with details
// @route   GET /api/vehicles/admin/all
// @access  Private/Admin
export const getAllVehiclesAdmin = async (req, res, next) => {
    try {
        const rentals = await RentalListing.find({})
            .populate('vehicleProfile')
            .populate('owner', 'fullName email');
        const sales = await SaleListing.find({})
            .populate('vehicleProfile')
            .populate('seller', 'fullName email');

        res.json({
            success: true,
            rentals: { count: rentals.length, data: rentals },
            sales: { count: sales.length, data: sales },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin – Delete a rental listing + its vehicle profile
// @route   DELETE /api/vehicles/admin/rent/:id
// @access  Private/Admin
export const deleteRentalListing = async (req, res, next) => {
    try {
        const listing = await RentalListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ success: false, message: 'Rental listing not found' });

        const profileId = listing.vehicleProfile;
        await RentalListing.findByIdAndDelete(req.params.id);
        await VehicleProfile.findByIdAndDelete(profileId);

        res.json({ success: true, message: 'Rental listing deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin – Delete a sale listing + its vehicle profile
// @route   DELETE /api/vehicles/admin/sale/:id
// @access  Private/Admin
export const deleteSaleListing = async (req, res, next) => {
    try {
        const listing = await SaleListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ success: false, message: 'Sale listing not found' });

        const profileId = listing.vehicleProfile;
        await SaleListing.findByIdAndDelete(req.params.id);
        await VehicleProfile.findByIdAndDelete(profileId);

        res.json({ success: true, message: 'Sale listing deleted successfully' });
    } catch (error) {
        next(error);
    }
};
// @desc    Admin – Update a rental listing + its vehicle profile
// @route   PUT /api/vehicles/admin/rent/:id
// @access  Private/Admin
export const updateRentalListing = async (req, res, next) => {
    try {
        const {
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images,
            hourlyRate, dailyRate, securityDeposit, pickupLocation
        } = req.body;

        const listing = await RentalListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ success: false, message: 'Rental listing not found' });

        // Update Vehicle Profile
        await VehicleProfile.findByIdAndUpdate(listing.vehicleProfile, {
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images: images || []
        });

        // Update Listing
        const updatedListing = await RentalListing.findByIdAndUpdate(req.params.id, {
            hourlyRate, dailyRate, securityDeposit, pickupLocation
        }, { new: true }).populate('vehicleProfile');

        res.json({ success: true, data: updatedListing });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin – Update a sale listing + its vehicle profile
// @route   PUT /api/vehicles/admin/sale/:id
// @access  Private/Admin
export const updateSaleListing = async (req, res, next) => {
    try {
        const {
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images,
            price, condition, negotiable
        } = req.body;

        const listing = await SaleListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ success: false, message: 'Sale listing not found' });

        // Update Vehicle Profile
        await VehicleProfile.findByIdAndUpdate(listing.vehicleProfile, {
            vinOrRegNumber, type, make, model, year, mileage, color,
            transmission, fuelType, images: images || []
        });

        // Update Listing
        const updatedListing = await SaleListing.findByIdAndUpdate(req.params.id, {
            price, condition, negotiable
        }, { new: true }).populate('vehicleProfile');

        res.json({ success: true, data: updatedListing });
    } catch (error) {
        next(error);
    }
};
