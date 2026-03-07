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
        <div className="max-w-7xl mx-auto py-10 space-y-10">
            {/* Dealer Header */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl overflow-hidden p-8 bg-gradient-to-r from-gray-800 to-[var(--card-bg)] text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="w-32 h-32 rounded-full bg-white text-[var(--bg-color)] flex justify-center items-center text-5xl font-black shadow-2xl z-10">
                    D
                </div>
                <div className="z-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold mb-2">Premium Motors Dealership</h1>
                    <p className="text-gray-300 flex items-center justify-center md:justify-start">
                        <svg className="w-5 h-5 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        4.9 (120 Reviews)
                    </p>
                    <p className="text-gray-300 text-sm mt-3 max-w-xl">
                        Verified Dealer. We offer the best condition, pre-inspected vehicles. All prices are competitive and financing is available.
                    </p>
                </div>
            </div>

            {/* Dealer Inventory */}
            <div>
                <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex justify-between items-center">
                    Inventory ({inventory.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {inventory.map((item) => (
                        <div key={item._id} className="relative group">
                            <VehicleCard listing={item} type="buy" />
                            {/* Dealer Tag */}
                            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow pointer-events-none">
                                DEALER LISTING
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DealerProfile;
