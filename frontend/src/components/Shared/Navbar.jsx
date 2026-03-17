import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const [buyOpen, setBuyOpen] = useState(false);
    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
        } catch (error) {
            console.error(error);
        }
    };

    const isActive = (paths) =>
        paths.some(p => location.pathname === p || (p !== '/' && location.pathname.startsWith(p)))
            ? 'text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
            : 'text-white/60 font-bold hover:text-white transition-all uppercase tracking-widest text-[10px]';

    return (
        <header className="sticky top-6 z-50 liquid-glass rounded-[2rem] px-8 py-4 flex justify-between items-center mx-6 mt-0 animate-fade-in shadow-2xl">

            {/* Logo */}
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                VehiX
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-6">
                <Link to="/rent" className={isActive(['/rent'])}>
                    🚗 Rent
                </Link>

                {/* Buy dropdown */}
                <div className="relative group/buy" onMouseEnter={() => setBuyOpen(true)} onMouseLeave={() => setBuyOpen(false)}>
                    <button className={`flex items-center gap-1.5 outline-none ${isActive(['/buy'])}`}>
                        🛒 Buy
                        <svg className={`w-3 h-3 transition-transform duration-300 ${buyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 transition-all duration-300 origin-top ${buyOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <div className="liquid-glass rounded-[1.5rem] border border-white/10 shadow-2xl overflow-hidden glass-reflection p-2">
                            <Link
                                to="/buy?condition=used"
                                onClick={() => setBuyOpen(false)}
                                className="flex items-center justify-between px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <span>Used Assets</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                            <div className="h-px bg-white/5 mx-4" />
                            <Link
                                to="/buy?condition=new"
                                onClick={() => setBuyOpen(false)}
                                className="flex items-center justify-between px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <span>New Arrivals</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <Link to="/sell" className={isActive(['/sell'])}>
                    💰 Sell
                </Link>

                {userInfo?.role === 'Admin' && (
                    <Link to="/admin" className={`${isActive(['/admin'])} text-orange-500`}>
                        🔑 Admin
                    </Link>
                )}

                <ThemeToggle />

                {userInfo ? (
                    <div className="flex items-center gap-6 pl-4 border-l border-white/10">
                        <Link to="/dashboard" className="group flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full liquid-bg flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform border border-white/20">
                                {userInfo.fullName?.[0]}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                                {userInfo.fullName?.split(' ')[0]}
                            </span>
                        </Link>
                        <button
                            onClick={logoutHandler}
                            className="bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 px-5 py-2.5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="btn-liquid px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20"
                    >
                        Initialize Auth
                    </Link>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
