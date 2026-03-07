import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'listingModel'
    },
    listingModel: {
        type: String,
        required: true,
        enum: ['SaleListing', 'RentalListing']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    offerPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Open', 'Countered', 'Accepted', 'Rejected'],
        default: 'Open'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
