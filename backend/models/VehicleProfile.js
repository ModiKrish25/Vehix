import mongoose from 'mongoose';

const serviceRecordSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    mileage: { type: Number },
    cost: { type: Number },
    provider: { type: String }
});

const ownershipHistorySchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: { type: Date },
    endDate: { type: Date }
});

const vehicleProfileSchema = new mongoose.Schema({
    vinOrRegNumber: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Car', 'Motorcycle', 'Scooter', 'EV'],
        required: true
    },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mileage: { type: Number },
    color: { type: String },
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual']
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
    },
    images: [String],
    serviceRecords: [serviceRecordSchema],
    ownershipHistory: [ownershipHistorySchema]
}, { timestamps: true });

const VehicleProfile = mongoose.model('VehicleProfile', vehicleProfileSchema);
export default VehicleProfile;
