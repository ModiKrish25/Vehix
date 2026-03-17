import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddRentalListingMutation, useAddSaleListingMutation } from '../../slices/adminVehiclesApiSlice';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Registry Init', 'Specifications', 'Visual Cache', 'Final Protocol'];
const STEP_ICONS = ['💿', '🔧', '📸', '💎'];

const BLANK = {
    listingType: 'rent',
    // Vehicle profile
    vinOrRegNumber: '', type: 'Car', make: '', model: '',
    year: new Date().getFullYear(), mileage: '', color: '',
    transmission: 'Automatic', fuelType: 'Petrol', condition: 'Used',
    images: '',
    // Rent fields
    hourlyRate: '', dailyRate: '', securityDeposit: '',
    city: '', state: '', address: '', zip: '',
    // Sale fields
    price: '', negotiable: true,
};

const inputCls = "w-full glass border border-white/10 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-blue-500/50 bg-transparent transition-all placeholder:text-white/10 text-white";
const labelCls = "block text-[9px] font-black text-white/40 mb-2 uppercase tracking-[0.2em]";
const selectCls = `${inputCls} cursor-pointer appearance-none`;

const MultiStepListing = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(BLANK);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [addRent, { isLoading: isAddingRent }] = useAddRentalListingMutation();
    const [addSale, { isLoading: isAddingSale }] = useAddSaleListingMutation();
    const isSubmitting = isAddingRent || isAddingSale;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!form.vinOrRegNumber.trim()) return setError('Registration number is required.'), false;
            if (!form.make.trim()) return setError('Make is required.'), false;
            if (!form.model.trim()) return setError('Model is required.'), false;
            if (!form.year || form.year < 1990 || form.year > 2030) return setError('Enter a valid year (1990–2030).'), false;
        }
        if (step === 3) {
            // Images optional, but if provided validate URLs
        }
        if (step === 4) {
            if (form.listingType === 'rent') {
                if (!form.dailyRate || Number(form.dailyRate) <= 0) return setError('Daily rate is required.'), false;
                if (!form.hourlyRate || Number(form.hourlyRate) <= 0) return setError('Hourly rate is required.'), false;
                if (!form.city.trim()) return setError('Pickup city is required.'), false;
                if (!form.state.trim()) return setError('Pickup state is required.'), false;
            } else {
                if (!form.price || Number(form.price) <= 0) return setError('Sale price is required.'), false;
            }
        }
        return true;
    };

    const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
    const prev = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

    const handleSubmit = async () => {
        if (!validateStep()) return;
        try {
            const imagesArr = form.images.split(',').map(u => u.trim()).filter(Boolean);
            const base = {
                vinOrRegNumber: form.vinOrRegNumber, type: form.type,
                make: form.make, model: form.model, year: Number(form.year),
                mileage: Number(form.mileage) || 0, color: form.color,
                transmission: form.transmission, fuelType: form.fuelType,
                images: imagesArr,
            };

            if (form.listingType === 'rent') {
                await addRent({
                    ...base,
                    hourlyRate: Number(form.hourlyRate),
                    dailyRate: Number(form.dailyRate),
                    securityDeposit: Number(form.securityDeposit) || 0,
                    pickupLocation: { address: form.address, city: form.city, state: form.state, zip: form.zip },
                }).unwrap();
            } else {
                await addSale({
                    ...base,
                    price: Number(form.price),
                    condition: form.condition,
                    negotiable: form.negotiable,
                }).unwrap();
            }
            setSuccess(true);
        } catch (err) {
            setError(err?.data?.message || 'Submission failed. Please try again.');
        }
    };

    if (success) return (
        <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-fade-in">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <div className="text-8xl relative z-10 animate-float">💎</div>
            </div>
            <h2 className="text-4xl font-black liquid-text tracking-tighter">ASSET_PUBLISHED</h2>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">
                {form.year} {form.make} {form.model} // Deployment sequence complete.
            </p>
            <div className="flex gap-4 justify-center pt-8">
                <button onClick={() => navigate(form.listingType === 'rent' ? '/rent' : '/buy')}
                    className="btn-liquid px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20">
                    Access Marketplace →
                </button>
                <button onClick={() => { setForm(BLANK); setStep(1); setSuccess(false); }}
                    className="glass border border-white/10 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                    Register New Asset
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-16 px-6 animate-fade-in">
            {/* Title */}
            <div className="text-center mb-16 space-y-3">
                <h1 className="text-5xl font-black liquid-text tracking-tighter uppercase">Registry_Terminal</h1>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Initialize global asset deployment sequence</p>
            </div>

            {/* Step progress */}
            <div className="relative flex items-center justify-between mb-16 px-4">
                {/* Track line */}
                <div className="absolute top-5 left-0 right-0 h-px bg-white/5 z-0" />
                <div
                    className="absolute top-5 left-0 h-px liquid-bg z-0 transition-all duration-700 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                />
                {STEP_LABELS.map((label, i) => {
                    const n = i + 1;
                    const done = step > n;
                    const active = step === n;
                    return (
                        <div key={n} className="flex flex-col items-center z-10 gap-3 group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 cursor-pointer ${done ? 'liquid-bg text-white shadow-lg scale-90 opacity-60' : active ? 'liquid-bg text-white shadow-2xl scale-125 ring-[12px] ring-blue-500/10' : 'glass border border-white/10 text-white/20 hover:border-white/30'}`}
                                 onClick={() => i < step && setStep(n)}>
                                {done ? '✓' : STEP_ICONS[i]}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active ? 'text-blue-400 opacity-100' : 'text-white/20 opacity-40 group-hover:opacity-60'}`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Card */}
            <div className="liquid-glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl glass-reflection">
                {/* Card header */}
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                        <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{STEP_ICONS[step - 1]}</span>
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Sequence_Phase_{step}</h2>
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase">{STEP_LABELS[step - 1]}</h3>
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-blue-400/50 mono tracking-widest">
                        {String(step).padStart(2, '0')} // {String(TOTAL_STEPS).padStart(2, '0')}
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {error && (
                        <div className="glass border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ── STEP 1: Type & Basics ─────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            {/* Listing type toggle */}
                            <div>
                                <p className={labelCls}>Listing Type</p>
                                <div className="flex gap-3">
                                    {[{ val: 'rent', icon: '🚗', label: 'For Rent' }, { val: 'sale', icon: '🏷️', label: 'For Sale' }].map(({ val, icon, label }) => (
                                        <button key={val} type="button" onClick={() => set('listingType', val)}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${form.listingType === val ? 'liquid-bg text-white border-transparent shadow-lg' : 'glass border-white/10 text-[var(--text-secondary)] hover:bg-white/5'}`}>
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelCls}>Registration / VIN Number *</label>
                                    <input value={form.vinOrRegNumber} onChange={e => set('vinOrRegNumber', e.target.value)} placeholder="e.g. MH01AB1234" className={inputCls} required />
                                </div>
                                <div>
                                    <label className={labelCls}>Vehicle Type</label>
                                    <select value={form.type} onChange={e => set('type', e.target.value)} className={selectCls}>
                                        {['Car', 'Motorcycle', 'Scooter', 'EV'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Year *</label>
                                    <input type="number" value={form.year} onChange={e => set('year', e.target.value)} min="1990" max="2030" className={inputCls} required />
                                </div>
                                <div>
                                    <label className={labelCls}>Make *</label>
                                    <input value={form.make} onChange={e => set('make', e.target.value)} placeholder="e.g. Honda" className={inputCls} required />
                                </div>
                                <div>
                                    <label className={labelCls}>Model *</label>
                                    <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. City" className={inputCls} required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Specs ───────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Mileage (km)</label>
                                    <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="e.g. 15000" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Color</label>
                                    <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Pearl White" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Transmission</label>
                                    <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className={selectCls}>
                                        <option>Automatic</option><option>Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Fuel Type</label>
                                    <select value={form.fuelType} onChange={e => set('fuelType', e.target.value)} className={selectCls}>
                                        {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                {form.listingType === 'sale' && (
                                    <div className="col-span-2">
                                        <label className={labelCls}>Condition</label>
                                        <select value={form.condition} onChange={e => set('condition', e.target.value)} className={selectCls}>
                                            <option>Used</option><option>New</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Photos ──────────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <label className={labelCls}>Image URLs (comma-separated)</label>
                                <textarea
                                    value={form.images}
                                    onChange={e => set('images', e.target.value)}
                                    placeholder="https://example.com/car1.jpg, https://example.com/car2.jpg"
                                    rows={4}
                                    className={`${inputCls} resize-none`}
                                />
                                <p className="text-xs text-[var(--text-secondary)] mt-1">Enter one or more image URLs separated by commas. First image will be the cover.</p>
                            </div>

                            {/* Preview */}
                            {form.images && (
                                <div>
                                    <p className={labelCls}>Preview</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {form.images.split(',').map(u => u.trim()).filter(Boolean).map((url, i) => (
                                            <div key={i} className="aspect-video rounded-xl overflow-hidden bg-black/30 border border-white/10">
                                                <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!form.images && (
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center text-[var(--text-secondary)] gap-3">
                                    <span className="text-4xl">📷</span>
                                    <p className="text-sm font-semibold">Paste image URLs above to preview them here</p>
                                    <p className="text-xs opacity-60">Good photos get 3× more inquiries</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: Pricing ─────────────────────────────── */}
                    {step === 4 && (
                        <div className="space-y-5 animate-fade-in">
                            {form.listingType === 'rent' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Hourly Rate (₹) *</label>
                                            <input type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="e.g. 150" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Daily Rate (₹) *</label>
                                            <input type="number" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} placeholder="e.g. 1500" className={inputCls} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelCls}>Security Deposit (₹)</label>
                                            <input type="number" value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} placeholder="e.g. 5000 (optional)" className={inputCls} />
                                        </div>
                                    </div>
                                    <div className="border-t border-white/10 pt-4">
                                        <p className={labelCls}>Pickup Location</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>City *</label>
                                                <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" className={inputCls} />
                                            </div>
                                            <div>
                                                <label className={labelCls}>State *</label>
                                                <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" className={inputCls} />
                                            </div>
                                            <div className="col-span-2">
                                                <label className={labelCls}>Address</label>
                                                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street" className={inputCls} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className={labelCls}>Asking Price (₹) *</label>
                                        <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 850000" className={inputCls} />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-6 rounded-full transition-all ${form.negotiable ? 'liquid-bg' : 'bg-white/10'} relative`}
                                            onClick={() => set('negotiable', !form.negotiable)}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.negotiable ? 'left-7' : 'left-1'}`} />
                                        </div>
                                        <span className="text-sm font-semibold">Price is negotiable</span>
                                    </label>
                                </>
                            )}

                            {/* Summary preview */}
                            <div className="glass rounded-2xl border border-white/10 p-4 space-y-2 text-sm">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-3">📋 Listing Preview</h4>
                                {[
                                    ['Vehicle', `${form.year} ${form.make} ${form.model}`],
                                    ['Type', `${form.type} · ${form.listingType === 'rent' ? 'For Rent' : 'For Sale'}`],
                                    ['Fuel / Gearbox', `${form.fuelType} · ${form.transmission}`],
                                    form.listingType === 'rent'
                                        ? ['Daily Rate', form.dailyRate ? `₹${Number(form.dailyRate).toLocaleString('en-IN')}/day` : '—']
                                        : ['Price', form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '—'],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">{k}</span>
                                        <span className="font-semibold">{v || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer navigation */}
                <div className="px-10 py-8 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
                    {step > 1 ? (
                        <button type="button" onClick={prev}
                            className="px-8 py-3.5 glass border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white">
                            ← Previous_Phase
                        </button>
                    ) : <div />}

                    {step < TOTAL_STEPS ? (
                        <button type="button" onClick={next}
                            className="btn-liquid px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                            Next_Protocol →
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                            className="btn-liquid px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 pulse-glow shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                            {isSubmitting ? 'Processing...' : 'Deploy_Listing'}
                        </button>
                    )}
                </div>
            </div>

            {/* Step dots below */}
            <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i + 1 === step ? 'w-8 liquid-bg' : i + 1 < step ? 'w-4 bg-blue-500/50' : 'w-4 bg-white/10'}`} />
                ))}
            </div>
        </div>
    );
};

export default MultiStepListing;
