import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetRentalDetailsQuery, useGetSaleDetailsQuery, useGetRentalListingsQuery, useGetSaleListingsQuery } from '../../slices/vehiclesApiSlice';
import { useCreateInquiryMutation } from '../../slices/inquiriesApiSlice';
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
        <div className="glass-frost rounded-2xl overflow-hidden relative" ref={containerRef}>
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
    const { data: rentData } = useGetRentalListingsQuery({}, { skip: mode !== 'rent' });
    const { data: saleData } = useGetSaleListingsQuery({}, { skip: mode !== 'buy' });

    const others = (mode === 'rent' ? rentData?.data : saleData?.data) || [];
    const filteredOthers = others.filter(l => l._id !== currentListing._id);
    const compareVehicle = selected?.vehicleProfile;
    const isRent = mode === 'rent';

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
    const [error, setError] = useState('');

    const { user } = useSelector(state => state.auth);
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
        if (days <= 0) { setError('Drop-off must be after pick-up.'); return; }
        navigate(`/book/${vehicleId}`, { state: { pickupDate, dropoffDate, days, totalRent, dailyRate: listing.dailyRate, securityDeposit: listing.securityDeposit } });
    };

    const handleSendOffer = async () => {
        if (!user) {
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

    const inputClass = "w-full glass border border-white/10 px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-transparent";

    if (offerSent) return (
        <div className="text-center space-y-3 py-6">
            <div className="text-5xl animate-bounce">✅</div>
            <p className="font-bold text-green-400 text-lg">Offer Sent!</p>
            <p className="text-sm text-[var(--text-secondary)]">Your offer of {inr(offerPrice)} has been sent to the seller.</p>
            <button onClick={() => { setOfferSent(false); setOfferPrice(''); }} className="text-sm text-blue-400 hover:underline">Send another</button>
        </div>
    );

    return (
        <div className="space-y-4">
            {error && <p className="glass text-red-400 text-sm px-3 py-2 rounded-xl border border-red-500/30">{error}</p>}

            {isRental ? (
                <>
                    <div><label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Pick-up</label>
                        <input type="datetime-local" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Drop-off</label>
                        <input type="datetime-local" value={dropoffDate} onChange={e => setDropoffDate(e.target.value)} min={pickupDate} className={inputClass} /></div>

                    <div className="glass rounded-xl p-3 space-y-2 text-sm border border-white/10">
                        {[
                            ['Daily Rate', `${inr(listing.dailyRate)}/day`],
                            ['Duration', days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '—'],
                            listing.securityDeposit > 0 && ['Security Deposit', inr(listing.securityDeposit)],
                        ].filter(Boolean).map(([label, value]) => (
                            <div key={label} className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">{label}</span>
                                <span className="font-semibold">{value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                            <span>Total</span>
                            <span className="text-blue-400">{days > 0 ? inr(totalRent + (listing.securityDeposit || 0)) : '—'}</span>
                        </div>
                    </div>

                    <button onClick={handleProceed} className="btn-liquid w-full py-3 rounded-xl pulse-glow">
                        Proceed to Booking →
                    </button>
                </>
            ) : (
                <>
                    <div className="glass rounded-xl p-3 text-sm border border-white/10 space-y-2">
                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Price</span><span className="font-bold text-blue-400">{inr(listing.price)}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Negotiable</span>
                            <span className={`font-bold ${listing.negotiable ? 'text-green-400' : 'text-red-400'}`}>{listing.negotiable ? 'Yes ✓' : 'No ✗'}</span></div>
                    </div>
                    {listing.negotiable && (
                        <div><label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Your Offer (₹)</label>
                            <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="Enter offer" className={inputClass} /></div>
                    )}
                    {listing.negotiable && <button onClick={handleSendOffer} disabled={isSendingOffer} className="w-full py-3 glass border border-white/20 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors disabled:opacity-50">
                        {isSendingOffer ? 'Sending...' : 'Send Offer'}
                    </button>}
                    <button className="btn-liquid w-full py-3 rounded-xl">Buy Now — {inr(listing.price)}</button>
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
    const pageRef = useScrollReveal();

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

    return (
        <div ref={pageRef} className="max-w-6xl mx-auto space-y-8 pb-16">

            {/* ── HERO HEADER ───────────────────────────────────────────── */}
            <div className="scroll-reveal glass-frost rounded-3xl p-8 relative overflow-hidden">
                {/* liquid blobs */}
                <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full liquid-bg opacity-20 liquid-blob pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full liquid-bg opacity-15 liquid-blob pointer-events-none" style={{ animationDelay: '-4s' }} />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs px-3 py-1 rounded-full font-bold glass border border-white/20 ${isRental ? 'text-blue-400' : 'text-purple-400'}`}>
                                {isRental ? '🚗 For Rent' : '🏷️ For Sale'}
                            </span>
                            <span className="text-xs px-3 py-1 glass rounded-full border border-white/20">{vehicle.type}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            {vehicle.year} {vehicle.make} <span className="liquid-text">{vehicle.model}</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-2">{vehicle.transmission} · {vehicle.fuelType} · {vehicle.color}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="block text-5xl font-black liquid-text">
                            {isRental ? inr(listing.dailyRate) : inr(listing.price)}
                        </span>
                        <span className="text-[var(--text-secondary)] text-sm">{isRental ? 'per day' : 'listed price'}</span>
                    </div>
                </div>
            </div>

            {/* ── 360° GALLERY ──────────────────────────────────────────── */}
            <div className="scroll-reveal">
                <View360 images={vehicle.images} />
            </div>

            {/* ── GRID ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left column */}
                <div className="md:col-span-2 space-y-6">

                    {/* Specs */}
                    <div className="scroll-reveal-left glass-frost rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-white/10">
                            <span className="liquid-text">Vehicle Specifications</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm stagger-children">
                            {[
                                { l: 'Mileage', v: `${vehicle.mileage?.toLocaleString('en-IN') || 0} km` },
                                { l: 'Color', v: vehicle.color || 'N/A' },
                                { l: 'Fuel Type', v: vehicle.fuelType },
                                { l: 'Transmission', v: vehicle.transmission },
                                isRental
                                    ? { l: 'Hourly Rate', v: `${inr(listing.hourlyRate)}/hr` }
                                    : { l: 'Condition', v: listing.condition },
                                isRental
                                    ? { l: 'Security Deposit', v: inr(listing.securityDeposit) }
                                    : { l: 'Negotiable', v: listing.negotiable ? 'Yes ✓' : 'No' },
                                isRental && { l: 'Pickup City', v: listing.pickupLocation?.city || 'N/A' },
                            ].filter(Boolean).map(({ l, v }) => (
                                <div key={l} className="scroll-reveal flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-[var(--text-secondary)]">{l}</span>
                                    <span className="font-semibold">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compare section */}
                    <div className="scroll-reveal-right glass-frost rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-white/10">
                            <span className="liquid-text">Split-Screen Compare</span>
                        </h2>

                        {/* Preview of split in this card */}
                        <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                            <img src={vehicle.images?.[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/70 flex items-center justify-end pr-6">
                                <button onClick={() => setShowCompare(true)}
                                    className="btn-liquid px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl">
                                    + Select to Compare
                                </button>
                            </div>
                            <div className="absolute top-3 left-3 glass px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                                Current Vehicle
                            </div>
                        </div>

                        <button onClick={() => setShowCompare(true)}
                            className="w-full py-3 glass border border-blue-500/30 text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-500/10 transition-all pulse-glow">
                            Open Full Comparison →
                        </button>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                            Drag the slider to compare two vehicles side-by-side
                        </p>
                    </div>
                </div>

                {/* Right: booking */}
                <div className="md:col-span-1">
                    <div className="scroll-reveal-right glass-frost rounded-2xl p-6 sticky top-24 border border-white/10 space-y-4">
                        <h3 className="text-lg font-bold border-b border-white/10 pb-2">
                            {isRental ? '🚗 Book this Ride' : '🏷️ Make an Offer'}
                        </h3>
                        <BookingPanel listing={listing} isRental={isRental} vehicleId={id} />

                        {/* Owner info */}
                        <div className="border-t border-white/10 pt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full liquid-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {(isRental ? listing.owner?.fullName : listing.seller?.fullName)?.[0] || 'V'}
                            </div>
                            <div className="text-sm">
                                <p className="font-bold">{isRental ? listing.owner?.fullName : listing.seller?.fullName}</p>
                                <p className="text-[var(--text-secondary)] text-xs">{isRental ? 'Vehicle Owner' : listing.seller?.role || 'Seller'}</p>
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
