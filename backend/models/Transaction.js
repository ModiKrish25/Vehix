import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['RentalPayment', 'RentalRefund', 'VehiclePurchase'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    relatedItemType: {
        type: String,
        enum: ['Booking', 'SaleListing'],
        required: true
    },
    relatedItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'relatedItemType'
    },
    stripePaymentIntentId: {
        type: String
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
