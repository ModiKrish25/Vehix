import mongoose from 'mongoose';

const rentalListingSchema = new mongoose.Schema({
    vehicleProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleProfile',
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    dailyRate: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    pickupLocation: {
        address: String,
        city: String,
        state: String,
        zip: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    availabilityCalendar: [{
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['Available', 'Booked', 'Maintenance'],
            default: 'Available'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const RentalListing = mongoose.model('RentalListing', rentalListingSchema);
export default RentalListing;
