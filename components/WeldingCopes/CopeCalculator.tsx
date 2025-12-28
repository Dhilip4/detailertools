import React, { useState, useMemo } from 'react';
import { AISCShape } from '../../types/aisc';
import { calculateCope } from '../../utils/weldingLogic';
import { toFraction } from '../../utils/format';

interface CopeCalculatorProps {
    shapes: AISCShape[];
}

const CopeCalculator: React.FC<CopeCalculatorProps> = ({ shapes }) => {
    const [fillerInput, setFillerInput] = useState("W12X14");
    const [girderInput, setGirderInput] = useState("W14X22");
    const [clearance, setClearance] = useState(0.5);

    // Filter only W shapes for beam-to-beam
    const wShapes = useMemo(() => shapes.filter(s => s.name.startsWith('W')), [shapes]);

    const filler = wShapes.find(s => s.name === fillerInput);
    const girder = wShapes.find(s => s.name === girderInput);

    const copeData = useMemo(() => {
        if (!filler || !girder) return null;
        return calculateCope(filler, girder, clearance);
    }, [filler, girder, clearance]);

    // Simple datalist for selection
    const shapeOptions = useMemo(() => wShapes.map(s => s.name), [wShapes]);

    // Visualization Scaling
    // We want to show the connection view.
    // Girder is looking at the Web (Cross section? No, Side view of Filler, Cross section of Girder).
    // Correct: Filler comes in from side. Girder is in cross-section (End View).
    // SVG Canvas 400x400.
    // Scale to fit girder height.

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-4 items-stretch">
            {/* Input Panel */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg flex flex-col gap-4">
                <h3 className="text-[#76b900] font-bold uppercase tracking-wider text-sm border-b border-gray-700 pb-2">
                    Beam Cope Calculator
                </h3>

                <div>
                    <label className="block text-gray-400 text-xs mb-1">Filler Beam (Supported)</label>
                    <select
                        value={fillerInput}
                        onChange={e => setFillerInput(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none"
                    >
                        {wShapes.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-400 text-xs mb-1">Girder Beam (Supporting)</label>
                    <select
                        value={girderInput}
                        onChange={e => setGirderInput(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none"
                    >
                        {wShapes.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-400 text-xs mb-1">Cope Clearance (in)</label>
                    <input
                        type="number"
                        step="0.125"
                        value={clearance}
                        onChange={(e) => setClearance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none"
                    />
                </div>

                {copeData && (
                    <div className="mt-4 bg-gray-900 p-4 rounded border border-gray-800">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-500 text-xs">Top Cope Depth (dc)</span>
                            <span className="text-xl font-bold text-white font-mono">{toFraction(copeData.dc)}</span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-500 text-xs">Cope Length (c)</span>
                            <span className="text-xl font-bold text-white font-mono">{toFraction(copeData.lc)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-gray-500 text-xs">Radius</span>
                            <span className="text-base text-white font-mono">{toFraction(copeData.radius)}</span>
                        </div>
                    </div>
                )}

                {copeData?.warnings.map((w, i) => (
                    <div key={i} className="bg-red-900/20 border border-red-900/50 p-2 rounded text-red-200 text-xs">
                        ⚠️ {w}
                    </div>
                ))}
            </div>

            {/* Visualizer Panel */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg flex items-center justify-center min-h-[400px]">
                {!filler || !girder ? (
                    <span className="text-gray-600">Select shapes to visualize cope</span>
                ) : (
                    <CopeVisualizer filler={filler} girder={girder} cope={copeData!} />
                )}
            </div>
        </div>
    );
};

const CopeVisualizer: React.FC<{ filler: AISCShape, girder: AISCShape, cope: { dc: number, lc: number, radius: number } }> = ({ filler, girder, cope }) => {
    // Scaling logic
    const padding = 2;
    const height = filler.d + padding * 2;
    // Split into two zones? Left: Connection. Right: Detail.
    // Or just overlay dimensions on the detail view clearly.
    // Let's draw the "Detail View" (Single Beam End) as it's best for dimensions c and dc.

    const viewBoxH = height + 4; // Extra for dims
    const viewBoxW = filler.d * 1.5; // Aspect ratio

    // Scale: Pixels per inch.
    const sc = 20;

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <svg viewBox={`0 0 ${viewBoxW * sc} ${viewBoxH * sc}`} className="w-full h-full bg-[#111] rounded shadow-inner">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="white" />
                    </marker>
                </defs>

                <g transform={`translate(${padding * sc}, ${padding * sc + 40})`}>
                    {/* Beam Profile (Side View) */}
                    <path d={`
                        M 0,0 
                        L ${cope.lc * sc}, 0 
                        L ${cope.lc * sc}, ${cope.dc * sc}
                        L ${(cope.lc + 10) * sc}, ${cope.dc * sc} 
                        L ${(cope.lc + 10) * sc}, ${filler.d * sc} 
                        L 0, ${filler.d * sc} 
                        Z
                    `} fill="none" stroke="white" strokeWidth="2" />

                    {/* Radius Arc */}
                    <path d={`
                        M ${cope.lc * sc}, ${cope.dc * sc - cope.radius * sc}
                        A ${cope.radius * sc} ${cope.radius * sc} 0 0 0 ${(cope.lc + cope.radius) * sc} ${cope.dc * sc}
                    `} stroke="#76b900" strokeWidth="2" fill="none" />

                    {/* Dimensions */}
                    {/* c (Length) */}
                    <line x1="0" y1="-20" x2={cope.lc * sc} y2="-20" stroke="#76b900" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                    <text x={(cope.lc * sc) / 2} y="-30" fill="#76b900" textAnchor="middle" fontSize="14">c = {toFraction(cope.lc)}</text>
                    <line x1="0" y1="0" x2="0" y2="-25" stroke="#444" strokeWidth="1" />
                    <line x1={cope.lc * sc} y1="0" x2={cope.lc * sc} y2="-25" stroke="#444" strokeWidth="1" />

                    {/* dc (Depth) */}
                    <line x1="-20" y1="0" x2="-20" y2={cope.dc * sc} stroke="#76b900" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                    <text x="-30" y={(cope.dc * sc) / 2} fill="#76b900" textAnchor="end" dominantBaseline="middle" fontSize="14">dc = {toFraction(cope.dc)}</text>
                    <line x1="0" y1="0" x2="-25" y2="0" stroke="#444" strokeWidth="1" />
                    <line x1={cope.lc * sc} y1={cope.dc * sc} x2="-25" y2={cope.dc * sc} stroke="#444" strokeWidth="1" />

                    {/* ho (Remaining Web) */}
                    {/* Optional, user image showed it. */}
                </g>

                <text x="20" y="30" fill="gray" fontSize="12" fontFamily="monospace">Detail: Beam Cope Profile</text>
            </svg>
        </div>
    );
};

export default CopeCalculator;
