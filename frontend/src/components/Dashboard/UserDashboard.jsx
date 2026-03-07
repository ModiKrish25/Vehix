import { useSelector } from 'react-redux';
import { useGetMyBookingsQuery } from '../../slices/bookingsApiSlice';
import { useGetMyInquiriesQuery } from '../../slices/inquiriesApiSlice';

const UserDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { data: bData, isLoading: bLoading } = useGetMyBookingsQuery();
    const { data: iData, isLoading: iLoading } = useGetMyInquiriesQuery();

    const bookings = bData?.data || bData || [];
    const inquiries = iData?.data || iData || [];

    if (bLoading || iLoading) return <div className="text-center mt-20 text-2xl font-bold">Loading Digital Garage...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10 space-y-8 animate-fade-in">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
                My Digital Garage
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Widget */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl overflow-hidden p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mb-4 flex justify-center items-center text-3xl font-bold text-white shadow-xl shadow-blue-500/30">
                        {userInfo?.fullName?.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold">{userInfo?.fullName}</h2>
                    <p className="text-[var(--text-secondary)] mb-2">{userInfo?.email}</p>
                    <span className="bg-[var(--text-primary)] text-[var(--bg-color)] px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {userInfo?.role}
                    </span>
                    <button className="mt-6 w-full py-2 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Edit Profile
                    </button>
                </div>

                {/* Wishlist / Stats Widget */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl overflow-hidden p-6 md:col-span-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold border-b border-[var(--border-color)] pb-2 mb-4">Marketplace Activity</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                <span className="block text-3xl font-black text-blue-500">{bookings.length}</span>
                                <span className="text-sm font-semibold text-[var(--text-secondary)]">Active Rentals</span>
                            </div>
                            <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                <span className="block text-3xl font-black text-purple-500">2</span>
                                <span className="text-sm font-semibold text-[var(--text-secondary)]">Saved Vehicles</span>
                            </div>
                            <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                <span className="block text-3xl font-black text-green-500">{inquiries.length}</span>
                                <span className="text-sm font-semibold text-[var(--text-secondary)]">Pending Offers</span>
                            </div>
                        </div>
                    </div>
                    {/* Activity Feed Placeholder */}
                    <div className="mt-6 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)]">
                        <p className="text-sm text-[var(--text-secondary)] flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                            AI Price Alert: Toyota Camry price dropped by $500!
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Bookings */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl overflow-hidden p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <h3 className="text-2xl font-bold border-b border-[var(--border-color)] pb-2 mb-6">Recent Bookings</h3>
                {bookings.length === 0 ? (
                    <p className="text-[var(--text-secondary)]">No active bookings found.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="flex justify-between items-center p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-12 bg-gray-300 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={booking.rentalListing?.vehicleProfile?.images?.[0]} alt="car" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{booking.rentalListing?.vehicleProfile?.make || 'Unknown'} {booking.rentalListing?.vehicleProfile?.model || 'Vehicle'}</h4>
                                        <p className="text-xs text-[var(--text-secondary)]">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-blue-500">${booking.totalAmount}</span>
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-bold">{booking.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
