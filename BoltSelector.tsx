import React, { useState } from 'react';
import { BOLT_DIAMETERS, HOLE_DIMENSIONS, EDGE_DISTANCES, BOLT_CLEARANCES } from '../../utils/connectionData';
import { BoltDiameter } from '../../types/connection';
import ClearanceVisualizer from './ClearanceVisualizer';
import FilletEncroachment from './FilletEncroachment';
import GageSelector from './GageSelector';
import AnchorRodHoleSelector from './AnchorRodHoleSelector';
import BoltRowsSelector from './BoltRowsSelector';
import { toFraction } from '../../utils/format';

const BoltSelector: React.FC = () => {
    const [selectedBolt, setSelectedBolt] = useState<BoltDiameter>("3/4");

    const hole = HOLE_DIMENSIONS[selectedBolt];
    const edge = EDGE_DISTANCES[selectedBolt];
    const clearance = BOLT_CLEARANCES[selectedBolt];

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Bolt Size Grid */}
            <div>
                <h3 className="text-[#76b900] mb-2 font-bold uppercase text-sm tracking-wider">Select Bolt Diameter (in)</h3>
                <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
                    {BOLT_DIAMETERS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setSelectedBolt(d)}
                            className={`p-2 rounded border text-center transition-colors ${selectedBolt === d
                                ? 'bg-[#76b900] text-black border-[#76b900] font-bold shadow-[0_0_10px_rgba(118,185,0,0.5)]'
                                : 'bg-[#1a1a1a] text-gray-300 border-gray-700 hover:border-[#76b900] hover:text-white'
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Grid: 650px layout, minimal gaps */}
            {/* Layout Grid: Tables & Wrench Clearances */}
            <div className="grid grid-cols-1 xl:grid-cols-[600px_1fr] gap-1 items-start">
                {/* Left Column: Data Tables */}
                <div className="flex flex-col gap-2 text-sm">
                    {/* Hole Dimensions */}
                    <div className="bg-[#1a1a1a] p-2 rounded-xl border border-gray-800 shadow-lg flex-1">
                        <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1 flex justify-between items-center px-1">
                            <span>Table J3.3 - Nominal Hole Dimensions</span>
                            <span className="text-xs text-gray-500 font-normal">AISC 16th Ed.</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="bg-black/30 p-2 rounded border border-gray-800">
                                <span className="text-gray-400 block mb-1 text-xs uppercase tracking-wide">Standard (STD)</span>
                                <span className="text-2xl text-[#76b900] font-mono font-bold">{toFraction(hole.standard)}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-gray-800">
                                <span className="text-gray-400 block mb-1 text-xs uppercase tracking-wide">Oversized (OVS)</span>
                                <span className="text-2xl text-white font-mono">{toFraction(hole.oversized)}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-gray-800">
                                <span className="text-gray-400 block mb-1 text-xs uppercase tracking-wide">Short Slot (SSL)</span>
                                <span className="text-xl text-white font-mono leading-tight whitespace-nowrap">{toFraction(hole.shortSlotWidth)} x {toFraction(hole.shortSlotLength)}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-gray-800">
                                <span className="text-gray-400 block mb-1 text-xs uppercase tracking-wide">Long Slot (LSL)</span>
                                <span className="text-xl text-white font-mono leading-tight whitespace-nowrap">{toFraction(hole.longSlotWidth)} x {toFraction(hole.longSlotLength)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edge Distances */}
                    <div className="bg-[#1a1a1a] p-2 rounded-xl border border-gray-800 shadow-lg flex-1">
                        <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1 flex justify-between items-center px-1">
                            <span>Table J3.4 - Minimum Edge Distances</span>
                            <span className="text-xs text-gray-500 font-normal">At Center of Hole</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="bg-black/30 p-2 rounded border border-gray-800">
                                <span className="text-gray-400 block mb-1 text-xs uppercase tracking-wide">At Sheared Edges</span>
                                <span className="text-2xl text-white font-mono">{toFraction(edge.atShearedEdge)}</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-gray-800">
                                <span className="text-gray-400 block mb-1 text-xs uppercase tracking-wide">At Rolled Edges</span>
                                <span className="text-2xl text-white font-mono">{toFraction(edge.atRolledEdge)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visualizer (Wrench Only) */}
                <div className="flex flex-col h-full">
                    <div className="bg-[#1a1a1a] p-2 rounded-xl border border-gray-800 shadow-lg w-full">
                        <div className="w-full">
                            <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-1 flex justify-between items-center px-1">
                                <span>Table 7-15 - Wrench Clearances</span>
                                <span className="text-xs text-gray-500 font-normal">Approximate</span>
                            </h4>
                            {/* Compact gap-1 for visualizers */}
                            <div className="flex flex-col xl:flex-row gap-1 justify-center items-center">
                                <ClearanceVisualizer clearance={clearance} type="entering" />
                                <ClearanceVisualizer clearance={clearance} type="tightening" />
                            </div>
                        </div>
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-center w-full">
                            <p className="text-yellow-200/70 text-xs">
                                C1/C2 values are estimates. Verify with wrench mfrg data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Tools Container */}
            <div className="flex flex-col gap-4">
                {/* Fillet Encroachment Panel */}
                <div className="w-full">
                    <FilletEncroachment />
                </div>

                {/* Gage Selector Panel */}
                <div className="w-full">
                    <GageSelector />
                </div>

                {/* Anchor Rod Hole Selector Panel */}
                <div className="w-full">
                    <AnchorRodHoleSelector />
                </div>

                {/* Bolt Rows Calculator */}
                <div className="w-full">
                    <BoltRowsSelector />
                </div>
            </div>
        </div>

    );
};

export default BoltSelector;
