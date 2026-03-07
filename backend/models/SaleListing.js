import mongoose from 'mongoose';

const saleListingSchema = new mongoose.Schema({
    vehicleProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleProfile',
        required: true,
        unique: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        enum: ['New', 'Used'],
        required: true
    },
    negotiable: {
        type: Boolean,
        default: true
    },
    inspectionReport: {
        url: String,
        passed: Boolean,
        date: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Sold', 'Cancelled'],
        default: 'Active'
    },
    offers: [{
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Countered'] },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const SaleListing = mongoose.model('SaleListing', saleListingSchema);
export default SaleListing;
