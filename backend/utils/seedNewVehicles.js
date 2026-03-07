import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';
import VehicleProfile from '../models/VehicleProfile.js';
import SaleListing from '../models/SaleListing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const NEW_VEHICLES = [
    // ══════════════════════ 6 NEW CARS ══════════════════════
    {
        profile: {
            vinOrRegNumber: 'MH01NEW001',
            type: 'Car', make: 'Maruti Suzuki', model: 'Grand Vitara',
            year: 2025, mileage: 0, color: 'Grandeur Grey',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1680804928506-26a3b0dcc42b?w=800',
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
            ],
        },
        sale: { price: 1950000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'DL01NEW002',
            type: 'Car', make: 'Hyundai', model: 'Creta N Line',
            year: 2025, mileage: 0, color: 'Abyss Black Pearl',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
                'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800',
            ],
        },
        sale: { price: 1750000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'KA01NEW003',
            type: 'Car', make: 'Kia', model: 'Carens',
            year: 2025, mileage: 0, color: 'Imperial Blue',
            transmission: 'Automatic', fuelType: 'Diesel',
            images: [
                'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
                'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
            ],
        },
        sale: { price: 1620000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'TN01NEW004',
            type: 'Car', make: 'Toyota', model: 'Innova Hycross',
            year: 2025, mileage: 0, color: 'Platinum White Pearl',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
                'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
            ],
        },
        sale: { price: 2840000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'MH02NEW005',
            type: 'Car', make: 'Honda', model: 'Elevate',
            year: 2025, mileage: 0, color: 'Radiant Red Metallic',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
                'https://images.unsplash.com/photo-1617887032122-3e8f42ee25f7?w=800',
            ],
        },
        sale: { price: 1580000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'GJ01NEW006',
            type: 'Car', make: 'Skoda', model: 'Kushaq Monte Carlo',
            year: 2025, mileage: 0, color: 'Candy White',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
                'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
            ],
        },
        sale: { price: 1890000, condition: 'New', negotiable: false },
    },

    // ══════════════════════ 3 NEW MOTORCYCLES ══════════════════════
    {
        profile: {
            vinOrRegNumber: 'MH03NEW007',
            type: 'Motorcycle', make: 'Royal Enfield', model: 'Guerrilla 450',
            year: 2025, mileage: 0, color: 'Tirtha Teal',
            transmission: 'Manual', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            ],
        },
        sale: { price: 229000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'KA02NEW008',
            type: 'Motorcycle', make: 'KTM', model: '390 Duke',
            year: 2025, mileage: 0, color: 'KTM Orange',
            transmission: 'Manual', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800',
                'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800',
            ],
        },
        sale: { price: 315000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'DL02NEW009',
            type: 'Motorcycle', make: 'Yamaha', model: 'MT-07',
            year: 2025, mileage: 0, color: 'Cyan Storm',
            transmission: 'Manual', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1616789916644-e7e74c2143a3?w=800',
                'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800',
            ],
        },
        sale: { price: 875000, condition: 'New', negotiable: false },
    },

    // ══════════════════════ 3 NEW SCOOTERS ══════════════════════
    {
        profile: {
            vinOrRegNumber: 'TN02NEW010',
            type: 'Scooter', make: 'TVS', model: 'Jupiter ZX Disc',
            year: 2025, mileage: 0, color: 'Matte Red',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
                'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
            ],
        },
        sale: { price: 82000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'AP01NEW011',
            type: 'Scooter', make: 'Honda', model: 'Activa 7G',
            year: 2025, mileage: 0, color: 'Pearl Siren Blue',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
                'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
            ],
        },
        sale: { price: 78500, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'MH04NEW012',
            type: 'Scooter', make: 'Piaggio', model: 'Vespa Racing Sixties',
            year: 2025, mileage: 0, color: 'Giallo Sole Yellow',
            transmission: 'Automatic', fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
                'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800',
            ],
        },
        sale: { price: 145000, condition: 'New', negotiable: false },
    },

    // ══════════════════════ 3 NEW EVs ══════════════════════
    {
        profile: {
            vinOrRegNumber: 'KA03NEW013',
            type: 'EV', make: 'Tata', model: 'Punch EV Empowered Plus',
            year: 2025, mileage: 0, color: 'Pristine White',
            transmission: 'Automatic', fuelType: 'Electric',
            images: [
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
                'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800',
            ],
        },
        sale: { price: 1420000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'DL03NEW014',
            type: 'EV', make: 'MG', model: 'ZS EV Excite',
            year: 2025, mileage: 0, color: 'Aurora Silver',
            transmission: 'Automatic', fuelType: 'Electric',
            images: [
                'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
            ],
        },
        sale: { price: 2295000, condition: 'New', negotiable: false },
    },
    {
        profile: {
            vinOrRegNumber: 'MH05NEW015',
            type: 'EV', make: 'Ola', model: 'S1 Pro Gen 2',
            year: 2025, mileage: 0, color: 'Jet Black',
            transmission: 'Automatic', fuelType: 'Electric',
            images: [
                'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800',
                'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
            ],
        },
        sale: { price: 149000, condition: 'New', negotiable: false },
    },
];

const seedNewVehicles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        const admin = await User.findOne({ email: 'admin@vehix.com' });
        if (!admin) { console.error('❌ Run seedAdmin.js first'); process.exit(1); }

        let added = 0;

        for (const vehicle of NEW_VEHICLES) {
            const existing = await VehicleProfile.findOne({ vinOrRegNumber: vehicle.profile.vinOrRegNumber });
            if (existing) {
                console.log(`  ⚠️  Skip (exists): ${vehicle.profile.vinOrRegNumber}`);
                continue;
            }

            const profile = await VehicleProfile.create({ ...vehicle.profile, owner: admin._id });
            await SaleListing.create({
                vehicleProfile: profile._id,
                seller: admin._id,
                ...vehicle.sale,
                status: 'Active',
            });
            added++;
            console.log(`  ✨ New: ${profile.make} ${profile.model} (${profile.type}) — ₹${vehicle.sale.price.toLocaleString('en-IN')}`);
        }

        console.log('\n══════════════════════════════════════');
        console.log(`✅ Seeded ${added} brand-new vehicle listings`);
        console.log('══════════════════════════════════════\n');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedNewVehicles();
