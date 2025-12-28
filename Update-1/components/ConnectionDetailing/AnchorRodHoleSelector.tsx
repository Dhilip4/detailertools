import React, { useState } from 'react';
import { toFraction } from '../../utils/format';
import { ANCHOR_ROD_DIAMETERS, getAnchorHoleSize } from '../../utils/aiscData';

const AnchorRodHoleSelector: React.FC = () => {
    const [selectedRod, setSelectedRod] = useState<number>(0.75);
    const [customRod, setCustomRod] = useState<string>('');

    const handleStandardSelect = (d: number) => {
        setSelectedRod(d);
        setCustomRod('');
    };

    const handleCustomChange = (val: string) => {
        setCustomRod(val);
        const floatVal = parseFloat(val);
        if (!isNaN(floatVal)) {
            setSelectedRod(floatVal);
        }
    };

    const holeSize = getAnchorHoleSize(selectedRod);

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg mt-4 w-full">
            <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-1 flex justify-between items-center px-1">
                <span>Anchor Rod Hole Sizes</span>
                <span className="text-xs text-gray-500 font-normal">AISC Table 14-2</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">

                {/* Left: Inputs */}
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider block mb-2 font-bold">Standard Rod Diameter (in)</span>
                        <div className="flex flex-wrap gap-2">
                            {ANCHOR_ROD_DIAMETERS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => handleStandardSelect(d)}
                                    className={`px-3 py-1.5 rounded border text-sm font-mono transition-colors ${selectedRod === d && !customRod
                                            ? 'bg-[#76b900] text-black border-[#76b900] font-bold'
                                            : 'bg-black text-gray-300 border-gray-700 hover:border-[#76b900] hover:text-white'
                                        }`}
                                >
                                    {toFraction(d)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500 text-xs">OR Custom &gt; 2":</span>
                        <input
                            type="number"
                            value={customRod}
                            onChange={(e) => handleCustomChange(e.target.value)}
                            placeholder='2.5'
                            className="bg-black border border-gray-700 rounded px-2 py-1 text-white w-20 text-sm focus:border-[#76b900] outline-none"
                        />
                    </div>
                </div>

                {/* Right: Results */}
                <div className="bg-black/30 rounded border border-gray-800 p-4 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Hole Diameter</span>

                    {holeSize > 0 ? (
                        <>
                            <span className="text-4xl text-white font-mono font-bold text-[#76b900] mb-1">
                                {toFraction(holeSize)}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                                ({holeSize}")
                            </span>
                            {selectedRod > 2 && (
                                <span className="text-[10px] text-gray-600 mt-2">
                                    Rule: db + 1 1/4"
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-500 text-sm italic">
                            Select valid diameter
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AnchorRodHoleSelector;
