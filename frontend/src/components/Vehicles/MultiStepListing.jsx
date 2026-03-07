import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiStepListing = () => {
    const [step, setStep] = useState(1);
    const [listingType, setListingType] = useState('Rent'); // Rent or Buy
    const navigate = useNavigate();

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        // Will integrate with backend create listing API here
        alert('Listing submitted successfully!');
        navigate('/');
    };

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-lg rounded-xl overflow-hidden p-8 bg-[var(--card-bg)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <h1 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    List Your Vehicle
                </h1>

                {/* Stepper */}
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>
                    <div className={`absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded transition-all duration-300`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                    {['Basic Info', 'Condition', 'Media', 'Pricing'].map((label, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                                {idx + 1}
                            </div>
                            <span className="text-xs font-semibold mt-2 text-[var(--text-secondary)]">{label}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in text-[var(--text-primary)]">
                            <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2 mb-4">Vehicle Basics</h2>
                            <div className="flex space-x-4 mb-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" value="Rent" checked={listingType === 'Rent'} onChange={(e) => setListingType(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    <span>For Rent</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" value="Buy" checked={listingType === 'Buy'} onChange={(e) => setListingType(e.target.value)} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                                    <span>For Sale</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Vehicle Type</label>
                                    <select className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Car</option><option>Motorcycle</option><option>Scooter</option><option>EV</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Make</label>
                                    <input type="text" placeholder="e.g. Toyota" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Model</label>
                                    <input type="text" placeholder="e.g. Camry" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Year</label>
                                    <input type="number" placeholder="2022" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1">VIN / Registration Number</label>
                                    <input type="text" placeholder="VIN1234567890" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Condition */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in text-[var(--text-primary)]">
                            <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2 mb-4">Condition & Specs</h2>

                            {listingType === 'Buy' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-1">Condition status</label>
                                    <select className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>New</option><option>Used</option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Mileage (km)</label>
                                    <input type="number" placeholder="45000" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Color</label>
                                    <input type="text" placeholder="Black" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Transmission</label>
                                    <select className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Automatic</option><option>Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Fuel Type</label>
                                    <select className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                    <span className="text-sm font-semibold">Includes certified inspection report</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Media */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in text-[var(--text-primary)]">
                            <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2 mb-4">Media Upload</h2>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <p className="font-semibold">Drag and drop images here, or click to browse</p>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">High quality photos (exterior, interior, 360 view supported)</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Pricing */}
                    {step === 4 && (
                        <div className="space-y-4 animate-fade-in text-[var(--text-primary)]">
                            <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2 mb-4">Pricing & Finish</h2>

                            {listingType === 'Rent' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Hourly Rate ($)</label>
                                        <input type="number" placeholder="20" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Daily Rate ($)</label>
                                        <input type="number" placeholder="100" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold mb-1">Security Deposit ($)</label>
                                        <input type="number" placeholder="500" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Asking Price ($)</label>
                                        <input type="number" placeholder="25000" className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
                                        <p className="text-xs text-blue-500 mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                                            AI Suggests: $24,500 based on year and mileage
                                        </p>
                                    </div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-semibold">Price is negotiable</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-10">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="px-6 py-2 rounded-lg font-bold border border-[var(--border-color)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                Back
                            </button>
                        ) : <div></div> /* Empty div to keep alignment */}

                        <button type="submit" className="px-8 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center">
                            {step === 4 ? 'Publish Listing' : 'Next Step'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MultiStepListing;
