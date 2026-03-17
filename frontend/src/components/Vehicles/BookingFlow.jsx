import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetRentalDetailsQuery } from '../../slices/vehiclesApiSlice';
import { useCreateBookingMutation } from '../../slices/bookingsApiSlice';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Get today's datetime string in datetime-local format with buffer
const getMinDateTime = (offsetMins = 15) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + offsetMins);
    return d.toISOString().slice(0, 16);
};

const BookingFlow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const passed = location.state || {};

    const [startDate, setStartDate] = useState(passed.pickupDate || '');
    const [endDate, setEndDate] = useState(passed.dropoffDate || '');
    const [payStep, setPayStep] = useState(false);
    const [dateError, setDateError] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const { data, isLoading } = useGetRentalDetailsQuery(id);
    const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

    // Derive days & costs reactively
    const { days, rentalCost, totalAmount } = useMemo(() => {
        const dailyRate = data?.data?.dailyRate || 0;
        const securityDeposit = data?.data?.securityDeposit || 0;
        let days = 0;
        if (startDate && endDate) {
            const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
            days = diff > 0 ? Math.ceil(diff) : 0;
        }
        const rentalCost = days * dailyRate;
        const totalAmount = rentalCost + securityDeposit;
        return { days, rentalCost, totalAmount };
    }, [startDate, endDate, data]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full liquid-bg animate-spin" />
                <p className="liquid-text text-2xl font-bold">Initializing Checkout...</p>
            </div>
        </div>
    );

    const listing = data?.data;
    if (!listing) return <div className="text-center mt-20 text-red-500 font-bold">Listing not found</div>;

    const vehicle = listing.vehicleProfile;
    if (!vehicle) return (
        <div className="max-w-4xl mx-auto py-10 px-4 text-center">
            <div className="glass-frost rounded-2xl p-8 border border-red-500/30">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-500 mb-2">Vehicle Profile Missing</h2>
                <p className="text-[var(--text-secondary)] mb-6">This listing is broken because the original vehicle was removed.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 glass border border-white/20 rounded-xl">Go Back</button>
            </div>
        </div>
    );

    const validateAndProceed = () => {
        setDateError('');
        if (!startDate) { setDateError('Please select a pick-up date.'); return; }
        if (!endDate) { setDateError('Please select a drop-off date.'); return; }
        if (new Date(endDate) <= new Date(startDate)) { setDateError('Drop-off must be after pick-up.'); return; }
        if (days < 1) { setDateError('Minimum booking is 1 day.'); return; }
        setPayStep(true);
    };

    const handleConfirmBooking = async () => {
        if (!cardName || !cardNumber || !expiry || !cvv) {
            setDateError('Please fill in all payment details.');
            return;
        }
        try {
            await createBooking({
                rentalListingId: listing._id,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                totalPrice: totalAmount,
            }).unwrap();
            setBookingSuccess(true);
        } catch (error) {
            setDateError('Booking failed: ' + (error?.data?.message || 'Please try again.'));
        }
    };

    if (bookingSuccess) return (
        <div className="max-w-md mx-auto py-24 text-center space-y-8 animate-fade-in px-4">
            <div className="text-8xl animate-bounce">🎇</div>
            <h2 className="text-4xl font-black liquid-text tracking-tighter">session_confirmed</h2>
            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                Vault entry granted for {vehicle.year} {vehicle.make} <span className="text-white">{vehicle.model}</span>.<br/> 
                Protocol active for {days} cycle{days > 1 ? 's' : ''}.
            </p>
            <div className="liquid-glass rounded-2xl p-6 text-[10px] font-black uppercase tracking-[0.2em] text-left space-y-4 border border-white/10 glass-reflection">
                <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[var(--text-secondary)]">Deployment</span>
                    <span className="text-blue-400">{new Date(startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[var(--text-secondary)]">Retrieval</span>
                    <span className="text-blue-400">{new Date(endDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="text-[var(--text-secondary)]">Total Credits</span>
                    <span className="text-lg text-white">{inr(totalAmount)}</span>
                </div>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-liquid w-full py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                Access Personal Hangar →
            </button>
        </div>
    );

    const inputClass = "w-full glass border border-white/5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 bg-white/5 glass-reflection text-white";

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors mb-4 block">
                      ← Abort Protocol
                  </button>
                  <h1 className="text-4xl md:text-6xl font-black liquid-text tracking-tighter leading-none">checkout_sequence</h1>
                </div>
                <div className="flex items-center gap-3">
                    {['Summary', 'Payment'].map((label, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all glass border ${(!payStep && i === 0) || (payStep && i === 1) ? 'border-blue-500/40 bg-blue-500/10 text-white shadow-xl shadow-blue-500/10' : 'border-white/5 text-[var(--text-secondary)] opacity-40'}`}>
                                <span className="text-blue-400 mr-2">{i + 1}</span>{label}
                            </div>
                            {i === 0 && <div className={`w-8 h-px ${payStep ? 'bg-blue-400' : 'bg-white/5'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Vehicle + Date Picker */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="liquid-glass rounded-[2.5rem] p-8 border border-white/10 glass-reflection space-y-8">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <h2 className="text-xl font-black">asset_verified</h2>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30">ID: {id.slice(-8)}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-48 h-32 rounded-2xl overflow-hidden border border-white/5 bg-white/2">
                                <img
                                    src={vehicle.images?.[0]}
                                    alt="Vehicle"
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                        e.target.onerror = null;
                                        const fb = { Car: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80', Motorcycle: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80', Scooter: 'https://images.unsplash.com/photo-1558981033-0f0309284409?w=600&q=80', EV: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80' };
                                        e.target.src = fb[vehicle?.type] || fb.Car;
                                    }}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="text-2xl font-black tracking-tighter">{vehicle.year} {vehicle.make} <span className="liquid-text lowercase">{vehicle.model}</span></h3>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex flex-wrap gap-x-4 gap-y-1">
                                    <span>{vehicle.type}</span>
                                    <span>{vehicle.fuelType}</span>
                                    <span>{vehicle.transmission}</span>
                                </div>
                                {listing.pickupLocation?.city && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-4 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        Deployment Zone: {listing.pickupLocation.city}, {listing.pickupLocation.state}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Date Range — always visible for reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Deployment Start</label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={e => { setStartDate(e.target.value); setDateError(''); }}
                                    min={getMinDateTime()}
                                    disabled={payStep}
                                    className={`${inputClass} ${payStep ? 'opacity-40 cursor-not-allowed border-transparent' : ''}`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Deployment End</label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={e => { setEndDate(e.target.value); setDateError(''); }}
                                    min={startDate || getMinDateTime(60)}
                                    disabled={payStep}
                                    className={`${inputClass} ${payStep ? 'opacity-40 cursor-not-allowed border-transparent' : ''}`}
                                />
                            </div>
                        </div>
                        {dateError && !payStep && (
                            <p className="glass bg-red-500/5 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-red-500/20 animate-shake">{dateError}</p>
                        )}
                        
                        {/* Live duration badge */}
                        {days > 0 && (
                            <div className="glass bg-blue-500/5 rounded-2xl px-6 py-3 flex items-center justify-between border border-blue-500/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Calculated Window</span>
                                <span className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{days} Cycle{days > 1 ? 's' : ''} active</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Breakdown or Payment */}
                <div className="lg:col-span-5">
                  <div className="liquid-glass rounded-[2.5rem] p-8 space-y-8 border border-white/10 glass-reflection sticky top-24">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <h2 className="text-xl font-black">
                              {payStep ? 'vault_auth' : 'credit_breakdown'}
                          </h2>
                          <div className={`w-2 h-2 rounded-full animate-pulse ${payStep ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      </div>

                      {/* Price Breakdown — always shown */}
                      <div className="glass bg-white/2 rounded-[1.5rem] p-6 space-y-4 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/5 glass-reflection">
                          <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Standard Cycle</span>
                              <span className="text-white">{inr(listing.dailyRate)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Total Cycles</span>
                              <span className={`text-white ${days === 0 ? 'text-yellow-400/60' : ''}`}>
                                  {days > 0 ? `${days} C` : 'SIGNAL PENDING'}
                              </span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-[var(--text-secondary)]">Base Rental</span>
                              <span className="text-white">{days > 0 ? inr(rentalCost) : '—'}</span>
                          </div>
                          {listing.securityDeposit > 0 && (
                              <div className="flex justify-between font-black">
                                  <span className="text-[var(--text-secondary)]">Asset Security <span className="text-[8px] text-green-400 opacity-60">(REFUNDABLE)</span></span>
                                  <span className="text-white">{inr(listing.securityDeposit)}</span>
                              </div>
                          )}
                          <div className="flex justify-between border-t border-white/5 pt-5">
                              <span className="font-black text-white">Full Valuation</span>
                              <span className={`text-xl font-black tracking-tighter ${days > 0 ? 'text-blue-400' : 'text-white/20'}`}>
                                  {days > 0 ? inr(totalAmount) : '—'}
                              </span>
                          </div>
                      </div>

                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] glass border border-white/5 rounded-2xl p-4 leading-relaxed">
                          ⚡ Security protocol: Asset security credits are returned post-session upon integrity verification.
                      </div>

                      {!payStep ? (
                          <button
                              onClick={validateAndProceed}
                              disabled={days < 1}
                              className="w-full py-5 btn-liquid rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                              {days < 1 ? 'Pending Inputs' : `Initiate Payment →`}
                          </button>
                      ) : (
                          <div className="space-y-6 animate-fade-in">
                              {dateError && (
                                  <p className="glass bg-red-500/5 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-red-500/20 animate-shake">{dateError}</p>
                              )}
                              <div className="space-y-4">
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">Identity on Card</label>
                                      <input type="text" placeholder="FULL NAME" value={cardName} onChange={e => setCardName(e.target.value)} className={inputClass} />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">Universal Signal (Card #)</label>
                                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength={19}
                                          value={cardNumber}
                                          onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                          className={inputClass} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">Expiry</label>
                                          <input type="text" placeholder="MM / YY" maxLength={7} value={expiry}
                                              onChange={e => setExpiry(e.target.value)}
                                              className={inputClass} />
                                      </div>
                                      <div className="space-y-1.5">
                                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">Vault Key (CVV)</label>
                                          <input type="password" placeholder="•••" maxLength={4} value={cvv}
                                              onChange={e => setCvv(e.target.value)}
                                              className={inputClass} />
                                      </div>
                                  </div>
                              </div>

                              <button onClick={handleConfirmBooking} disabled={isBooking}
                                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50">
                                  {isBooking ? 'Encrypting...' : `Complete Authorization`}
                              </button>

                              <button onClick={() => { setPayStep(false); setDateError(''); }} className="w-full text-center text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-white transition-colors">
                                  ← Return to Manifest
                              </button>

                              <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-40">
                                  🔒 Secure Sandbox: No actual credits will be drained.
                              </p>
                          </div>
                      )}
                  </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFlow;
