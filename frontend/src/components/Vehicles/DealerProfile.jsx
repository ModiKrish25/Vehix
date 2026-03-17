import { useParams } from 'react-router-dom';
import { useGetSaleListingsQuery } from '../../slices/vehiclesApiSlice';
import VehicleCard from './VehicleCard';

const DealerProfile = () => {
    const { id } = useParams();
    // Simulate fetching dealer's inventory
    const { data, isLoading, error } = useGetSaleListingsQuery({});

    if (isLoading) return <div className="text-center mt-20 text-2xl font-bold">Loading Dealer Profile...</div>;

    // In a real app we'd filter by dealer id or the backend query would handle it.
    const inventory = data?.data || [];

    return (
        <div className="max-w-7xl mx-auto py-10 space-y-12 px-4 animate-fade-in">
            {/* Dealer Header */}
            <div className="liquid-glass rounded-[3rem] overflow-hidden p-10 flex flex-col md:flex-row items-center gap-10 relative border border-white/10 glass-reflection">
                <div className="absolute top-0 right-0 w-80 h-80 liquid-bg rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
                <div className="w-36 h-36 rounded-full liquid-bg p-1 shadow-2xl z-10">
                    <div className="w-full h-full rounded-full bg-black border-4 border-white/10 flex items-center justify-center text-6xl font-black text-white">
                        D
                    </div>
                </div>
                <div className="z-10 text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-4">
                        <h1 className="text-4xl md:text-5xl font-black liquid-text tracking-tighter lowercase">/premium-motors</h1>
                        <span className="text-[10px] px-3 py-1 glass rounded-full border border-white/10 font-bold uppercase tracking-widest text-blue-400/80">Verified Protocol</span>
                    </div>
                    <p className="text-gray-300 flex items-center justify-center md:justify-start gap-2 font-bold uppercase tracking-widest text-xs mb-6">
                        <span className="text-yellow-500">★★★★★</span>
                        4.9 (120 Intelligence Reports)
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-2xl font-medium">
                        Elite Tier Dealer. Orchestrating the exchange of high-performance assets. All units pre-inspected. Financing protocols active.
                    </p>
                </div>
                <div className="flex gap-4 md:self-end md:mb-2">
                   <button className="px-6 py-2.5 glass border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Direct Link</button>
                   <button className="px-6 py-2.5 btn-liquid rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10">Inquiry Protocol</button>
                </div>
            </div>

            {/* Dealer Inventory */}
            <div>
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
                    <h2 className="text-3xl font-black tracking-tighter">inventory_cache</h2>
                    <div className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/10">
                        {inventory.length} Assets Detected
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {inventory.map((item) => (
                        <div key={item._id} className="relative group">
                            <VehicleCard listing={item} type="buy" />
                            {/* Dealer Tag */}
                            <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 bg-purple-500/20 backdrop-blur-md pointer-events-none group-hover:scale-105 transition-transform z-20">
                                🛡️ Dealer Verified
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DealerProfile;
