import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDeleteRentalListingMutation, useDeleteSaleListingMutation } from '../../slices/adminVehiclesApiSlice';
import { useUpdateProfileMutation, useGetProfileQuery } from '../../slices/usersApiSlice';

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

    const [updateProfile] = useUpdateProfileMutation();
    const { data: profileData } = useGetProfileQuery(undefined, { skip: !userInfo });

    const isSaved = profileData?.savedVehicles?.includes(vehicle?._id);

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

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userInfo) {
            alert('Please login to save vehicles to your wishlist!');
            return;
        }
        try {
            if (isSaved) {
                await updateProfile({ unsaveVehicleId: vehicle._id }).unwrap();
            } else {
                await updateProfile({ saveVehicleId: vehicle._id }).unwrap();
            }
        } catch (err) {
            console.error('Failed to toggle save:', err);
        }
    };

    return (
        <div className="liquid-glass flex flex-col h-full relative group overflow-hidden border border-white/10 glass-reflection hover:scale-[1.02] transition-all duration-500 rounded-[2rem]">
            {/* Image */}
            <div className="h-56 relative overflow-hidden bg-white/5">
                {vehicle?.images?.length > 0 ? (
                    <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        onError={e => {
                            const fallbacks = {
                                Car: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
                                Motorcycle: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80',
                                Scooter: 'https://images.unsplash.com/photo-1558981033-0f0309284409?w=600&q=80',
                                EV: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80',
                            };
                            e.target.onerror = null;
                            e.target.src = fallbacks[vehicle?.type] || fallbacks.Car;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
                       <span className="text-4xl">🚗</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md">
                    {isRental ? 'Deployment' : 'Retained Asset'}
                </div>

                <button
                    onClick={handleToggleSave}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center transition-all z-10 ${isSaved ? 'text-red-500 scale-110 shadow-xl shadow-red-500/20' : 'text-white/60 hover:text-red-400 hover:scale-110'}`}
                >
                    <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth={isSaved ? 0 : 2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest text-white border border-white/10 backdrop-blur-xl z-10 uppercase">
                    {price}
                </div>

                {isAdmin && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="absolute bottom-4 right-4 bg-red-500/80 hover:bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 border border-red-400/20"
                    >
                        {isDeleting ? 'Removing...' : 'Dispose'}
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-black tracking-tighter leading-none group-hover:liquid-text transition-all duration-500">
                        {vehicle?.year} {vehicle?.make} <span className="lowercase font-black">{vehicle?.model}</span>
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="text-[8px] px-2.5 py-1 glass border border-white/5 rounded-lg font-black uppercase tracking-widest text-white/40">
                        {vehicle?.type}
                    </span>
                    <span className="text-[8px] px-2.5 py-1 glass border border-white/5 rounded-lg font-black uppercase tracking-widest text-white/40">
                        {vehicle?.transmission}
                    </span>
                    <span className="text-[8px] px-2.5 py-1 glass border border-white/5 rounded-lg font-black uppercase tracking-widest text-blue-400/60">
                        {vehicle?.fuelType}
                    </span>
                </div>

                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                    {listing.pickupLocation?.city || 'Central Protocol'}
                </div>

                {!isRental && (
                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${listing.condition === 'New' ? 'text-green-400/60' : 'text-amber-400/60'}`}>
                        {listing.condition} Condition Verified
                    </div>
                )}

                <Link to={`/vehicles/${type}/${listing._id}`}
                    className="mt-4 w-full block text-center btn-liquid py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-lg shadow-blue-500/10">
                    Access Asset →
                </Link>
            </div>
        </div>
    );
};

export default VehicleCard;
