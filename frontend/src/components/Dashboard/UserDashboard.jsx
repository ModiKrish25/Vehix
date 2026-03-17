import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMyBookingsQuery } from '../../slices/bookingsApiSlice';
import { useGetMyInquiriesQuery } from '../../slices/inquiriesApiSlice';
import { useUpdateProfileMutation, useGetProfileQuery } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';

/* ────────────────────────────────────────────────
   EDIT PROFILE MODAL
──────────────────────────────────────────────── */
const EditProfileModal = ({ userInfo, onClose }) => {
    const dispatch = useDispatch();
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const [activeTab, setActiveTab] = useState('identity'); // 'identity' or 'security'

    const [fullName, setFullName] = useState(userInfo?.fullName || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (activeTab === 'security' && password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const payload = { fullName, email };
            if (password) payload.password = password;

            const res = await updateProfile(payload).unwrap();
            dispatch(setCredentials({ 
                ...userInfo, 
                fullName: res.fullName || fullName, 
                email: res.email || email 
            }));
            setSuccess('Profile updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err?.data?.message || 'Failed to update profile.');
        }
    };

    const inputClass = 'w-full glass border border-white/5 px-4 py-3 rounded-2xl text-sm outline-none bg-white/5 transition-all focus:ring-2';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="liquid-glass rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-4xl border border-white/10 overflow-hidden relative flex flex-col md:flex-row min-h-[500px] animate-liquid-appear" onClick={(e) => e.stopPropagation()}>
                
                {/* Visual Background Decor */}
                <div className="absolute -top-32 -left-32 w-96 h-96 liquid-bg opacity-[0.08] liquid-blob pointer-events-none blur-3xl animate-float-slow" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 liquid-bg opacity-[0.08] liquid-blob pointer-events-none blur-3xl animate-float-slow" style={{ animationDelay: '-4s' }} />

                {/* Vertical Sidebar */}
                <div className="w-full md:w-72 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col items-center relative z-10 glass-reflection">
                    {/* Liquid Profile Pulse */}
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 liquid-bg rounded-full blur-xl opacity-40 group-hover:opacity-100 transition-opacity animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full liquid-bg p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-black border-4 border-white/10 flex items-center justify-center text-4xl font-black text-white">
                                {userInfo?.fullName?.substring(0, 1) || 'U'}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-xl shadow-lg">
                            ✨
                        </div>
                    </div>

                    <h3 className="text-xl font-black liquid-text text-center mb-8">{userInfo?.fullName}</h3>

                    <div className="w-full space-y-3">
                        <button 
                            onClick={() => setActiveTab('identity')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm group ${activeTab === 'identity' ? 'btn-liquid shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            <span className="text-lg group-hover:scale-125 transition-transform">👤</span> Personal Identity
                        </button>
                        <button 
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm group ${activeTab === 'security' ? 'btn-liquid shadow-lg shadow-purple-500/20' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            <span className="text-lg group-hover:scale-125 transition-transform">🛡️</span> Secure Vault
                        </button>
                    </div>

                    <div className="mt-auto pt-8 w-full border-t border-white/10">
                        <button 
                            onClick={onClose}
                            className="w-full py-3 glass border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95"
                        >
                            Exit System
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-10 relative z-10 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div className="animate-fade-in-right">
                            <h2 className="text-3xl font-black liquid-text lowercase tracking-tighter">
                                /{activeTab}
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm font-medium">Manage your system {activeTab === 'identity' ? 'credentials' : 'access codes'}.</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 text-lg active:scale-90">✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                        <div className="animate-fade-in">
                            {activeTab === 'identity' ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Legal Full Name</label>
                                        <div className="group relative">
                                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <input 
                                                type="text" 
                                                value={fullName} 
                                                onChange={(e) => setFullName(e.target.value)}
                                                className={`${inputClass} focus:border-blue-500/50 focus:ring-blue-500/20 glass-reflection`}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Digital Signal (Email)</label>
                                        <div className="group relative">
                                            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`${inputClass} focus:border-blue-500/50 focus:ring-blue-500/20 glass-reflection`}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-[2rem] p-6 mb-6 glass-reflection">
                                        <p className="text-xs text-purple-300 font-medium">
                                            🔒 Ensure your vault remains encrypted. Use a strong password with symbols and numbers.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">New Access Key</label>
                                            <div className="group relative">
                                                <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                                <input 
                                                    type="password" 
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className={`${inputClass} focus:border-purple-500/50 focus:ring-purple-500/20 glass-reflection`}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 ml-1">Verify Key</label>
                                            <div className="group relative">
                                                <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                                <input 
                                                    type="password" 
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className={`${inputClass} focus:border-purple-500/50 focus:ring-purple-500/20 glass-reflection`}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="glass bg-red-500/10 text-red-400 text-xs font-bold px-6 py-4 rounded-2xl border border-red-500/20 flex items-center gap-3 animate-shake">
                                <span className="text-sm">⚠️</span> {error}
                            </div>
                        )}
                        {success && (
                            <div className="glass bg-green-500/10 text-green-400 text-xs font-bold px-6 py-4 rounded-2xl border border-green-500/20 flex items-center gap-3 animate-fade-in">
                                <span className="text-sm">✅</span> {success}
                            </div>
                        )}

                        <div className="mt-auto pt-8">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-liquid py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] disabled:opacity-50 shadow-[0_0_50px_rgba(59,130,246,0.2)] active:scale-95 transition-all glass-reflection group"
                            >
                                {isLoading ? 'Decrypting...' : (
                                    <span className="flex items-center justify-center gap-3">
                                        Confirm /${activeTab} update
                                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────
   MAIN DASHBOARD
──────────────────────────────────────────────── */
const UserDashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [showEditProfile, setShowEditProfile] = useState(false);

    const { data: bData, isLoading: bLoading } = useGetMyBookingsQuery();
    const { data: iData, isLoading: iLoading } = useGetMyInquiriesQuery();
    const { data: profileData } = useGetProfileQuery();

    const bookings = Array.isArray(bData?.data) ? bData.data : (Array.isArray(bData) ? bData : []);
    const inquiries = Array.isArray(iData?.data) ? iData.data : (Array.isArray(iData) ? iData : []);
    const savedCount = profileData?.savedVehicles?.length || 0;

    if (bLoading || iLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full liquid-bg animate-spin" />
                <p className="liquid-text text-2xl font-bold">Loading Digital Garage...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-10 space-y-12 animate-fade-in px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <h1 className="text-5xl font-black relative inline-block">
                    <span className="relative z-10 liquid-text lowercase tracking-tighter">/my-garage</span>
                    <div className="absolute -bottom-2 left-0 w-full h-2 liquid-bg rounded-full opacity-30 blur-sm" />
                </h1>
                <p className="text-[var(--text-secondary)] font-medium text-sm border-l-2 border-white/10 pl-4">
                    Orchestrate your vehicle empire. <br/> {bookings.length} active sessions detected.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Widget */}
                <div className="liquid-glass shadow-2xl rounded-[2.5rem] overflow-hidden p-10 flex flex-col items-center justify-center text-center relative border border-white/10 group glass-reflection">
                    <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full liquid-bg opacity-10 liquid-blob pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full liquid-bg opacity-10 liquid-blob pointer-events-none group-hover:scale-110 transition-transform duration-1000" style={{ animationDelay: '-4s' }} />

                    <div className="relative z-10 w-28 h-28 rounded-full liquid-bg p-1 shadow-2xl mb-6 group-hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-black border-4 border-white/10 flex items-center justify-center text-4xl font-black text-white">
                            {userInfo?.fullName?.substring(0, 1) || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-black animate-pulse" />
                    </div>
                    
                    <div className="relative z-10 w-full">
                        <h2 className="text-2xl font-black text-white mb-1">{userInfo?.fullName}</h2>
                        <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-8">{userInfo?.role || 'User'} Protocol</p>
                        
                        <button 
                            onClick={() => setShowEditProfile(true)}
                            className="w-full py-4 btn-liquid rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <span>✏️</span> Edit Identity
                        </button>
                    </div>
                </div>

                {/* Stats Widget */}
                <div className="liquid-glass rounded-[2.5rem] p-10 md:col-span-2 flex flex-col justify-between border border-white/10 glass-reflection">
                    <div>
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                                Marketplace Signals
                            </h3>
                            <div className="flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                            <div className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group/card bg-white/2 hover:bg-white/5 transition-all">
                                <span className="block text-4xl font-black text-blue-500 mb-2">{bookings.length}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Active Rentals</span>
                            </div>
                            <div className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group/card bg-white/2 hover:bg-white/5 transition-all">
                                <span className="block text-4xl font-black text-purple-500 mb-2">{savedCount}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Saved Garage</span>
                            </div>
                            <div className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group/card bg-white/2 hover:bg-white/5 transition-all">
                                <span className="block text-4xl font-black text-green-500 mb-2">{inquiries.length}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Open Offers</span>
                            </div>
                        </div>
                    </div>
                    {/* Activity Feed */}
                    <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-xs font-bold text-[var(--text-secondary)]">
                                {bookings.length > 0
                                    ? `System detects ${bookings.length} active deployment${bookings.length > 1 ? 's' : ''}.`
                                    : 'Garage is currently sterile. Initialize browse routine.'}
                            </p>
                        </div>
                        <Link to="/rent" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                            Initialize ↗
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="liquid-glass rounded-[3rem] p-10 border border-white/10 glass-reflection">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-3xl font-black tracking-tighter">deployment_log</h3>
                    <div className="glass px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/5">
                        Live Stream
                    </div>
                </div>
                
                {bookings.length === 0 ? (
                    <div className="text-center py-16 opacity-30">
                        <span className="text-5xl block mb-4">📭</span>
                        <p className="font-black uppercase tracking-widest text-xs">No deployments detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="group flex justify-between items-center p-6 rounded-[2.5rem] bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center space-x-6">
                                    <div className="w-24 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl group-hover:scale-105 transition-transform">
                                        <img
                                            src={booking.rentalListing?.vehicleProfile?.images?.[0]}
                                            alt=""
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
                                            {booking.rentalListing?.vehicleProfile?.make || 'Unknown'}{' '}
                                            {booking.rentalListing?.vehicleProfile?.model || 'Vehicle'}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                                {new Date(booking.startDate).toLocaleDateString()}
                                            </span>
                                            <span className="text-white/20">|</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-black text-blue-500 mb-1">
                                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                    <Link to={`/vehicles/rent/${booking.rentalListing?._id}`} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                        Audit ↗
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <EditProfileModal
                    userInfo={userInfo}
                    onClose={() => setShowEditProfile(false)}
                />
            )}
        </div>
    );
};

export default UserDashboard;
