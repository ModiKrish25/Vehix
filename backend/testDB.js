import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RentalListing from './models/RentalListing.js';
import SaleListing from './models/SaleListing.js';
dotenv.config();

const test = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const r = await RentalListing.find().populate('vehicleProfile');
    const s = await SaleListing.find().populate('vehicleProfile');
    let broken = 0;
    r.forEach(x => { if (!x.vehicleProfile) { console.log('Broken rental:', x._id); broken++; } });
    s.forEach(x => { if (!x.vehicleProfile) { console.log('Broken sale:', x._id); broken++; } });
    console.log('Total broken listings:', broken);
    process.exit(0);
};
test();
