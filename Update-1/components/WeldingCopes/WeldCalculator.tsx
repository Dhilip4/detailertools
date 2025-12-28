import React, { useState } from 'react';
import { getMinFilletWeld, getMaxFilletWeld } from '../../utils/weldingLogic';
import { toFraction } from '../../utils/format';

const WeldCalculator: React.FC = () => {
    // Manual inputs for now, can extend to select shape properties later
    const [tThinner, setTThinner] = useState<string>("0.375"); // 3/8"
    const [tEdge, setTEdge] = useState<string>("0.375");

    const tThinnerNum = parseFloat(tThinner) || 0;
    const tEdgeNum = parseFloat(tEdge) || 0;

    const minWeld = getMinFilletWeld(tThinnerNum);
    const maxWeld = getMaxFilletWeld(tEdgeNum);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Minimum Fillet Weld (J2.4) */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg flex flex-col">
                <h3 className="text-[#76b900] font-bold mb-4 uppercase tracking-wider text-sm border-b border-gray-700 pb-2">
                    Minimum Fillet Weld (Table J2.4)
                </h3>

                <div className="mb-6">
                    <label className="block text-gray-400 text-xs mb-1">Thinner Part Thickness (in)</label>
                    <input
                        type="number"
                        step="0.0625"
                        value={tThinner}
                        onChange={(e) => setTThinner(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none transition-colors"
                    />
                    <div className="text-right text-gray-500 text-xs mt-1">
                        = {toFraction(tThinnerNum)}
                    </div>
                </div>

                <div className="mt-auto bg-gray-900 p-4 rounded border border-gray-800 text-center">
                    <span className="block text-gray-500 text-xs uppercase mb-1">Minimum Weld Size</span>
                    <span className="text-4xl font-bold text-white font-mono">{minWeld.fraction}</span>
                    <span className="block text-gray-600 text-xs mt-1">({minWeld.decimal}")</span>
                </div>
            </div>

            {/* Maximum Fillet Weld (J2.2b) */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg flex flex-col">
                <h3 className="text-[#76b900] font-bold mb-4 uppercase tracking-wider text-sm border-b border-gray-700 pb-2">
                    Maximum Fillet Weld (Section J2.2b)
                </h3>

                <div className="mb-6">
                    <label className="block text-gray-400 text-xs mb-1">Plate Edge Thickness (in)</label>
                    <input
                        type="number"
                        step="0.0625"
                        value={tEdge}
                        onChange={(e) => setTEdge(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none transition-colors"
                    />
                    <div className="text-right text-gray-500 text-xs mt-1">
                        = {toFraction(tEdgeNum)}
                    </div>
                </div>

                <div className="mt-auto bg-gray-900 p-4 rounded border border-gray-800 text-center">
                    <span className="block text-gray-500 text-xs uppercase mb-1">Maximum Weld Size</span>
                    <span className="text-4xl font-bold text-white font-mono">{maxWeld.fraction}</span>
                    <span className="block text-[#76b900] text-xs mt-2">{maxWeld.note}</span>
                </div>
            </div>
        </div>
    );
};

export default WeldCalculator;
