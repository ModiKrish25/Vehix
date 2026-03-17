import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="mt-20 py-16 border-t border-white/10 liquid-glass rounded-t-[3rem] mx-4 mb-4 relative z-10">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand Section */}
                <div className="space-y-6">
                    <Link to="/" className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        VehiX
                    </Link>
                    <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">
                        Elevating India's vehicle marketplace with premium glassmorphism and world-class trade flows. Ride into the future.
                    </p>
                    <div className="flex gap-4">
                        {['𝕏', '📸', '📘', '🔗'].map((icon, i) => (
                            <button key={i} className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 active:scale-90">
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Marketplace Links */}
                <div className="space-y-6">
                    <h4 className="text-white font-black uppercase tracking-widest text-xs">Marketplace</h4>
                    <ul className="space-y-4">
                        {['Rent a Ride', 'Buy New', 'Buy Used', 'Sell Vehicle'].map((link) => (
                            <li key={link}>
                                <Link to={link === 'Rent a Ride' ? '/rent' : link.includes('Sell') ? '/sell' : '/buy'} className="text-[var(--text-secondary)] hover:text-blue-400 transition-colors text-sm font-semibold">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Account Links */}
                <div className="space-y-6">
                    <h4 className="text-white font-black uppercase tracking-widest text-xs">Command Center</h4>
                    <ul className="space-y-4">
                        {['Dashboard', 'My Inquiries', 'Saved Garage', 'Support'].map((link) => (
                            <li key={link}>
                                <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-purple-400 transition-colors text-sm font-semibold">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support Section */}
                <div className="space-y-6">
                    <h4 className="text-white font-black uppercase tracking-widest text-xs">Protocol</h4>
                    <ul className="space-y-4">
                        <li className="text-[var(--text-secondary)] text-sm font-semibold hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                            <span>📞</span> +91 98765 43210
                        </li>
                        <li className="text-[var(--text-secondary)] text-sm font-semibold hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                            <span>📧</span> support@vehix.com
                        </li>
                    </ul>
                    <div className="p-4 rounded-2xl glass border border-white/5 bg-white/2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/80 mb-2">System Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-white/80 font-bold">All protocols online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Area */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-50">
                    &copy; 2026 VehiX Digital Systems — All Rights Reserved
                </p>
            </div>
        </footer>
    );
};

export default Footer;
