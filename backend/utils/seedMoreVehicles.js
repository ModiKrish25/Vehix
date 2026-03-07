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

const EXTRA_VEHICLES = [
    // ══════════════════════ 10 MORE CARS ══════════════════════
    {
        profile: { vinOrRegNumber: 'MH01XC1001', type: 'Car', make: 'Maruti Suzuki', model: 'Baleno', year: 2023, mileage: 9000, color: 'Nexa Blue', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800'] },
        listing: 'rent', rent: { hourlyRate: 130, dailyRate: 1500, securityDeposit: 4000, pickupLocation: { address: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', zip: '400069', coordinates: { lat: 19.1136, lng: 72.8697 } } },
    },
    {
        profile: { vinOrRegNumber: 'DL07XC1002', type: 'Car', make: 'Hyundai', model: 'Venue', year: 2022, mileage: 18000, color: 'Typhoon Silver', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'] },
        listing: 'rent', rent: { hourlyRate: 175, dailyRate: 2100, securityDeposit: 6000, pickupLocation: { address: 'Rajouri Garden', city: 'New Delhi', state: 'Delhi', zip: '110027', coordinates: { lat: 28.6432, lng: 77.1115 } } },
    },
    {
        profile: { vinOrRegNumber: 'KA04XC1003', type: 'Car', make: 'Kia', model: 'Seltos', year: 2023, mileage: 7000, color: 'Glacier White Pearl', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'] },
        listing: 'rent', rent: { hourlyRate: 200, dailyRate: 2500, securityDeposit: 7000, pickupLocation: { address: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', zip: '560066', coordinates: { lat: 12.9698, lng: 77.7499 } } },
    },
    {
        profile: { vinOrRegNumber: 'TN10XC1004', type: 'Car', make: 'Volkswagen', model: 'Polo', year: 2021, mileage: 42000, color: 'Flash Red', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800'] },
        listing: 'sale', sale: { price: 720000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'MH14XC1005', type: 'Car', make: 'Mahindra', model: 'Scorpio N', year: 2023, mileage: 12000, color: 'Deep Forest', transmission: 'Automatic', fuelType: 'Diesel', images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'] },
        listing: 'sale', sale: { price: 1850000, condition: 'Used', negotiable: false },
    },
    {
        profile: { vinOrRegNumber: 'RJ05XC1006', type: 'Car', make: 'Renault', model: 'Kwid', year: 2022, mileage: 25000, color: 'Moonlight Silver', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800'] },
        listing: 'sale', sale: { price: 420000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'GJ09XC1007', type: 'Car', make: 'Ford', model: 'EcoSport', year: 2020, mileage: 55000, color: 'Blue Candy', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'] },
        listing: 'sale', sale: { price: 680000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'MH20XC1008', type: 'Car', make: 'Toyota', model: 'Glanza', year: 2023, mileage: 4000, color: 'Sporty Red', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'] },
        listing: 'rent', rent: { hourlyRate: 160, dailyRate: 1900, securityDeposit: 5500, pickupLocation: { address: 'Bandra-Kurla Complex', city: 'Mumbai', state: 'Maharashtra', zip: '400051', coordinates: { lat: 19.0653, lng: 72.8651 } } },
    },
    {
        profile: { vinOrRegNumber: 'KL07XC1009', type: 'Car', make: 'Skoda', model: 'Slavia', year: 2022, mileage: 20000, color: 'Brilliant Silver', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'] },
        listing: 'rent', rent: { hourlyRate: 190, dailyRate: 2300, securityDeposit: 7000, pickupLocation: { address: 'MG Road', city: 'Kochi', state: 'Kerala', zip: '682035', coordinates: { lat: 9.9312, lng: 76.2673 } } },
    },
    {
        profile: { vinOrRegNumber: 'AP09XC1010', type: 'Car', make: 'Nissan', model: 'Magnite', year: 2023, mileage: 8000, color: 'Vivid Blue', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800'] },
        listing: 'sale', sale: { price: 830000, condition: 'Used', negotiable: true },
    },

    // ════════════════════ 10 MORE MOTORCYCLES ════════════════════
    {
        profile: { vinOrRegNumber: 'MH11XM1001', type: 'Motorcycle', make: 'Royal Enfield', model: 'Himalayan 450', year: 2023, mileage: 5000, color: 'Slate Himalayan Salt', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'] },
        listing: 'rent', rent: { hourlyRate: 110, dailyRate: 1200, securityDeposit: 4000, pickupLocation: { address: 'Leh Palace Road', city: 'Leh', state: 'Ladakh', zip: '194101', coordinates: { lat: 34.1526, lng: 77.5771 } } },
    },
    {
        profile: { vinOrRegNumber: 'KA15XM1002', type: 'Motorcycle', make: 'Yamaha', model: 'R15 V4', year: 2022, mileage: 14000, color: 'Racing Blue', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800', 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800'] },
        listing: 'rent', rent: { hourlyRate: 90, dailyRate: 1000, securityDeposit: 3500, pickupLocation: { address: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', zip: '560102', coordinates: { lat: 12.9121, lng: 77.6446 } } },
    },
    {
        profile: { vinOrRegNumber: 'DL12XM1003', type: 'Motorcycle', make: 'Suzuki', model: 'Gixxer SF 250', year: 2021, mileage: 22000, color: 'Metallic Oort Gray', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1616789916644-e7e74c2143a3?w=800', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800'] },
        listing: 'sale', sale: { price: 195000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'MH40XM1004', type: 'Motorcycle', make: 'Honda', model: 'CB300R', year: 2022, mileage: 9000, color: 'Mat Gunpowder Black', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', 'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800'] },
        listing: 'rent', rent: { hourlyRate: 95, dailyRate: 1050, securityDeposit: 3500, pickupLocation: { address: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', zip: '411006', coordinates: { lat: 18.5498, lng: 73.9024 } } },
    },
    {
        profile: { vinOrRegNumber: 'TN25XM1005', type: 'Motorcycle', make: 'TVS', model: 'Apache RR 310', year: 2023, mileage: 6000, color: 'BTO Immersive Black', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'] },
        listing: 'sale', sale: { price: 265000, condition: 'Used', negotiable: false },
    },
    {
        profile: { vinOrRegNumber: 'RJ14XM1006', type: 'Motorcycle', make: 'Bajaj', model: 'Avenger 220 Cruise', year: 2021, mileage: 30000, color: 'Ebony Black', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://images.unsplash.com/photo-1616789916644-e7e74c2143a3?w=800'] },
        listing: 'sale', sale: { price: 110000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'HR40XM1007', type: 'Motorcycle', make: 'Royal Enfield', model: 'Meteor 350', year: 2022, mileage: 16000, color: 'Supernova Brown', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800'] },
        listing: 'rent', rent: { hourlyRate: 85, dailyRate: 950, securityDeposit: 3200, pickupLocation: { address: 'Sector 29', city: 'Gurugram', state: 'Haryana', zip: '122001', coordinates: { lat: 28.4746, lng: 77.0266 } } },
    },
    {
        profile: { vinOrRegNumber: 'UP80XM1008', type: 'Motorcycle', make: 'Honda', model: 'Shine 125', year: 2023, mileage: 3000, color: 'Pearl Igneous Black', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1616789916644-e7e74c2143a3?w=800', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800'] },
        listing: 'sale', sale: { price: 78000, condition: 'Used', negotiable: false },
    },
    {
        profile: { vinOrRegNumber: 'WB02XM1009', type: 'Motorcycle', make: 'Yamaha', model: 'MT-15 V2', year: 2022, mileage: 11000, color: 'Metallic Black', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800'] },
        listing: 'rent', rent: { hourlyRate: 88, dailyRate: 980, securityDeposit: 3300, pickupLocation: { address: 'Park Street', city: 'Kolkata', state: 'West Bengal', zip: '700016', coordinates: { lat: 22.5532, lng: 88.3540 } } },
    },
    {
        profile: { vinOrRegNumber: 'MP09XM1010', type: 'Motorcycle', make: 'KTM', model: '250 Adventure', year: 2022, mileage: 19000, color: 'KTM Orange', transmission: 'Manual', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800'] },
        listing: 'sale', sale: { price: 235000, condition: 'Used', negotiable: true },
    },

    // ════════════════════ 10 MORE SCOOTERS ════════════════════
    {
        profile: { vinOrRegNumber: 'MH43XS1001', type: 'Scooter', make: 'Honda', model: 'Dio 125', year: 2023, mileage: 5000, color: 'Pearl Nightfall Blue', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'] },
        listing: 'rent', rent: { hourlyRate: 45, dailyRate: 480, securityDeposit: 1500, pickupLocation: { address: 'Powai Lake Road', city: 'Mumbai', state: 'Maharashtra', zip: '400076', coordinates: { lat: 19.1176, lng: 72.9060 } } },
    },
    {
        profile: { vinOrRegNumber: 'KA20XS1002', type: 'Scooter', make: 'Suzuki', model: 'Access 125', year: 2022, mileage: 13000, color: 'Metallic Sonic Silver', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'] },
        listing: 'rent', rent: { hourlyRate: 48, dailyRate: 520, securityDeposit: 1600, pickupLocation: { address: 'Jayanagar 4th Block', city: 'Bengaluru', state: 'Karnataka', zip: '560011', coordinates: { lat: 12.9272, lng: 77.5929 } } },
    },
    {
        profile: { vinOrRegNumber: 'DL04XS1003', type: 'Scooter', make: 'Yamaha', model: 'Fascino 125 Fi', year: 2023, mileage: 4000, color: 'Cyan Blue', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'] },
        listing: 'sale', sale: { price: 85000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'TN21XS1004', type: 'Scooter', make: 'TVS', model: 'NTORQ 125 Race XP', year: 2022, mileage: 17000, color: 'Matte Red', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'] },
        listing: 'sale', sale: { price: 72000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'RJ15XS1005', type: 'Scooter', make: 'Honda', model: 'Grazia 125', year: 2021, mileage: 28000, color: 'Pearl Magellanic Black', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'] },
        listing: 'sale', sale: { price: 62000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'AP39XS1006', type: 'Scooter', make: 'Piaggio', model: 'Vespa SXL 150', year: 2022, mileage: 9000, color: 'Arancio Sicilia Orange', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'] },
        listing: 'rent', rent: { hourlyRate: 65, dailyRate: 680, securityDeposit: 2000, pickupLocation: { address: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zip: '500033', coordinates: { lat: 17.4328, lng: 78.4069 } } },
    },
    {
        profile: { vinOrRegNumber: 'MH31XS1007', type: 'Scooter', make: 'TVS', model: 'Wego 110', year: 2020, mileage: 35000, color: 'Malabar Blue', transmission: 'Automatic', fuelType: 'Petrol', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'] },
        listing: 'sale', sale: { price: 45000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'GJ06XS1008', type: 'Scooter', make: 'Bajaj', model: 'Chetak Electric', year: 2023, mileage: 6000, color: 'Indica Blue', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800'] },
        listing: 'rent', rent: { hourlyRate: 55, dailyRate: 600, securityDeposit: 2000, pickupLocation: { address: 'CG Road', city: 'Ahmedabad', state: 'Gujarat', zip: '380006', coordinates: { lat: 23.0258, lng: 72.5696 } } },
    },
    {
        profile: { vinOrRegNumber: 'HR10XS1009', type: 'Scooter', make: 'Ola', model: 'S1 Air', year: 2023, mileage: 2000, color: 'Porcelain White', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'] },
        listing: 'rent', rent: { hourlyRate: 55, dailyRate: 580, securityDeposit: 1800, pickupLocation: { address: 'Cyber City', city: 'Gurugram', state: 'Haryana', zip: '122002', coordinates: { lat: 28.4948, lng: 77.0887 } } },
    },
    {
        profile: { vinOrRegNumber: 'KL09XS1010', type: 'Scooter', make: 'Ampere', model: 'Magnus EX', year: 2022, mileage: 11000, color: 'Cherry Red', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'] },
        listing: 'sale', sale: { price: 58000, condition: 'Used', negotiable: true },
    },

    // ════════════════════ 10 MORE EVs ════════════════════
    {
        profile: { vinOrRegNumber: 'MH02XE1001', type: 'EV', make: 'Hyundai', model: 'Ioniq 5', year: 2023, mileage: 8000, color: 'Gravity Gold Matte', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800'] },
        listing: 'rent', rent: { hourlyRate: 350, dailyRate: 4200, securityDeposit: 12000, pickupLocation: { address: 'Lower Parel', city: 'Mumbai', state: 'Maharashtra', zip: '400013', coordinates: { lat: 18.9944, lng: 72.8312 } } },
    },
    {
        profile: { vinOrRegNumber: 'DL03XE1002', type: 'EV', make: 'Kia', model: 'EV6', year: 2022, mileage: 18000, color: 'Glacier', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'] },
        listing: 'sale', sale: { price: 5600000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'KA22XE1003', type: 'EV', make: 'BYD', model: 'Atto 3', year: 2023, mileage: 11000, color: 'Sky Blue', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'] },
        listing: 'rent', rent: { hourlyRate: 280, dailyRate: 3300, securityDeposit: 10000, pickupLocation: { address: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', zip: '560100', coordinates: { lat: 12.8458, lng: 77.6692 } } },
    },
    {
        profile: { vinOrRegNumber: 'TN06XE1004', type: 'EV', make: 'Tata', model: 'Tiago EV', year: 2023, mileage: 9000, color: 'Daytona Grey', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'] },
        listing: 'sale', sale: { price: 980000, condition: 'Used', negotiable: false },
    },
    {
        profile: { vinOrRegNumber: 'AP28XE1005', type: 'EV', make: 'Mahindra', model: 'XUV400 EV', year: 2023, mileage: 13000, color: 'Ekta White', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'] },
        listing: 'rent', rent: { hourlyRate: 270, dailyRate: 3200, securityDeposit: 9500, pickupLocation: { address: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', zip: '500034', coordinates: { lat: 17.4126, lng: 78.4283 } } },
    },
    {
        profile: { vinOrRegNumber: 'MH48XE1006', type: 'EV', make: 'Volvo', model: 'C40 Recharge', year: 2023, mileage: 5000, color: 'Fjord Blue', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'] },
        listing: 'sale', sale: { price: 6500000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'HR06XE1007', type: 'EV', make: 'Ather', model: '450X Gen 3', year: 2023, mileage: 4000, color: 'Space Grey', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'] },
        listing: 'rent', rent: { hourlyRate: 85, dailyRate: 900, securityDeposit: 3000, pickupLocation: { address: 'Sector 14', city: 'Faridabad', state: 'Haryana', zip: '121007', coordinates: { lat: 28.3670, lng: 77.3107 } } },
    },
    {
        profile: { vinOrRegNumber: 'GJ01XE1008', type: 'EV', make: 'Tata', model: 'Nexon EV Prime', year: 2022, mileage: 22000, color: 'Flame Red', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800'] },
        listing: 'sale', sale: { price: 1550000, condition: 'Used', negotiable: true },
    },
    {
        profile: { vinOrRegNumber: 'PB10XE1009', type: 'EV', make: 'BMW', model: 'iX1', year: 2023, mileage: 7000, color: 'Imperial Blue', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'] },
        listing: 'rent', rent: { hourlyRate: 500, dailyRate: 6000, securityDeposit: 15000, pickupLocation: { address: 'Model Town', city: 'Ludhiana', state: 'Punjab', zip: '141002', coordinates: { lat: 30.9081, lng: 75.8573 } } },
    },
    {
        profile: { vinOrRegNumber: 'MH01XE1010', type: 'EV', make: 'Mini', model: 'Cooper SE', year: 2022, mileage: 15000, color: 'Coral Red', transmission: 'Automatic', fuelType: 'Electric', images: ['https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'] },
        listing: 'sale', sale: { price: 3900000, condition: 'Used', negotiable: true },
    },
];

const seedMoreVehicles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        const admin = await User.findOne({ email: 'admin@vehix.com' });
        if (!admin) { console.error('❌ Run seedAdmin.js first'); process.exit(1); }

        let rentalCount = 0, saleCount = 0;

        for (const vehicle of EXTRA_VEHICLES) {
            // Skip if VIN already exists
            const existing = await VehicleProfile.findOne({ vinOrRegNumber: vehicle.profile.vinOrRegNumber });
            if (existing) { console.log(`  ⚠️  Skip (exists): ${vehicle.profile.vinOrRegNumber}`); continue; }

            const profile = await VehicleProfile.create({ ...vehicle.profile, owner: admin._id });

            if (vehicle.listing === 'rent') {
                await RentalListing.create({ vehicleProfile: profile._id, owner: admin._id, ...vehicle.rent, isActive: true });
                rentalCount++;
                console.log(`  🚗 Rental:  ${profile.make} ${profile.model} (${profile.type})`);
            } else {
                await SaleListing.create({ vehicleProfile: profile._id, seller: admin._id, ...vehicle.sale, status: 'Active' });
                saleCount++;
                console.log(`  🏷️  Sale:    ${profile.make} ${profile.model} — ₹${vehicle.sale.price.toLocaleString('en-IN')}`);
            }
        }

        console.log('\n══════════════════════════════════════');
        console.log(`✅ Added ${rentalCount} rental + ${saleCount} sale = ${rentalCount + saleCount} new vehicles`);
        console.log('══════════════════════════════════════\n');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedMoreVehicles();
