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
        paths.some(p => location.pathname.startsWith(p))
            ? 'text-blue-500 font-bold'
            : 'font-medium hover:text-blue-500 transition-colors';

    return (
        <header className="sticky top-0 z-50 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl px-6 py-4 flex justify-between items-center bg-[var(--card-bg)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] mb-8 mx-4 mt-4">

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
                <div className="relative" onMouseEnter={() => setBuyOpen(true)} onMouseLeave={() => setBuyOpen(false)}>
                    <button className={`flex items-center gap-1 ${isActive(['/buy'])}`}>
                        🛒 Buy
                        <svg className={`w-3 h-3 transition-transform ${buyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {buyOpen && (
                        <div className="absolute top-full left-0 mt-2 w-44 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50">
                            <Link
                                to="/buy/used"
                                onClick={() => setBuyOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 transition-colors"
                            >
                                🏷️ <span>Used Vehicles</span>
                            </Link>
                            <div className="border-t border-[var(--border-color)]" />
                            <Link
                                to="/buy/new"
                                onClick={() => setBuyOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors"
                            >
                                ✨ <span>New Vehicles</span>
                            </Link>
                        </div>
                    )}
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
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="font-medium hover:text-blue-500 transition-colors text-sm">
                            👤 {userInfo.fullName?.split(' ')[0]}
                        </Link>
                        <button
                            onClick={logoutHandler}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-red-500/30 text-sm font-semibold"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl transition-transform hover:-translate-y-1 shadow-lg shadow-blue-500/30 font-semibold text-sm"
                    >
                        Sign In
                    </Link>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
