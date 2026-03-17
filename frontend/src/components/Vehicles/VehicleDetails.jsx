import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetRentalDetailsQuery, useGetSaleDetailsQuery, useGetRentalListingsQuery, useGetSaleListingsQuery } from '../../slices/vehiclesApiSlice';
import { useCreateInquiryMutation } from '../../slices/inquiriesApiSlice';
import { useUpdateProfileMutation, useGetProfileQuery } from '../../slices/usersApiSlice';
import useScrollReveal from '../../hooks/useScrollReveal';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/* ═══════════════════════════════════════════════════════════════
   360° INTERACTIVE SPINNER
   Drag left/right to cycle through frames (images).
   Each image acts as one "rotation frame".
═══════════════════════════════════════════════════════════════ */
const View360 = ({ images = [] }) => {
    const allImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900',
    ];

    const [frame, setFrame] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [rotationDeg, setRotationDeg] = useState(0);
    const lastX = useRef(0);
    const accumulated = useRef(0);
    const FRAME_DRAG_PX = 60; // px to move per frame change
    const containerRef = useRef(null);

    // Preload all images
    useEffect(() => {
        allImages.forEach(src => { const img = new Image(); img.src = src; });
    }, [allImages]);

    const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

    const onStart = (e) => {
        setIsDragging(true);
        setShowHint(false);
        lastX.current = getClientX(e);
        accumulated.current = 0;
        e.preventDefault();
    };

    const onMove = useCallback((e) => {
        if (!isDragging) return;
        const x = getClientX(e);
        const delta = x - lastX.current;
        accumulated.current += delta;
        setRotationDeg(d => d - delta * 0.5);

        if (Math.abs(accumulated.current) >= FRAME_DRAG_PX) {
            const steps = Math.floor(accumulated.current / FRAME_DRAG_PX);
            setFrame(f => (f - steps + allImages.length) % allImages.length);
            accumulated.current -= steps * FRAME_DRAG_PX;
        }
        lastX.current = x;
    }, [isDragging, allImages.length]);

    const onEnd = () => setIsDragging(false);

    return (
        <div className="liquid-glass rounded-[2rem] overflow-hidden relative glass-reflection" ref={containerRef}>
            {/* Main viewer */}
            <div
                className={`relative h-[440px] overflow-hidden select-none bg-gradient-to-b from-gray-900 to-black ${isDragging ? 'cursor-360-active' : 'cursor-360'}`}
                onMouseDown={onStart}
                onMouseMove={onMove}
                onMouseUp={onEnd}
                onMouseLeave={onEnd}
                onTouchStart={onStart}
                onTouchMove={onMove}
                onTouchEnd={onEnd}
            >
                {/* Vehicle image — scale slightly from rotation delta */}
                <img
                    src={allImages[frame]}
                    alt="360 view"
                    draggable={false}
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{ transform: `perspective(800px) rotateY(${rotationDeg * 0.02}deg) scale(${isDragging ? 1.02 : 1})` }}
                    onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80';
                    }}
                />

                {/* Liquid overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                {/* 360° badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    <span className="inline-block animate-spin" style={{ animationDuration: '3s' }}>↻</span>
                    Interactive 360°
                </div>

                {/* Drag hint */}
                {showHint && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="glass text-white px-6 py-3 rounded-2xl text-sm font-bold animate-pulse border border-white/20">
                            ← Drag to Spin →
                        </div>
                    </div>
                )}

                {/* Frame indicator bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                        className="h-full liquid-bg transition-all duration-150"
                        style={{ width: `${((frame + 1) / allImages.length) * 100}%` }}
                    />
                </div>

                {/* Frame counter */}
                <div className="absolute bottom-4 right-4 glass text-white text-xs px-3 py-1 rounded-full border border-white/20">
                    {frame + 1} / {allImages.length}
                </div>

                {/* Nav arrows */}
                {['‹', '›'].map((arrow, i) => (
                    <button key={arrow}
                        onClick={() => setFrame(f => i === 0 ? (f - 1 + allImages.length) % allImages.length : (f + 1) % allImages.length)}
                        className={`absolute ${i === 0 ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 glass border border-white/20 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center hover:bg-white/20 transition-colors`}
                    >{arrow}</button>
                ))}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-black/30 backdrop-blur-md">
                    {allImages.map((img, i) => (
                        <button key={i} onClick={() => setFrame(i)}
                            className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === frame ? 'border-blue-400 scale-110 shadow-lg shadow-blue-500/30' : 'border-white/10 opacity-50 hover:opacity-80'
                                }`}>
                            <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   DRAGGABLE SPLIT-SCREEN COMPARE
   A clip-path slider that reveals vehicle B over vehicle A.
═══════════════════════════════════════════════════════════════ */
const SplitCompare = ({ imageA, imageB, labelA, labelB, priceA, priceB }) => {
    const [split, setSplit] = useState(50);
    const [dragging, setDragging] = useState(false);
    const containerRef = useRef(null);

    const getPercent = useCallback((clientX) => {
        if (!containerRef.current) return 50;
        const { left, width } = containerRef.current.getBoundingClientRect();
        return Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    }, []);

    const onMove = useCallback((e) => {
        if (!dragging) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        setSplit(getPercent(x));
    }, [dragging, getPercent]);

    useEffect(() => {
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', () => setDragging(false));
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', () => setDragging(false));
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', () => setDragging(false));
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', () => setDragging(false));
        };
    }, [onMove]);

    if (!imageA || !imageB) {
        return (
            <div className="h-64 glass-card rounded-2xl flex items-center justify-center text-[var(--text-secondary)]">
                Select a vehicle to compare side-by-side
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative h-64 overflow-hidden rounded-2xl cursor-ew-resize select-none"
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
        >
            {/* Base image (A) */}
            <img src={imageA} alt={labelA} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <div className="absolute bottom-0 left-0 glass px-3 py-1.5 m-2 rounded-xl text-white text-xs font-bold">
                {labelA}<br /><span className="text-blue-300">{priceA}</span>
            </div>

            {/* Overlay image (B) clipped */}
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                <img src={imageB} alt={labelB} className="w-full h-full object-cover" style={{ width: `${10000 / split}%`, transformOrigin: 'left' }} draggable={false} />
                <div className="absolute bottom-0 left-0 glass px-3 py-1.5 m-2 rounded-xl text-white text-xs font-bold" style={{ minWidth: 'max-content' }}>
                    {labelB}<br /><span className="text-purple-300">{priceB}</span>
                </div>
            </div>

            {/* Handle */}
            <div
                className="compare-slider-handle"
                style={{ left: `calc(${split}% - 2px)` }}
            >
                <div className="compare-slider-btn">⇔</div>
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-4 text-white/60 text-xs font-bold uppercase tracking-wider">Before</div>
            <div className="absolute top-2 right-4 text-white/60 text-xs font-bold uppercase tracking-wider">Compare</div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   COMPARE MODAL
═══════════════════════════════════════════════════════════════ */
const CompareModal = ({ currentListing, currentVehicle, mode, onClose }) => {
    const [selected, setSelected] = useState(null);
    const { data: rentData, isLoading: rL } = useGetRentalListingsQuery({}, { skip: mode !== 'rent' });
    const { data: saleData, isLoading: sL } = useGetSaleListingsQuery({}, { skip: mode !== 'buy' });

    const others = (mode === 'rent' ? rentData?.data : saleData?.data) || [];
    const filteredOthers = others.filter(l => l._id !== currentListing._id && l.vehicleProfile);
    const compareVehicle = selected?.vehicleProfile;
    const isRent = mode === 'rent';
    const isLoading = mode === 'rent' ? rL : sL;

    const specs = [
        { label: 'Make', a: currentVehicle.make, b: compareVehicle?.make },
        { label: 'Model', a: currentVehicle.model, b: compareVehicle?.model },
        { label: 'Year', a: currentVehicle.year, b: compareVehicle?.year },
        { label: 'Type', a: currentVehicle.type, b: compareVehicle?.type },
        { label: 'Fuel', a: currentVehicle.fuelType, b: compareVehicle?.fuelType },
        { label: 'Gearbox', a: currentVehicle.transmission, b: compareVehicle?.transmission },
        { label: 'Mileage', a: `${currentVehicle.mileage?.toLocaleString('en-IN')} km`, b: compareVehicle ? `${compareVehicle.mileage?.toLocaleString('en-IN')} km` : '—' },
        isRent
            ? { label: 'Daily Rate', a: inr(currentListing.dailyRate), b: selected ? inr(selected.dailyRate) : '—' }
            : { label: 'Price', a: inr(currentListing.price), b: selected ? inr(selected.price) : '—' },
    ];

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-frost rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold liquid-text">Split-Screen Compare</h2>
                    <button onClick={onClose} className="w-8 h-8 glass rounded-full flex items-center justify-center hover:text-red-400 transition-colors">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Split-screen image compare */}
                    <SplitCompare
                        imageA={currentVehicle.images?.[0]}
                        imageB={compareVehicle?.images?.[0]}
                        labelA={`${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`}
                        labelB={compareVehicle ? `${compareVehicle.year} ${compareVehicle.make} ${compareVehicle.model}` : 'Select a vehicle →'}
                        priceA={isRent ? `${inr(currentListing.dailyRate)}/day` : inr(currentListing.price)}
                        priceB={selected ? (isRent ? `${inr(selected.dailyRate)}/day` : inr(selected.price)) : '—'}
                    />

                    {/* Spec table */}
                    <div className="glass rounded-2xl overflow-hidden border border-white/10">
                        <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider bg-white/5 px-4 py-2 text-[var(--text-secondary)]">
                            <span className="text-center">Spec</span>
                            <span className="text-center text-blue-400">This Vehicle</span>
                            <span className="text-center text-purple-400">Compare</span>
                        </div>
                        {specs.map((s, i) => (
                            <div key={s.label} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-white/3' : ''}`}>
                                <div className="px-4 py-2.5 text-[var(--text-secondary)] font-semibold text-center border-r border-white/10">{s.label}</div>
                                <div className="px-4 py-2.5 text-center font-bold border-r border-white/10">{s.a}</div>
                                <div className="px-4 py-2.5 text-center font-bold text-purple-400">{s.b || '—'}</div>
                            </div>
                        ))}
                    </div>

                    {/* Vehicle picker */}
                    {!selected && (
                        <div>
                            <p className="text-sm font-bold mb-3 text-[var(--text-secondary)]">Choose a vehicle to compare:</p>
                            {isLoading ? (
                                <p className="text-sm text-blue-400 animate-pulse">Loading vehicles...</p>
                            ) : filteredOthers.length === 0 ? (
                                <p className="text-sm text-[var(--text-secondary)]">No other vehicles available to compare.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-1">
                                    {filteredOthers.map(l => (
                                        <button key={l._id} onClick={() => setSelected(l)}
                                            className="glass-card text-left p-0 overflow-hidden hover:scale-105 transition-transform">
                                            <div className="h-16 bg-gray-800 overflow-hidden">
                                                <img src={l.vehicleProfile?.images?.[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-2">
                                                <p className="text-xs font-bold truncate">{l.vehicleProfile?.make} {l.vehicleProfile?.model}</p>
                                                <p className="text-xs text-blue-400">{isRent ? `${inr(l.dailyRate)}/day` : inr(l.price)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {selected && (
                        <button onClick={() => setSelected(null)} className="text-sm text-red-400 hover:underline">← Pick a different vehicle</button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   BOOKING PANEL
═══════════════════════════════════════════════════════════════ */
const BookingPanel = ({ listing, isRental, vehicleId }) => {
    const navigate = useNavigate();
    const [pickupDate, setPickupDate] = useState('');
    const [dropoffDate, setDropoffDate] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [offerSent, setOfferSent] = useState(false);
    const [buyNowSent, setBuyNowSent] = useState(false);
    const [error, setError] = useState('');

    const { userInfo } = useSelector(state => state.auth);
    const [createInquiry, { isLoading: isSendingOffer }] = useCreateInquiryMutation();

    const days = (() => {
        if (!pickupDate || !dropoffDate) return 0;
        const d = Math.ceil((new Date(dropoffDate) - new Date(pickupDate)) / 86400000);
        return d > 0 ? d : 0;
    })();

    const totalRent = days * (listing.dailyRate || 0);

    const handleProceed = () => {
        setError('');
        if (!pickupDate || !dropoffDate) { setError('Please select both dates.'); return; }
        if (days < 1) { setError('Minimum booking is 1 day.'); return; }
        navigate(`/book/${vehicleId}`, { state: { pickupDate, dropoffDate, days, totalRent, dailyRate: listing.dailyRate, securityDeposit: listing.securityDeposit } });
    };

    // Buffer for min date (current time + 15 mins) to avoid strict browser errors
    const minDateTime = useMemo(() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 15);
        return d.toISOString().slice(0, 16);
    }, []);

    const handleSendOffer = async () => {
        if (!userInfo) {
            setError('Please login to send an offer');
            return;
        }
        if (!offerPrice) { setError('Enter an offer amount'); return; }

        try {
            await createInquiry({
                listing: listing._id,
                listingModel: 'SaleListing',
                receiver: listing.seller._id,
                message: `I am interested in buying this vehicle. My offer is ${inr(offerPrice)}.`,
                offerPrice: Number(offerPrice)
            }).unwrap();

            setOfferSent(true);
        } catch (err) {
            setError(err?.data?.message || 'Failed to send offer');
        }
    };

    const handleBuyNow = async () => {
        if (!userInfo) {
            setError('Please login to proceed with purchase');
            return;
        }
        try {
            await createInquiry({
                listing: listing._id,
                listingModel: 'SaleListing',
                receiver: listing.seller._id,
                message: `I would like to buy this vehicle at the listed price of ${inr(listing.price)}. Please confirm availability.`,
                offerPrice: Number(listing.price)
            }).unwrap();
            setBuyNowSent(true);
        } catch (err) {
            setError(err?.data?.message || 'Failed to process Buy Now');
        }
    };

    const inputClass = "w-full glass border border-white/5 px-4 py-3 rounded-2xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 bg-white/5 glass-reflection";

    if (buyNowSent) return (
        <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="text-6xl animate-bounce">🎊</div>
            <h4 className="text-xl font-black text-white">Acquisition Logic Initialized</h4>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed px-4">The seller has been notified. Prepare for handover at {inr(listing.price)}.</p>
            <button onClick={() => setBuyNowSent(false)} className="py-2.5 px-6 glass border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Back to Hangar</button>
        </div>
    );

    if (offerSent) return (
        <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="text-6xl animate-bounce">📡</div>
            <h4 className="text-xl font-black text-white">Signal Broadcast Complete</h4>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed px-4">Your offer of {inr(offerPrice)} is now in the seller's vault.</p>
            <button onClick={() => { setOfferSent(false); setOfferPrice(''); }} className="py-2.5 px-6 glass border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">New Broadcast</button>
        </div>
    );

    return (
        <div className="space-y-6">
            {error && <p className="glass bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-red-500/20 animate-shake">{error}</p>}

            {isRental ? (
                <>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Deployment Start</label>
                            <input type="datetime-local" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={minDateTime} className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Deployment End</label>
                            <input type="datetime-local" value={dropoffDate} onChange={e => setDropoffDate(e.target.value)} min={pickupDate || minDateTime} className={inputClass} />
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-5 space-y-3 text-xs border border-white/5 bg-white/2 glass-reflection">
                        {[
                            ['Daily Rate', `${inr(listing.dailyRate)}`],
                            ['Duration', days > 0 ? `${days} Cycle${days > 1 ? 's' : ''}` : '—'],
                            listing.securityDeposit > 0 && ['Asset Security', inr(listing.securityDeposit)],
                        ].filter(Boolean).map(([label, value]) => (
                            <div key={label} className="flex justify-between font-bold">
                                <span className="text-[var(--text-secondary)] uppercase tracking-widest">{label}</span>
                                <span className="text-white">{value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-white/5 pt-3 font-black">
                            <span className="uppercase tracking-[0.2em] text-blue-400">Total Credits</span>
                            <span className="text-lg text-blue-400">{days > 0 ? inr(totalRent + (listing.securityDeposit || 0)) : '—'}</span>
                        </div>
                    </div>

                    <button onClick={handleProceed} className="btn-liquid w-full py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                        Initialize Session →
                    </button>
                </>
            ) : (
                <>
                    <div className="glass rounded-2xl p-5 text-xs border border-white/5 bg-white/2 glass-reflection space-y-3">
                        <div className="flex justify-between font-black uppercase tracking-widest">
                            <span className="text-[var(--text-secondary)]">List Price</span>
                            <span className="text-xl text-blue-400">{inr(listing.price)}</span>
                        </div>
                        <div className="flex justify-between font-bold uppercase tracking-widest">
                            <span className="text-[var(--text-secondary)]">Negotiable Protocol</span>
                            <span className={listing.negotiable ? 'text-green-400' : 'text-red-400'}>{listing.negotiable ? 'ENABLED ✓' : 'LOCKED ✗'}</span>
                        </div>
                    </div>
                    {listing.negotiable && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">Counter Signal (Offer)</label>
                            <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="0.00" className={inputClass} />
                        </div>
                    )}
                    {listing.negotiable && <button onClick={handleSendOffer} disabled={isSendingOffer} className="w-full py-4 glass border border-purple-500/30 text-purple-400 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-500/10 transition-all active:scale-95 disabled:opacity-50">
                        {isSendingOffer ? 'Encrypting...' : 'Broadcast Offer'}
                    </button>}
                    <button onClick={handleBuyNow} disabled={isSendingOffer} className="btn-liquid w-full py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50">
                        {isSendingOffer ? 'Processing...' : `Immediate Acquisition`}
                    </button>
                </>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN VEHICLE DETAILS PAGE
═══════════════════════════════════════════════════════════════ */
const VehicleDetails = () => {
    const { mode, id } = useParams();
    const [showCompare, setShowCompare] = useState(false);

    const { userInfo } = useSelector((state) => state.auth);
    const [updateProfile] = useUpdateProfileMutation();
    const { data: profileData } = useGetProfileQuery(undefined, { skip: !userInfo });

    const { data: rentalData, isLoading: iRL, error: rE } = useGetRentalDetailsQuery(id, { skip: mode !== 'rent' });
    const { data: saleData, isLoading: iSL, error: sE } = useGetSaleDetailsQuery(id, { skip: mode !== 'buy' });

    const isLoading = mode === 'rent' ? iRL : iSL;
    const error = mode === 'rent' ? rE : sE;
    const listing = mode === 'rent' ? rentalData?.data : saleData?.data;

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full liquid-bg animate-spin" />
                <p className="liquid-text text-2xl font-bold">Loading vehicle...</p>
            </div>
        </div>
    );
    if (error) return <div className="text-center mt-20 text-red-400 font-bold">Error loading vehicle!</div>;
    if (!listing) return <div className="text-center mt-20 text-[var(--text-secondary)]">Listing not found</div>;

    const vehicle = listing.vehicleProfile;
    const isRental = mode === 'rent';

    if (!vehicle) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 text-center glass-frost rounded-2xl border border-red-500/20">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-red-400 mb-2">Vehicle Profile Missing</h2>
                <p className="text-[var(--text-secondary)]">This listing's vehicle data has been removed or corrupted.</p>
            </div>
        );
    }

    const isSaved = profileData?.savedVehicles?.includes(vehicle?._id);

    const handleToggleSave = async () => {
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
        <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-fade-in px-4">

            {/* ── HERO HEADER ───────────────────────────────────────────── */}
            <div className="liquid-glass rounded-[3rem] p-12 relative overflow-hidden glass-reflection border border-white/10">
                {/* Save Heart Overlay */}
                <button
                    onClick={handleToggleSave}
                    className={`absolute top-8 right-10 z-20 w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center transition-all active:scale-90 ${isSaved ? 'text-red-500 scale-110 shadow-xl shadow-red-500/20' : 'text-white hover:text-red-400'}`}
                    title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                    <svg className={`w-7 h-7 ${isSaved ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                {/* liquid blobs */}
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full liquid-bg opacity-10 liquid-blob pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full liquid-bg opacity-10 liquid-blob pointer-events-none" style={{ animationDelay: '-4s' }} />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest glass border border-white/20 ${isRental ? 'text-blue-400' : 'text-purple-400'}`}>
                                {isRental ? 'Deployment Ready' : 'Acquisition Path'}
                            </span>
                            <span className="text-[10px] px-4 py-1.5 glass rounded-full border border-white/10 font-bold uppercase tracking-widest text-white/60">{vehicle.type} Protocol</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] pr-12">
                            {vehicle.year} {vehicle.make} <br/> 
                            <span className="liquid-text lowercase">{vehicle.model}</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-6 font-bold uppercase tracking-widest text-xs flex items-center gap-4">
                            <span>{vehicle.transmission}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <span>{vehicle.fuelType}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <span>{vehicle.color}</span>
                        </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="block text-6xl md:text-7xl font-black liquid-text tracking-tighter">
                            {isRental ? inr(listing.dailyRate) : inr(listing.price)}
                        </span>
                        <span className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 block pl-2">{isRental ? 'per lunar cycle' : 'base valuation'}</span>
                    </div>
                </div>
            </div>

            {/* ── 360° GALLERY ──────────────────────────────────────────── */}
            <div className="animate-fade-in-up">
                <View360 images={vehicle.images} />
            </div>

            {/* ── GRID ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Left column */}
                <div className="md:col-span-2 space-y-10">

                    {/* Specs */}
                    <div className="liquid-glass rounded-[2.5rem] p-10 border border-white/10 glass-reflection">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-2xl font-black">machine_specs</h2>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Verified Protocol</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.2em]">
                            {[
                                { l: 'Mileage', v: `${vehicle.mileage?.toLocaleString('en-IN') || 0} km` },
                                { l: 'Skin Filter', v: vehicle.color || 'N/A' },
                                { l: 'Propulsion', v: vehicle.fuelType },
                                { l: 'Transmission', v: vehicle.transmission },
                                isRental
                                    ? { l: 'Cycle Rate', v: `${inr(listing.hourlyRate)}/hr` }
                                    : { l: 'Condition', v: listing.condition },
                                isRental
                                    ? { l: 'Asset Security', v: inr(listing.securityDeposit) }
                                    : { l: 'Negotiable', v: listing.negotiable ? 'TRUE ✓' : 'LOCKED' },
                                isRental && { l: 'Hub City', v: listing.pickupLocation?.city || 'N/A' },
                            ].filter(Boolean).map(({ l, v }) => (
                                <div key={l} className="flex justify-between border-b border-white/5 pb-3 group">
                                    <span className="text-[var(--text-secondary)] group-hover:text-white transition-colors">{l}</span>
                                    <span className="text-white">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compare section */}
                    <div className="liquid-glass rounded-[2.5rem] p-10 border border-white/10 glass-reflection">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-2xl font-black">cross_comparison</h2>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-blue-400 cursor-help transition-colors">Split Lens Tech</div>
                        </div>

                        {/* Preview of split in this card */}
                        <div className="relative h-56 rounded-[2rem] overflow-hidden mb-8 border border-white/5 group">
                            <img src={vehicle.images?.[0]} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button onClick={() => setShowCompare(true)}
                                    className="btn-liquid px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                                    Initialize Compare
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-6 glass px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 border border-white/10 bg-black/40">
                                current_asset
                            </div>
                        </div>

                        <button onClick={() => setShowCompare(true)}
                            className="w-full py-4 glass border border-blue-500/30 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-500/10 transition-all active:scale-y-95">
                            Launch Comparative Analysis →
                        </button>
                    </div>
                </div>

                {/* Right: booking */}
                <div className="md:col-span-1">
                    <div className="liquid-glass rounded-[2.5rem] p-8 sticky top-24 border border-white/10 space-y-8 glass-reflection">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <h3 className="text-xl font-black">
                                {isRental ? 'Deploy' : 'Acquire'}
                            </h3>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                        <BookingPanel listing={listing} isRental={isRental} vehicleId={id} />

                        {/* Owner info */}
                        <div className="border-t border-white/5 pt-6 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-full liquid-bg flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg border-2 border-white/10 group-hover:scale-110 transition-transform">
                                {(isRental ? listing.owner?.fullName : listing.seller?.fullName)?.[0] || 'V'}
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-black text-white group-hover:text-blue-400 transition-colors">{(isRental ? listing.owner?.fullName : listing.seller?.fullName)}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{isRental ? 'Source Provider' : listing.seller?.role || 'Elite Seller'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compare modal */}
            {showCompare && (
                <CompareModal currentListing={listing} currentVehicle={vehicle} mode={mode} onClose={() => setShowCompare(false)} />
            )}
        </div>
    );
};

export default VehicleDetails;
