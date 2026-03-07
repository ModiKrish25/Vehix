import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';
import VehicleProfile from '../models/VehicleProfile.js';
import RentalListing from '../models/RentalListing.js';
import SaleListing from '../models/SaleListing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// ─── Real Unsplash vehicle images ────────────────────────────────────────────
const VEHICLE_DATA = [
    // ══════════════════════════════ CARS (RENT) ═══════════════════════════════
    {
        profile: {
            vinOrRegNumber: 'MH01AB1234',
            type: 'Car',
            make: 'Maruti Suzuki',
            model: 'Swift Dzire',
            year: 2023,
            mileage: 8000,
            color: 'Pearl White',
            transmission: 'Automatic',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 150,
            dailyRate: 1800,
            securityDeposit: 5000,
            pickupLocation: {
                address: '12 MG Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                zip: '400001',
                coordinates: { lat: 19.076, lng: 72.877 },
            },
        },
    },
    {
        profile: {
            vinOrRegNumber: 'DL05CD5678',
            type: 'Car',
            make: 'Hyundai',
            model: 'Creta',
            year: 2022,
            mileage: 22000,
            color: 'Fiery Red',
            transmission: 'Automatic',
            fuelType: 'Diesel',
            images: [
                'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
                'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 220,
            dailyRate: 2800,
            securityDeposit: 8000,
            pickupLocation: {
                address: 'Connaught Place',
                city: 'New Delhi',
                state: 'Delhi',
                zip: '110001',
                coordinates: { lat: 28.6315, lng: 77.2167 },
            },
        },
    },
    {
        profile: {
            vinOrRegNumber: 'KA03EF9012',
            type: 'Car',
            make: 'Toyota',
            model: 'Innova Crysta',
            year: 2023,
            mileage: 5000,
            color: 'Avant-Garde Bronze',
            transmission: 'Manual',
            fuelType: 'Diesel',
            images: [
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
                'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 300,
            dailyRate: 3500,
            securityDeposit: 10000,
            pickupLocation: {
                address: 'Indiranagar 100 ft Road',
                city: 'Bengaluru',
                state: 'Karnataka',
                zip: '560038',
                coordinates: { lat: 12.9716, lng: 77.5946 },
            },
        },
    },

    // ═══════════════════════════════ CARS (SALE) ══════════════════════════════
    {
        profile: {
            vinOrRegNumber: 'TN09GH3456',
            type: 'Car',
            make: 'Honda',
            model: 'City 5th Gen',
            year: 2021,
            mileage: 35000,
            color: 'Lunar Silver',
            transmission: 'Manual',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
                'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
            ],
        },
        listing: 'sale',
        sale: {
            price: 890000,
            condition: 'Used',
            negotiable: true,
        },
    },
    {
        profile: {
            vinOrRegNumber: 'GJ01IJ7890',
            type: 'Car',
            make: 'Tata',
            model: 'Nexon',
            year: 2023,
            mileage: 10000,
            color: 'Calgary White',
            transmission: 'Automatic',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
                'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800',
            ],
        },
        listing: 'sale',
        sale: {
            price: 1250000,
            condition: 'Used',
            negotiable: false,
        },
    },

    // ════════════════════════════ MOTORCYCLES (RENT) ══════════════════════════
    {
        profile: {
            vinOrRegNumber: 'MH12KL4321',
            type: 'Motorcycle',
            make: 'Royal Enfield',
            model: 'Classic 350',
            year: 2022,
            mileage: 12000,
            color: 'Halcyon Black',
            transmission: 'Manual',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 80,
            dailyRate: 900,
            securityDeposit: 3000,
            pickupLocation: {
                address: 'FC Road',
                city: 'Pune',
                state: 'Maharashtra',
                zip: '411004',
                coordinates: { lat: 18.5204, lng: 73.8567 },
            },
        },
    },
    {
        profile: {
            vinOrRegNumber: 'RJ14MN8765',
            type: 'Motorcycle',
            make: 'Bajaj',
            model: 'Pulsar NS200',
            year: 2023,
            mileage: 6000,
            color: 'Burnt Red',
            transmission: 'Manual',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 70,
            dailyRate: 750,
            securityDeposit: 2500,
            pickupLocation: {
                address: 'MI Road',
                city: 'Jaipur',
                state: 'Rajasthan',
                zip: '302001',
                coordinates: { lat: 26.9124, lng: 75.7873 },
            },
        },
    },

    // ══════════════════════════ MOTORCYCLES (SALE) ════════════════════════════
    {
        profile: {
            vinOrRegNumber: 'UP16OP2345',
            type: 'Motorcycle',
            make: 'KTM',
            model: 'Duke 390',
            year: 2022,
            mileage: 18000,
            color: 'Orange',
            transmission: 'Manual',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800',
                'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
            ],
        },
        listing: 'sale',
        sale: {
            price: 270000,
            condition: 'Used',
            negotiable: true,
        },
    },
    {
        profile: {
            vinOrRegNumber: 'HR26QR6789',
            type: 'Motorcycle',
            make: 'Hero',
            model: 'Splendor Plus',
            year: 2023,
            mileage: 4000,
            color: 'Black with Candy Blazing Red',
            transmission: 'Manual',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1616789916644-e7e74c2143a3?w=800',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            ],
        },
        listing: 'sale',
        sale: {
            price: 75000,
            condition: 'Used',
            negotiable: false,
        },
    },

    // ══════════════════════════════ SCOOTERS (RENT) ═══════════════════════════
    {
        profile: {
            vinOrRegNumber: 'MH43ST1122',
            type: 'Scooter',
            make: 'Honda',
            model: 'Activa 6G',
            year: 2023,
            mileage: 7000,
            color: 'Pearl Sparkling Wine',
            transmission: 'Automatic',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
                'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 50,
            dailyRate: 500,
            securityDeposit: 1500,
            pickupLocation: {
                address: 'Linking Road, Bandra',
                city: 'Mumbai',
                state: 'Maharashtra',
                zip: '400050',
                coordinates: { lat: 19.0596, lng: 72.8295 },
            },
        },
    },
    {
        profile: {
            vinOrRegNumber: 'TN22UV3344',
            type: 'Scooter',
            make: 'TVS',
            model: 'Jupiter 125',
            year: 2022,
            mileage: 11000,
            color: 'Matte Blue',
            transmission: 'Automatic',
            fuelType: 'Petrol',
            images: [
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
            ],
        },
        listing: 'sale',
        sale: {
            price: 82000,
            condition: 'Used',
            negotiable: true,
        },
    },

    // ═══════════════════════════════ EVs (RENT) ═══════════════════════════════
    {
        profile: {
            vinOrRegNumber: 'KA05WX5566',
            type: 'EV',
            make: 'Tata',
            model: 'Nexon EV Max',
            year: 2023,
            mileage: 15000,
            color: 'Intensi-Teal',
            transmission: 'Automatic',
            fuelType: 'Electric',
            images: [
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 250,
            dailyRate: 3000,
            securityDeposit: 9000,
            pickupLocation: {
                address: 'Koramangala 5th Block',
                city: 'Bengaluru',
                state: 'Karnataka',
                zip: '560095',
                coordinates: { lat: 12.9279, lng: 77.6271 },
            },
        },
    },
    {
        profile: {
            vinOrRegNumber: 'MH02YZ7788',
            type: 'EV',
            make: 'Ola',
            model: 'S1 Pro',
            year: 2023,
            mileage: 3000,
            color: 'Jet Black',
            transmission: 'Automatic',
            fuelType: 'Electric',
            images: [
                'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800',
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
            ],
        },
        listing: 'rent',
        rent: {
            hourlyRate: 90,
            dailyRate: 950,
            securityDeposit: 3000,
            pickupLocation: {
                address: 'Viman Nagar',
                city: 'Pune',
                state: 'Maharashtra',
                zip: '411014',
                coordinates: { lat: 18.5679, lng: 73.9143 },
            },
        },
    },
    {
        profile: {
            vinOrRegNumber: 'DL08AB9900',
            type: 'EV',
            make: 'MG',
            model: 'ZS EV',
            year: 2022,
            mileage: 28000,
            color: 'Starry Black',
            transmission: 'Automatic',
            fuelType: 'Electric',
            images: [
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
                'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
            ],
        },
        listing: 'sale',
        sale: {
            price: 2100000,
            condition: 'Used',
            negotiable: true,
        },
    },
];

// ─── Seed function ────────────────────────────────────────────────────────────
const seedVehicles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Get admin user to be the owner
        const admin = await User.findOne({ email: 'admin@vehix.com' });
        if (!admin) {
            console.error('❌ Admin user not found. Run seedAdmin.js first.');
            process.exit(1);
        }
        console.log(`✅ Found admin: ${admin.email}`);

        // Clear existing vehicle data (fresh seed)
        await VehicleProfile.deleteMany({});
        await RentalListing.deleteMany({});
        await SaleListing.deleteMany({});
        console.log('🗑️  Cleared existing vehicle data');

        let rentalCount = 0;
        let saleCount = 0;

        for (const vehicle of VEHICLE_DATA) {
            // 1. Create VehicleProfile
            const profile = await VehicleProfile.create({
                ...vehicle.profile,
                owner: admin._id,
            });

            // 2. Create listing
            if (vehicle.listing === 'rent') {
                await RentalListing.create({
                    vehicleProfile: profile._id,
                    owner: admin._id,
                    ...vehicle.rent,
                    isActive: true,
                });
                rentalCount++;
                console.log(`  🚗 Rental:  ${profile.make} ${profile.model} (${profile.type})`);
            } else {
                await SaleListing.create({
                    vehicleProfile: profile._id,
                    seller: admin._id,
                    ...vehicle.sale,
                    status: 'Active',
                });
                saleCount++;
                console.log(`  🏷️  Sale:    ${profile.make} ${profile.model} (${profile.type}) — ₹${vehicle.sale.price.toLocaleString('en-IN')}`);
            }
        }

        console.log('\n══════════════════════════════════════');
        console.log(`✅ Seeded ${rentalCount} rental listings`);
        console.log(`✅ Seeded ${saleCount} sale listings`);
        console.log(`✅ Total: ${rentalCount + saleCount} vehicles`);
        console.log('══════════════════════════════════════\n');
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
        process.exit(0);
    }
};

seedVehicles();
