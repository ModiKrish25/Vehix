import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDeleteRentalListingMutation, useDeleteSaleListingMutation } from '../../slices/adminVehiclesApiSlice';

const VehicleCard = ({ listing, type }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const isAdmin = userInfo?.role === 'Admin';
    const isRental = type === 'rent';
    const vehicle = listing.vehicleProfile;

    const price = isRental
        ? `₹${listing.dailyRate?.toLocaleString('en-IN')}/day`
        : `₹${listing.price?.toLocaleString('en-IN')}`;

    const [deleteRent, { isLoading: dR }] = useDeleteRentalListingMutation();
    const [deleteSale, { isLoading: dS }] = useDeleteSaleListingMutation();
    const isDeleting = dR || dS;

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Delete ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}?`)) return;
        try {
            if (isRental) await deleteRent(listing._id).unwrap();
            else await deleteSale(listing._id).unwrap();
        } catch (err) {
            alert('Delete failed: ' + (err?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div className="glass-card flex flex-col h-full relative group overflow-hidden">

            {/* Image */}
            <div className="h-48 relative overflow-hidden">
                {vehicle?.images?.length > 0 ? (
                    <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-800 text-gray-500">
                        No Image
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Type badge */}
                <div className={`absolute top-3 left-3 glass border border-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md`}>
                    {isRental ? '🚗 Rent' : '🏷️ Sale'}
                </div>

                {/* Price badge — liquid feel */}
                <div className="absolute top-3 right-3 glass border border-white/20 text-white text-sm font-black px-3 py-1 rounded-full backdrop-blur-md">
                    {price}
                </div>

                {/* Admin delete — revealed on hover */}
                {isAdmin && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        title="Delete vehicle (Admin)"
                        className="absolute bottom-3 right-3 bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 backdrop-blur-md border border-red-400/30"
                    >
                        {isDeleting ? '...' : '🗑 Delete'}
                    </button>
                )}

                {/* Shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer-effect pointer-events-none" />
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold leading-tight">
                        {vehicle?.year} {vehicle?.make} <span className="text-blue-400">{vehicle?.model}</span>
                    </h3>
                    <span className="text-xs px-2 py-0.5 glass border border-white/20 rounded-md font-medium flex-shrink-0 ml-2">
                        {vehicle?.type}
                    </span>
                </div>

                <div className="text-sm text-[var(--text-secondary)] flex-grow space-y-1.5 mb-4">
                    <p className="flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="truncate">{listing.pickupLocation?.city || vehicle?.color || 'India'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                        <span>⚙️</span>
                        <span>{vehicle?.transmission}</span>
                        <span className="text-white/30">·</span>
                        <span>⛽ {vehicle?.fuelType}</span>
                    </p>
                    {!isRental && (
                        <p className={`flex items-center gap-1.5 text-xs font-semibold ${listing.condition === 'New' ? 'text-green-400' : 'text-amber-400'}`}>
                            ✓ {listing.condition} condition
                        </p>
                    )}
                </div>

                <Link to={`/vehicles/${type}/${listing._id}`}
                    className="mt-auto w-full block text-center btn-liquid py-2.5 rounded-xl font-semibold text-sm">
                    View Details →
                </Link>
            </div>
        </div>
    );
};

export default VehicleCard;
