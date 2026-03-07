import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        const existingAdmin = await User.findOne({ email: 'admin@vehix.com' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists. No changes made.');
            console.log('   Email:    admin@vehix.com');
            console.log('   Password: Admin@123');
        } else {
            await User.create({
                fullName: 'Vehix Admin',
                email: 'admin@vehix.com',
                password: 'Admin@123',
                role: 'Admin',
                kycStatus: 'Verified',
            });
            console.log('✅ Admin user created successfully!');
            console.log('   Email:    admin@vehix.com');
            console.log('   Password: Admin@123');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
        process.exit(0);
    }
};

seedAdmin();
