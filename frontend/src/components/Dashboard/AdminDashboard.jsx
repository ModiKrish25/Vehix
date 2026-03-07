import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetAllVehiclesAdminQuery,
    useAddRentalListingMutation,
    useAddSaleListingMutation,
    useDeleteRentalListingMutation,
    useDeleteSaleListingMutation,
} from '../../slices/adminVehiclesApiSlice';

// ─── Reusable stat card ───────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
    <div className={`bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl p-6 border-l-4 ${color} flex flex-col justify-center`}>
        <span className="text-[var(--text-secondary)] font-semibold text-sm">{label}</span>
        <span className="text-3xl font-black mt-1">{value}</span>
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

const AddVehicleModal = ({ onClose, addRent, addSale, isAddingRent, isAddingSale }) => {
    const [form, setForm] = useState(BLANK_FORM);
    const [listingType, setListingType] = useState('rent');
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
            if (listingType === 'rent') {
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
            onClose();
        } catch (err) {
            setError(err?.data?.message || 'Failed to add vehicle. Please check all fields.');
        }
    };

    const inputClass = "w-full bg-[var(--bg-color)] border border-[var(--border-color)] px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";
    const labelClass = "block text-xs font-semibold text-[var(--text-secondary)] mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h2 className="text-xl font-bold">Add New Vehicle</h2>
                    <button onClick={onClose} className="text-2xl text-[var(--text-secondary)] hover:text-red-500 transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Listing type toggle */}
                    <div className="flex bg-[var(--bg-color)] p-1 rounded-xl border border-[var(--border-color)]">
                        {['rent', 'sale'].map(t => (
                            <button key={t} type="button" onClick={() => setListingType(t)}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all capitalize ${listingType === t ? 'bg-blue-500 text-white shadow' : 'text-[var(--text-secondary)]'}`}>
                                {t === 'rent' ? '🚗 For Rent' : '🏷️ For Sale'}
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

                    <button type="submit" disabled={isAddingRent || isAddingSale}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isAddingRent || isAddingSale ? 'Adding...' : '✅ Add Vehicle'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Vehicle row ──────────────────────────────────────────────────────────────
const VehicleRow = ({ listing, listingType, onDelete, isDeleting }) => {
    const vp = listing.vehicleProfile;
    const price = listingType === 'rent'
        ? `₹${listing.dailyRate?.toLocaleString('en-IN')}/day`
        : `₹${listing.price?.toLocaleString('en-IN')}`;

    return (
        <div className="flex items-center justify-between bg-[var(--bg-color)] p-3 rounded-xl border border-[var(--border-color)] gap-4">
            <div className="w-14 h-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                {vp?.images?.[0]
                    ? <img src={vp.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{vp?.year} {vp?.make} {vp?.model}</p>
                <p className="text-xs text-[var(--text-secondary)]">{vp?.type} • {vp?.fuelType} • {vp?.transmission}</p>
            </div>
            <span className="hidden sm:block text-sm font-semibold text-blue-500 flex-shrink-0">{price}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ${listingType === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {listingType === 'rent' ? 'Rent' : 'Sale'}
            </span>
            <button onClick={() => onDelete(listing._id)} disabled={isDeleting}
                className="flex-shrink-0 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50">
                {isDeleting ? '...' : 'Delete'}
            </button>
        </div>
    );
};

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading, isError, refetch } = useGetAllVehiclesAdminQuery();
    const [addRent, { isLoading: isAddingRent }] = useAddRentalListingMutation();
    const [addSale, { isLoading: isAddingSale }] = useAddSaleListingMutation();
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
                <button onClick={() => setShowAddModal(true)}
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
                    <div className="p-6 space-y-4 h-[400px] overflow-y-auto">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex justify-between items-center bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                <div>
                                    <h4 className="font-bold">Pending Listing #{item}</h4>
                                    <p className="text-xs text-[var(--text-secondary)]">Submitted by: User (Dealer)</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 bg-green-500 text-white rounded font-bold text-sm hover:bg-green-600 transition-colors">Approve</button>
                                    <button className="px-4 py-2 bg-red-500 text-white rounded font-bold text-sm hover:bg-red-600 transition-colors">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── MANAGE USERS TAB ── */}
                {activeTab === 'users' && (
                    <div className="p-6 space-y-4 h-[400px] overflow-y-auto">
                        <div className="flex justify-between items-center bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                            <div>
                                <h4 className="font-bold">Jane Smith</h4>
                                <p className="text-xs text-[var(--text-secondary)]">jane@example.com • Registered: 2 days ago</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">Pending KYC</span>
                                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Review KYC</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <AddVehicleModal
                    onClose={() => setShowAddModal(false)}
                    addRent={addRent} addSale={addSale}
                    isAddingRent={isAddingRent} isAddingSale={isAddingSale}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
