import React, { useState, useEffect } from 'react';
import { AISCShape } from '../../types/aisc';
import { loadAllShapes } from '../../utils/csvParser';
import WeldCalculator from './WeldCalculator';



// interface WeldingModuleProps removed as we load internally


const WeldingModule: React.FC = () => {
    const [shapes, setShapes] = useState<AISCShape[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'welds' | 'access' | 'clearance'>('welds');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await loadAllShapes();
                console.log("Loaded shapes:", data.length);
                setShapes(data);
            } catch (e) {
                console.error("Failed to load shapes", e);
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-8 h-8 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading Shop Data...
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Module Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="bg-[#76b900] w-2 h-8 rounded-full shadow-[0_0_10px_rgba(118,185,0,0.5)]"></span>
                    Shop Floor Tools: Welding
                </h2>
                <p className="text-gray-400 text-sm max-w-2xl ml-5">
                    Fabrication checks for structural integrity and constructability.
                    Includes Min/Max Welds (J2.4) and Weld Access Holes (J1.6).
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 bg-[#111] p-1 rounded-lg border border-gray-800 w-fit">
                <button
                    onClick={() => setActiveTab('welds')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${activeTab === 'welds'
                        ? 'bg-[#76b900] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Weld Calculator
                </button>
                <button
                    onClick={() => setActiveTab('access')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${activeTab === 'access'
                        ? 'bg-[#76b900] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Weld Access Holes
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'welds' && <WeldCalculator />}
                {activeTab === 'access' && (

                    <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 text-center flex flex-col items-center justify-center h-64">
                        <div className="text-4xl mb-4">🔧</div>
                        <h3 className="text-xl text-white font-bold mb-2">Weld Access Holes (J1.6)</h3>
                        <p className="text-gray-500">
                            Visualization and dimensioning for rat holes in CJP moment connections.
                            <br />Coming in the next update.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeldingModule;
