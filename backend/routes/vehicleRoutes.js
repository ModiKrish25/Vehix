import express from 'express';
import {
    getRentalListings,
    getSaleListings,
    getRentalById,
    getSaleById,
    addRentalListing,
    addSaleListing,
    getAllVehiclesAdmin,
    deleteRentalListing,
    deleteSaleListing,
} from '../controllers/vehicleController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/rent', getRentalListings);
router.get('/rent/:id', getRentalById);
router.get('/buy', getSaleListings);
router.get('/buy/:id', getSaleById);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.use('/admin', protect, authorizeRoles('Admin'));
router.get('/admin/all', getAllVehiclesAdmin);
router.post('/admin/rent', addRentalListing);
router.post('/admin/sale', addSaleListing);
router.delete('/admin/rent/:id', deleteRentalListing);
router.delete('/admin/sale/:id', deleteSaleListing);

export default router;
