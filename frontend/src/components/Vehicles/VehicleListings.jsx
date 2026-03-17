import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetRentalListingsQuery, useGetSaleListingsQuery } from '../../slices/vehiclesApiSlice';
import VehicleCard from './VehicleCard';
import useScrollReveal from '../../hooks/useScrollReveal';
import heroCar from '../../assets/snow_porsche_hero.png';

// ── Modes ──────────────────────────────────────────────────────
const MODES = [
    { id: 'rent', label: 'Rent', icon: '🚗', path: '/rent', accent: '#a78bfa' },
    { id: 'buy-used', label: 'Buy Used', icon: '🏷️', path: '/buy/used', accent: '#fb923c' },
    { id: 'buy-new', label: 'Buy New', icon: '✨', path: '/buy/new', accent: '#34d399' },
];

const getModeFromPath = (p) => {
    if (p.startsWith('/buy/new')) return 'buy-new';
    if (p.startsWith('/buy')) return 'buy-used';
    return 'rent';
};

// ── Scrollytelling scenes (3 phases) ──────────────────────────
// Each scene runs over a third of the scroll range [0,1]
const SCENES = [
    {
        // Phase 0 → 0.33
        headline: ['Find your', 'perfect ride.'],
        sub: "India's largest vehicle marketplace",
        tint: 'rgba(10,2,25,0.52)',
    },
    {
        // Phase 0.33 → 0.66
        headline: ['Rent.', 'Buy.', 'Sell.'],
        sub: 'One destination for every journey',
        tint: 'rgba(60,10,50,0.48)',
    },
    {
        // Phase 0.66 → 1.0
        headline: ['Your next', 'car awaits.'],
        sub: 'Browse 40+ curated vehicles right now',
        tint: 'rgba(5,15,30,0.55)',
    },
];

// ── Utility ───────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const norm = (v, lo, hi) => clamp((v - lo) / (hi - lo), 0, 1);

const Chip = ({ label, onRemove }) => (
    <span className="flex items-center gap-1 border border-white/30 text-white/80 text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm bg-white/10">
        {label}
        <button onClick={onRemove} className="hover:text-red-300 ml-0.5 transition-colors">✕</button>
    </span>
);

// ── Component ─────────────────────────────────────────────────
const VehicleListings = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [mode, setMode] = useState(() => getModeFromPath(location.pathname));
    const [make, setMake] = useState('');
    const [type, setType] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [search, setSearch] = useState('');
    const [animKey, setAnimKey] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    // Sync from query params (e.g. from Navbar dropdown)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cond = params.get('condition');
        if (cond === 'used') setMode('buy-used');
        if (cond === 'new') setMode('buy-new');
        
        const m = params.get('make');
        if (m) setMake(m);
        
        const t = params.get('type');
        if (t) setType(t);
    }, [location.search]);

    // Scroll progress 0 → 1 within the sticky zone
    const [progress, setProgress] = useState(0);
    const outerRef = useRef(null); // tall scroll container (~300vh)

    // Track scroll → compute progress
    useEffect(() => {
        const onScroll = () => {
            const el = outerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const scrollable = el.offsetHeight - window.innerHeight;
            const scrolled = -rect.top;
            setProgress(clamp(scrolled / scrollable, 0, 1));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMode(getModeFromPath(location.pathname)); }, [location.pathname]);

    const handleMode = (m) => {
        setMode(m); setMake(''); setType(''); setMaxPrice(''); setSearch('');
        setAnimKey(k => k + 1);
        navigate(MODES.find(x => x.id === m).path);
    };

    const isRent = mode === 'rent';
    const isBuyUsed = mode === 'buy-used';
    const isBuyNew = mode === 'buy-new';
    const isBuy = isBuyUsed || isBuyNew;

    const qp = {
        ...(make && { make }),
        ...(type && { type }),
        ...(maxPrice && { maxPrice }),
        ...(isBuyUsed && { condition: 'Used' }),
        ...(isBuyNew && { condition: 'New' }),
    };

    const { data: rentData, isLoading: loadR, error: errR } = useGetRentalListingsQuery(qp, { skip: !isRent });
    const { data: saleData, isLoading: loadS, error: errS } = useGetSaleListingsQuery(qp, { skip: !isBuy });

    const isLoading = isRent ? loadR : loadS;
    const error = isRent ? errR : errS;
    let listings = (isRent ? rentData?.data : saleData?.data) || [];

    if (search.trim()) {
        const q = search.toLowerCase();
        listings = listings.filter(l => {
            const vp = l.vehicleProfile;
            return [vp?.make, vp?.model, String(vp?.year), vp?.type, l.pickupLocation?.city, vp?.color]
                .some(f => f?.toLowerCase().includes(q));
        });
    }

    const modeConfig = MODES.find(m => m.id === mode);
    const hasFilters = make || type || maxPrice || search;
    const pageRef = useScrollReveal([listings.length, isLoading, animKey]);

    // ─── Scene math ───────────────────────────────────────────
    // progress [0,1] across 3 scenes of equal width
    const sceneIndex = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;
    const scene = SCENES[sceneIndex];

    // Each scene's local 0→1 progress
    const p0 = norm(progress, 0, 0.33);  // scene 0
    const p1 = norm(progress, 0.33, 0.66);  // scene 1
    const p2 = norm(progress, 0.66, 1.0);   // scene 2

    const localP = sceneIndex === 0 ? p0 : sceneIndex === 1 ? p1 : p2;

    // Scene 0 starts fully visible (no enter animation) and exits upward in last 30%
    // Scenes 1 & 2 enter from below in first 30% and exit upward in last 30%
    const isFirstScene = sceneIndex === 0;
    const textEnter = isFirstScene ? 1 : norm(localP, 0, 0.3);
    const textExit = norm(localP, 0.7, 1.0);
    const textY = textExit > 0 ? -(textExit * 70) : (1 - textEnter) * 70;
    const textOpacity = textExit > 0 ? 1 - textExit : textEnter;

    // Sub-label same pattern
    const subEnter = isFirstScene ? 1 : norm(localP, 0.05, 0.35);
    const subExit = norm(localP, 0.65, 0.95);
    const subOpacity = subExit > 0 ? 1 - subExit : subEnter;

    // Car parallax: subtle drift over entire progress
    const carY = progress * 55;
    const carScale = 1.04 + progress * 0.06;

    // Search/filter panel: fades in during last scene
    const controlsOpacity = norm(progress, 0.55, 0.85);
    const controlsY = (1 - controlsOpacity) * 30;

    // Scroll indicator: fades out after first 20% of scroll
    const scrollIndicatorOpacity = 1 - norm(progress, 0.05, 0.25);

    return (
        <div ref={pageRef} style={{ maxWidth: '1280px', margin: '0 auto' }}>

            {/* ═══════════════════════════════════════════════════════
                SCROLLYTELLING STICKY HERO  (300vh scroll zone)
            ════════════════════════════════════════════════════════ */}
            <div ref={outerRef} style={{ height: '300vh', position: 'relative' }}>

                {/* ── Sticky inner (100vh, always in viewport) ── */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    isolation: 'isolate',
                }}>

                    {/* ── Hero Background ── */}
                    <img
                        src={heroCar}
                        alt="Snow Porsche 911"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '110%',
                            top: '-5%',
                            objectFit: 'cover',
                            objectPosition: 'center 55%',
                            transform: `translateY(${carY}px) scale(${carScale})`,
                            willChange: 'transform',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* ── Cool dark overlay for snow visibility ── */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(
                            180deg,
                            rgba(15,20,30,0.35) 0%,
                            rgba(15,20,30,0.05) 45%,
                            rgba(10,15,25,0.85) 100%
                        )`,
                        transition: 'background 0.8s ease',
                        pointerEvents: 'none',
                    }} />

                    {/* ── Ice blue glow from bottom reflection ── */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at 50% 100%, rgba(80,140,220,0.12) 0%, transparent 60%)',
                        pointerEvents: 'none',
                    }} />

                    {/* ── MODE SWITCHER — top center ghost pills ── */}
                    <div style={{
                        position: 'absolute',
                        top: 28,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 8,
                        zIndex: 20,
                    }}>
                        {MODES.map(m => {
                            const active = mode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => handleMode(m.id)}
                                    style={{
                                        border: `1.5px solid ${active ? m.accent : 'rgba(255,255,255,0.3)'}`,
                                        color: active ? m.accent : 'rgba(255,255,255,0.75)',
                                        background: active ? `${m.accent}20` : 'rgba(0,0,0,0.25)',
                                        backdropFilter: 'blur(14px)',
                                        WebkitBackdropFilter: 'blur(14px)',
                                        boxShadow: active ? `0 0 18px ${m.accent}50` : 'none',
                                        padding: '7px 20px',
                                        borderRadius: 9999,
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    {m.icon} {m.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── SCENE TEXT — bottom-left, Gemini Car style ── */}
                    <div style={{
                        position: 'absolute',
                        bottom: 72,
                        left: 40,
                        zIndex: 20,
                        maxWidth: 560,
                    }}>
                        {/* Accent dot + label */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 12,
                            opacity: subOpacity,
                            transform: `translateY(${textY * 0.5}px)`,
                            transition: 'none',
                        }}>
                            <span style={{
                                width: 7, height: 7,
                                borderRadius: '50%',
                                background: modeConfig.accent,
                                boxShadow: `0 0 10px ${modeConfig.accent}`,
                                display: 'inline-block',
                                flexShrink: 0,
                            }} />
                            <span style={{
                                color: modeConfig.accent,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                            }}>
                                {scene.sub}
                            </span>
                        </div>

                        {/* Main scrollytelling headline */}
                        <div style={{
                            opacity: textOpacity,
                            transform: `translateY(${textY}px)`,
                            transition: 'none', // driven by scroll, no CSS transition
                        }}>
                            {scene.headline.map((line, i) => (
                                <div
                                    key={`${sceneIndex}-${i}`}
                                    style={{
                                        fontSize: 'clamp(2.8rem, 6.5vw, 5.8rem)',
                                        fontWeight: 900,
                                        lineHeight: 1.0,
                                        color: i === scene.headline.length - 1
                                            ? 'transparent'
                                            : '#ffffff',
                                        background: i === scene.headline.length - 1
                                            ? `linear-gradient(130deg, #fff 0%, ${modeConfig.accent} 100%)`
                                            : 'none',
                                        WebkitBackgroundClip: i === scene.headline.length - 1 ? 'text' : 'none',
                                        WebkitTextFillColor: i === scene.headline.length - 1 ? 'transparent' : '#fff',
                                        backgroundClip: i === scene.headline.length - 1 ? 'text' : 'none',
                                        letterSpacing: '-0.025em',
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                        textShadow: '0 2px 40px rgba(0,0,0,0.4)',
                                        marginBottom: 2,
                                    }}
                                >
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── SEARCH + FILTER (bottom-right, appears in scene 3) ── */}
                    <div style={{
                        position: 'absolute',
                        bottom: 48,
                        right: 40,
                        zIndex: 20,
                        opacity: controlsOpacity,
                        transform: `translateY(${controlsY}px)`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        minWidth: 360,
                        transition: 'none',
                    }}>
                        {/* Search */}
                        <div className="relative group/search">
                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                            <input
                                type="text"
                                placeholder="search_assets..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full liquid-glass border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-black uppercase tracking-[0.2em] outline-none focus:border-blue-500/50 transition-all glass-reflection text-white placeholder:text-white/20"
                            />
                        </div>

                        {/* Filter toggle + chips row */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <button
                                onClick={() => setShowFilters(f => !f)}
                                className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${showFilters ? 'btn-liquid border-transparent text-white shadow-lg shadow-blue-500/20' : 'glass border-white/10 text-white/60 hover:text-white'}`}
                            >
                                config_filters {hasFilters ? `[${[make, type, maxPrice].filter(Boolean).length}]` : ''}
                            </button>
                            {search && <Chip label={search} onRemove={() => setSearch('')} />}
                            {make && <Chip label={make} onRemove={() => setMake('')} />}
                            {type && <Chip label={type} onRemove={() => setType('')} />}
                            {maxPrice && <Chip label={`≤${inr(maxPrice)}`} onRemove={() => setMaxPrice('')} />}
                        </div>

                        {/* Expanded filters */}
                        <div className={`grid grid-cols-2 gap-3 transition-all duration-300 origin-top overflow-hidden ${showFilters ? 'opacity-100 max-h-40 pointer-events-auto mt-2' : 'opacity-0 max-h-0 pointer-events-none'}`}>
                            <div className="relative">
                                <input type="text" placeholder="BRAND" value={make} onChange={e => setMake(e.target.value)}
                                    className="w-full glass border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/30 transition-all text-white placeholder:text-white/20" />
                            </div>
                            <div className="relative">
                                <input type="number" placeholder={isRent ? 'MAX_RATE' : 'MAX_VALUATION'} value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                    className="w-full glass border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/30 transition-all text-white placeholder:text-white/20" />
                            </div>
                            <div className="col-span-2 relative">
                                <select value={type} onChange={e => setType(e.target.value)}
                                    className="w-full glass border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/30 transition-all text-white/60 appearance-none cursor-pointer">
                                    <option value="" className="bg-black">ALL_TYPES</option>
                                    <option value="Car" className="bg-black">VEHICLE_CLASS / CAR</option>
                                    <option value="Motorcycle" className="bg-black">VEHICLE_CLASS / MOTORCYCLE</option>
                                    <option value="Scooter" className="bg-black">VEHICLE_CLASS / SCOOTER</option>
                                    <option value="EV" className="bg-black">VEHICLE_CLASS / EV</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[8px]">▼</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Scene progress dots ── */}
                    <div style={{
                        position: 'absolute',
                        right: 24,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        zIndex: 20,
                    }}>
                        {SCENES.map((_, i) => (
                            <div key={i} style={{
                                width: i === sceneIndex ? 8 : 5,
                                height: i === sceneIndex ? 8 : 5,
                                borderRadius: '50%',
                                background: i === sceneIndex ? modeConfig.accent : 'rgba(255,255,255,0.3)',
                                boxShadow: i === sceneIndex ? `0 0 12px ${modeConfig.accent}` : 'none',
                                transition: 'all 0.3s ease',
                            }} />
                        ))}
                    </div>

                    {/* ── Scroll indicator (fades as user scrolls) ── */}
                    <div style={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        opacity: scrollIndicatorOpacity,
                        zIndex: 20,
                        transition: 'opacity 0.3s',
                        pointerEvents: 'none',
                    }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            Scroll
                        </span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" style={{ animation: 'float-up 1.8s ease-in-out infinite' }}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>

                </div>{/* end sticky */}
            </div>{/* end 300vh outer */}

            {/* ═══════════════════════════════════════════════════════
                BELOW THE HERO — listings & banner
            ════════════════════════════════════════════════════════ */}
            <div className="space-y-6 mt-8">

                {/* Marketplace banner */}
                {isBuy && (
                    <div className="scroll-reveal glass-frost rounded-2xl p-5 relative overflow-hidden border border-white/10">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ background: `linear-gradient(135deg, ${modeConfig.accent}, transparent)` }} />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h2 className="font-extrabold text-lg">
                                    {isBuyUsed ? '🏷️ Used Vehicle Marketplace' : '✨ New Vehicle Marketplace'}
                                </h2>
                                <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                                    {isBuyUsed ? 'Pre-owned · inspected · transparent pricing' : 'Brand-new · manufacturer warranty · zero mileage'}
                                </p>
                            </div>
                            <div className="text-5xl opacity-30">{isBuyUsed ? '🔄' : '🆕'}</div>
                        </div>
                    </div>
                )}

                {/* Results count */}
                {!isLoading && !error && (
                    <div className="flex items-center justify-between text-sm px-1">
                        <span className="text-[var(--text-secondary)]">
                            {listings.length === 0 ? 'No vehicles found' : `${listings.length} vehicle${listings.length !== 1 ? 's' : ''} found`}
                        </span>
                        {hasFilters && <span className="font-medium" style={{ color: modeConfig.accent }}>Filtered results</span>}
                    </div>
                )}

                {/* Listings grid */}
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full liquid-bg animate-spin" />
                                <p className="text-sm text-[var(--text-secondary)]">Loading vehicles...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="glass-frost text-red-400 p-8 rounded-2xl text-center border border-red-500/20">
                            <p className="font-bold text-lg">Error fetching vehicles</p>
                            <p className="text-sm mt-1">Please try again later.</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="glass-frost text-center py-20 rounded-2xl border border-white/10">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-[var(--text-secondary)]">No vehicles found</h3>
                            <p className="mt-2 text-[var(--text-secondary)] text-sm">Try adjusting your search or filters.</p>
                            {isBuyNew && <p className="mt-3 text-sm text-green-400">Tip: Most listings are Used. Switch to the Used tab.</p>}
                        </div>
                    ) : (
                        <div key={animKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
                            {listings.map(listing => (
                                <div key={listing._id} className="scroll-reveal">
                                    <VehicleCard listing={listing} type={isRent ? 'rent' : 'buy'} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleListings;
