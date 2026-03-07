import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetRentalDetailsQuery } from '../../slices/vehiclesApiSlice';
import { useCreateBookingMutation } from '../../slices/bookingsApiSlice';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const BookingFlow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Pre-filled state from VehicleDetails navigation
    const passed = location.state || {};

    const [startDate, setStartDate] = useState(passed.pickupDate || '');
    const [endDate, setEndDate] = useState(passed.dropoffDate || '');
    const [payStep, setPayStep] = useState(false); // false = summary, true = pay

    const { data, isLoading } = useGetRentalDetailsQuery(id);
    const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

    if (isLoading) return <div className="text-center mt-20 text-2xl font-bold animate-pulse">Initializing Checkout...</div>;

    const listing = data?.data;
    if (!listing) return <div className="text-center mt-20 text-red-500 font-bold">Listing not found</div>;

    const vehicle = listing.vehicleProfile;

    if (!vehicle) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4 text-center">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Vehicle Profile Missing</h2>
                    <p className="text-[var(--text-secondary)] mb-6">This listing is broken because the original vehicle was removed from the database.</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl">Go Back</button>
                </div>
            </div>
        );
    }

    // Calculate days & total from state or fall back to form dates
    const calcDays = () => {
        if (!startDate || !endDate) return passed.days || 1;
        const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        return diff > 0 ? Math.ceil(diff) : 1;
    };
    const days = calcDays();
    const dailyRate = listing.dailyRate || 0;
    const securityDeposit = listing.securityDeposit || 0;
    const rentalCost = days * dailyRate;
    const totalAmount = rentalCost + securityDeposit;

    const handleConfirmBooking = async () => {
        try {
            await createBooking({
                rentalListingId: listing._id,
                startDate: startDate || new Date().toISOString(),
                endDate: endDate || new Date(Date.now() + 86400000 * days).toISOString(),
                totalPrice: totalAmount,
            }).unwrap();

            navigate('/dashboard', { state: { bookingSuccess: true } });
        } catch (error) {
            alert('Booking failed: ' + (error?.data?.message || 'Please try again.'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <button onClick={() => navigate(-1)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm">
                    ← Back
                </button>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Complete Your Booking
                </h1>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-8 text-sm">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${!payStep ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-secondary)]'}`}>
                    <span>1</span> Summary
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${payStep ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-secondary)]'}`}>
                    <span>2</span> Payment
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Vehicle Summary */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-2xl overflow-hidden p-6 space-y-4">
                    <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2">Vehicle Summary</h2>

                    <div className="rounded-xl overflow-hidden h-44 bg-gray-800">
                        <img src={vehicle.images?.[0]} alt="Vehicle" className="w-full h-full object-cover" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">{vehicle.type} · {vehicle.fuelType} · {vehicle.transmission}</p>
                        {listing.pickupLocation?.city && (
                            <p className="text-sm mt-1 text-blue-500">📍 {listing.pickupLocation.city}, {listing.pickupLocation.state}</p>
                        )}
                    </div>

                    {/* Date range */}
                    <div className="space-y-2">
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Pick-up Date & Time</label>
                            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Drop-off Date & Time</label>
                            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                                min={startDate}
                                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Right: Payment details */}
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-2xl overflow-hidden p-6 space-y-5">
                    <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2">
                        {payStep ? '💳 Payment' : '🧾 Price Breakdown'}
                    </h2>

                    {!payStep ? (
                        <>
                            {/* Breakdown */}
                            <div className="bg-[var(--bg-color)] rounded-xl p-4 space-y-3 text-sm border border-[var(--border-color)]">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Daily Rate</span>
                                    <span className="font-semibold">{inr(dailyRate)}/day</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Duration</span>
                                    <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Rental Cost</span>
                                    <span className="font-semibold">{inr(rentalCost)}</span>
                                </div>
                                {securityDeposit > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Security Deposit <span className="text-xs text-green-500">(Refundable)</span></span>
                                        <span className="font-semibold">{inr(securityDeposit)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-base">
                                    <span className="font-bold">Total Due</span>
                                    <span className="font-black text-blue-500">{inr(totalAmount)}</span>
                                </div>
                            </div>

                            <div className="text-xs text-[var(--text-secondary)] bg-blue-50/10 border border-blue-200/20 rounded-xl p-3">
                                ℹ️ Security deposit is fully refundable upon return of the vehicle in original condition.
                            </div>

                            <button onClick={() => setPayStep(true)}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all">
                                Continue to Payment →
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Mock payment form */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Cardholder Name</label>
                                    <input type="text" placeholder="Name on card" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Card Number</label>
                                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Expiry</label>
                                        <input type="text" placeholder="MM / YY" maxLength={7} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">CVV</label>
                                        <input type="text" placeholder="•••" maxLength={4} className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-color)] rounded-xl p-3 flex justify-between text-sm border border-[var(--border-color)]">
                                <span className="font-bold">Total to Pay</span>
                                <span className="font-black text-blue-500">{inr(totalAmount)}</span>
                            </div>

                            <button onClick={handleConfirmBooking} disabled={isBooking}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50">
                                {isBooking ? 'Processing...' : `✅ Confirm & Pay ${inr(totalAmount)}`}
                            </button>

                            <button onClick={() => setPayStep(false)} className="w-full text-center text-sm text-[var(--text-secondary)] hover:underline">
                                ← Back to Summary
                            </button>

                            <p className="text-center text-xs text-[var(--text-secondary)]">
                                🔒 Payments are securely processed. Your card info is not stored.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingFlow;
