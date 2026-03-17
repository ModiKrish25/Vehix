import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetAllVehiclesAdminQuery,
    useAddRentalListingMutation,
    useAddSaleListingMutation,
    useDeleteRentalListingMutation,
    useDeleteSaleListingMutation,
    useUpdateRentalListingMutation,
    useUpdateSaleListingMutation,
} from '../../slices/adminVehiclesApiSlice';

// ─── Reusable stat card ───────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
    <div className="liquid-glass border border-white/10 rounded-[2rem] p-8 glass-reflection relative group overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${color} opacity-60`} />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors uppercase">{label}</span>
        <div className="text-4xl font-black mt-2 tracking-tighter group-hover:liquid-text transition-all duration-500">{value}</div>
    </div>
);

// ─── Add Vehicle Form ─────────────────────────────────────────────────────────
const BLANK_FORM = {
    vinOrRegNumber: '', type: 'Car', make: '', model: '', year: new Date().getFullYear(),
    mileage: '', color: '', transmission: 'Manual', fuelType: 'Petrol',
    images: '',
    // Rent fields
    hourlyRate: '', dailyRate: '', securityDeposit: '',
    city: '', address: '', state: '', zip: '',
    // Sale fields
    price: '', condition: 'Used', negotiable: true,
};

const VehicleActionModal = ({ onClose, onSuccess, initialData, listingType: initialListingType, mutations }) => {
    const { addRent, addSale, updateRent, updateSale, isAddingRent, isAddingSale, isUpdatingRent, isUpdatingSale } = mutations;
    const isEdit = !!initialData;

    const [form, setForm] = useState(() => {
        if (isEdit) {
            const vp = initialData.vehicleProfile;
            return {
                ...initialData,
                ...vp,
                images: vp.images?.join(', ') || '',
                // Map rental fields
                city: initialData.pickupLocation?.city || '',
                address: initialData.pickupLocation?.address || '',
                state: initialData.pickupLocation?.state || '',
                zip: initialData.pickupLocation?.zip || '',
            };
        }
        return BLANK_FORM;
    });

    const [listingType, setListingType] = useState(initialListingType || 'rent');
    const [error, setError] = useState('');

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const imagesArr = form.images.split(',').map(u => u.trim()).filter(Boolean);
            const base = {
                vinOrRegNumber: form.vinOrRegNumber,
                type: form.type, make: form.make, model: form.model,
                year: Number(form.year), mileage: Number(form.mileage),
                color: form.color, transmission: form.transmission,
                fuelType: form.fuelType, images: imagesArr,
            };

            const data = { ...base };
            if (listingType === 'rent') {
                Object.assign(data, {
                    hourlyRate: Number(form.hourlyRate),
                    dailyRate: Number(form.dailyRate),
                    securityDeposit: Number(form.securityDeposit) || 0,
                    pickupLocation: { address: form.address, city: form.city, state: form.state, zip: form.zip },
                });
            } else {
                Object.assign(data, {
                    price: Number(form.price),
                    condition: form.condition,
                    negotiable: form.negotiable,
                });
            }

            if (isEdit) {
                if (listingType === 'rent') await updateRent({ id: initialData._id, data }).unwrap();
                else await updateSale({ id: initialData._id, data }).unwrap();
            } else {
                if (listingType === 'rent') await addRent(data).unwrap();
                else await addSale(data).unwrap();
            }
            onSuccess();
        } catch (err) {
            setError(err?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} vehicle. Please check all fields.`);
        }
    };

    const isSubmitting = isAddingRent || isAddingSale || isUpdatingRent || isUpdatingSale;

    const inputClass = "w-full bg-[var(--bg-color)] border border-[var(--border-color)] px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";
    const labelClass = "block text-xs font-semibold text-[var(--text-secondary)] mb-1";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className="liquid-glass border border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-reflection" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="space-y-1">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">{isEdit ? 'OVERRIDE_SEQUENCE' : 'INIT_REGISTRY'}</h2>
                        <h3 className="text-2xl font-black tracking-widest uppercase">{isEdit ? `Edit: ${form.make} ${form.model}` : 'New Asset Protocol'}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:border-red-500/50 transition-all">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Listing type toggle */}
                    <div className="flex glass p-1.5 rounded-2xl border border-white/10">
                        {['rent', 'sale'].map(t => (
                            <button key={t} type="button" onClick={() => !isEdit && setListingType(t)} disabled={isEdit && listingType !== t}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${listingType === t ? 'btn-liquid text-white shadow-lg' : 'text-white/30 hover:text-white/60'} ${isEdit && listingType !== t ? 'opacity-20' : ''}`}>
                                {t === 'rent' ? '🚗 Deployment' : '🏷️ Retention'}
                            </button>
                        ))}
                    </div>

                    {error && <p className="bg-red-100 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm">{error}</p>}

                    {/* Vehicle profile fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Reg Number *</label>
                            <input className={inputClass} value={form.vinOrRegNumber} onChange={e => set('vinOrRegNumber', e.target.value)} placeholder="e.g. MH01AB1234" required />
                        </div>
                        <div>
                            <label className={labelClass}>Type *</label>
                            <select className={inputClass} value={form.type} onChange={e => set('type', e.target.value)} required>
                                {['Car', 'Motorcycle', 'Scooter', 'EV'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Make *</label>
                            <input className={inputClass} value={form.make} onChange={e => set('make', e.target.value)} placeholder="e.g. Honda" required />
                        </div>
                        <div>
                            <label className={labelClass}>Model *</label>
                            <input className={inputClass} value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. City" required />
                        </div>
                        <div>
                            <label className={labelClass}>Year *</label>
                            <input type="number" className={inputClass} value={form.year} onChange={e => set('year', e.target.value)} min="1990" max="2030" required />
                        </div>
                        <div>
                            <label className={labelClass}>Mileage (km)</label>
                            <input type="number" className={inputClass} value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="e.g. 15000" />
                        </div>
                        <div>
                            <label className={labelClass}>Color</label>
                            <input className={inputClass} value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Pearl White" />
                        </div>
                        <div>
                            <label className={labelClass}>Transmission</label>
                            <select className={inputClass} value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                                <option>Manual</option><option>Automatic</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Fuel Type</label>
                            <select className={inputClass} value={form.fuelType} onChange={e => set('fuelType', e.target.value)}>
                                {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Image URLs (comma separated)</label>
                        <input className={inputClass} value={form.images} onChange={e => set('images', e.target.value)} placeholder="https://... , https://..." />
                    </div>

                    {/* Rental-specific fields */}
                    {listingType === 'rent' && (
                        <div className="space-y-3 border border-blue-200 dark:border-blue-900 rounded-xl p-4 bg-blue-50/30 dark:bg-blue-900/10">
                            <h4 className="font-bold text-blue-600 text-sm">Rental Details (₹)</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className={labelClass}>Hourly Rate (₹) *</label><input type="number" className={inputClass} value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} required /></div>
                                <div><label className={labelClass}>Daily Rate (₹) *</label><input type="number" className={inputClass} value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} required /></div>
                                <div><label className={labelClass}>Security Deposit (₹)</label><input type="number" className={inputClass} value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>City *</label><input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} required /></div>
                                <div><label className={labelClass}>State *</label><input className={inputClass} value={form.state} onChange={e => set('state', e.target.value)} required /></div>
                                <div><label className={labelClass}>Address</label><input className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} /></div>
                                <div><label className={labelClass}>ZIP</label><input className={inputClass} value={form.zip} onChange={e => set('zip', e.target.value)} /></div>
                            </div>
                        </div>
                    )}

                    {/* Sale-specific fields */}
                    {listingType === 'sale' && (
                        <div className="space-y-3 border border-purple-200 dark:border-purple-900 rounded-xl p-4 bg-purple-50/30 dark:bg-purple-900/10">
                            <h4 className="font-bold text-purple-600 text-sm">Sale Details (₹)</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className={labelClass}>Price (₹) *</label><input type="number" className={inputClass} value={form.price} onChange={e => set('price', e.target.value)} required /></div>
                                <div>
                                    <label className={labelClass}>Condition *</label>
                                    <select className={inputClass} value={form.condition} onChange={e => set('condition', e.target.value)}>
                                        <option>New</option><option>Used</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                    <input type="checkbox" id="neg" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} />
                                    <label htmlFor="neg" className="text-sm font-medium">Negotiable</label>
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting}
                        className="w-full py-4 btn-liquid rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-4">
                        {isSubmitting ? 'PROCESSING...' : (isEdit ? 'OVERRIDE_SAVE' : 'EXECUTE_ADDITION')}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Vehicle row ──────────────────────────────────────────────────────────────
const VehicleRow = ({ listing, listingType, onEdit, onDelete, isDeleting }) => {
    const vp = listing.vehicleProfile;
    const price = listingType === 'rent'
        ? `₹${listing.dailyRate?.toLocaleString('en-IN')}/day`
        : `₹${listing.price?.toLocaleString('en-IN')}`;

    return (
        <div className="flex items-center justify-between glass p-4 rounded-2xl border border-white/10 gap-6 hover:border-blue-500/30 transition-all group hover:bg-white/[0.02]">
            <div className="w-20 h-14 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 relative">
                {vp?.images?.[0] ? (
                    <img src={vp.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white/10 font-black">NA</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-black text-xs tracking-widest uppercase group-hover:text-blue-400 transition-colors">
                    {vp?.year} {vp?.make} <span className="text-white/60 lowercase">{vp?.model}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{vp?.type}</span>
                    <span className="text-white/10">•</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{vp?.transmission}</span>
                </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black tracking-widest text-white">{price}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${listingType === 'rent' ? 'text-blue-400/60' : 'text-purple-400/60'}`}>
                    {listingType === 'rent' ? 'Deployment_Active' : 'Retention_Unit'}
                </span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEdit(listing, listingType)}
                    className="px-4 py-2 bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    Modify
                </button>
                <button onClick={() => onDelete(listing._id, listingType)} disabled={isDeleting}
                    className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                    {isDeleting ? '...' : 'Dispose'}
                </button>
            </div>
        </div>
    );
};

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [showModal, setShowModal] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading, isError, refetch } = useGetAllVehiclesAdminQuery();
    const [addRent, { isLoading: isAddingRent }] = useAddRentalListingMutation();
    const [addSale, { isLoading: isAddingSale }] = useAddSaleListingMutation();
    const [updateRent, { isLoading: isUpdatingRent }] = useUpdateRentalListingMutation();
    const [updateSale, { isLoading: isUpdatingSale }] = useUpdateSaleListingMutation();
    const [deleteRent] = useDeleteRentalListingMutation();
    const [deleteSale] = useDeleteSaleListingMutation();

    if (userInfo?.role !== 'Admin') {
        return <div className="text-center mt-20 text-red-500 font-bold text-2xl">🚫 Access Denied</div>;
    }

    const rentals = data?.rentals?.data || [];
    const sales = data?.sales?.data || [];
    const totalVehicles = rentals.length + sales.length;

    // Filter helpers
    const filterListings = (arr, listingType) => arr.filter(item => {
        const vp = item.vehicleProfile;
        const matchType = filterType === 'all' || vp?.type === filterType;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || `${vp?.make} ${vp?.model} ${vp?.year}`.toLowerCase().includes(q);
        return matchType && matchSearch;
    });

    const filteredRentals = filterListings(rentals, 'rent');
    const filteredSales = filterListings(sales, 'sale');

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        setDeletingId(id);
        try {
            if (type === 'rent') await deleteRent(id).unwrap();
            else await deleteSale(id).unwrap();
        } catch (err) {
            alert('Delete failed: ' + (err?.data?.message || 'Unknown error'));
        } finally {
            setDeletingId(null);
        }
    };

    const tabs = [
        { id: 'vehicles', label: '🚗 Vehicle Management', color: 'blue' },
        { id: 'listings', label: '📋 Pending Listings', color: 'yellow' },
        { id: 'users', label: '👥 Manage Users', color: 'purple' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Admin Control Room
                </h1>
                <button onClick={() => { setEditingListing(null); setEditingType(null); setShowModal(true); }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity text-sm">
                    ＋ Add Vehicle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Vehicles" value={isLoading ? '...' : totalVehicles} color="border-blue-500" />
                <StatCard label="Rental Listings" value={isLoading ? '...' : rentals.length} color="border-indigo-500" />
                <StatCard label="Sale Listings" value={isLoading ? '...' : sales.length} color="border-purple-500" />
                <StatCard label="Monthly Revenue" value="₹2.4L" color="border-green-500" />
            </div>

            {/* Tab bar */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-2xl overflow-hidden">
                <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-color)]">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 font-bold text-center text-sm transition-colors ${activeTab === tab.id
                                ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-600 border-b-2 border-${tab.color}-600`
                                : 'text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── VEHICLE MANAGEMENT TAB ── */}
                {activeTab === 'vehicles' && (
                    <div className="p-6 space-y-4">
                        {/* Search + filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text" placeholder="Search by make, model, year..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                className="bg-[var(--bg-color)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="all">All Types</option>
                                {['Car', 'Motorcycle', 'Scooter', 'EV'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button onClick={refetch} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors">
                                ↻ Refresh
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
                            </div>
                        ) : isError ? (
                            <div className="text-red-500 text-center py-8">Failed to load vehicles.</div>
                        ) : (
                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                                {/* Rental listings */}
                                {filteredRentals.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-500 mb-2 flex items-center gap-2">
                                            🚗 Rental Listings <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{filteredRentals.length}</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {filteredRentals.map(r => (
                                                <VehicleRow key={r._id} listing={r} listingType="rent"
                                                    onEdit={(data, type) => { setEditingListing(data); setEditingType(type); setShowModal(true); }}
                                                    onDelete={(id) => handleDelete(id, 'rent')}
                                                    isDeleting={deletingId === r._id} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sale listings */}
                                {filteredSales.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-purple-500 mb-2 flex items-center gap-2">
                                            🏷️ Sale Listings <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">{filteredSales.length}</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {filteredSales.map(s => (
                                                <VehicleRow key={s._id} listing={s} listingType="sale"
                                                    onEdit={(data, type) => { setEditingListing(data); setEditingType(type); setShowModal(true); }}
                                                    onDelete={(id) => handleDelete(id, 'sale')}
                                                    isDeleting={deletingId === s._id} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filteredRentals.length === 0 && filteredSales.length === 0 && (
                                    <div className="text-center py-12 text-[var(--text-secondary)]">No vehicles match your filters.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PENDING LISTINGS TAB ── */}
                {activeTab === 'listings' && (
                    <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="text-5xl">🚧</div>
                        <h3 className="text-xl font-bold">Listing Approval Queue</h3>
                        <p className="text-[var(--text-secondary)] max-w-sm text-sm">Seller-submitted listing approvals will appear here. This feature is coming in the next release.</p>
                        <span className="text-xs px-3 py-1 glass border border-yellow-500/30 text-yellow-400 rounded-full font-bold">Coming Soon</span>
                    </div>
                )}

                {/* ── MANAGE USERS TAB ── */}
                {activeTab === 'users' && (
                    <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="text-5xl">👥</div>
                        <h3 className="text-xl font-bold">User Management</h3>
                        <p className="text-[var(--text-secondary)] max-w-sm text-sm">KYC verification and user management panel will appear here. This feature is coming in the next release.</p>
                        <span className="text-xs px-3 py-1 glass border border-purple-500/30 text-purple-400 rounded-full font-bold">Coming Soon</span>
                    </div>
                )}
            </div>

            {/* Vehicle Modal (Add/Edit) */}
            {showModal && (
                <VehicleActionModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); refetch(); }}
                    initialData={editingListing}
                    listingType={editingType}
                    mutations={{
                        addRent, addSale, updateRent, updateSale,
                        isAddingRent, isAddingSale, isUpdatingRent, isUpdatingSale
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
