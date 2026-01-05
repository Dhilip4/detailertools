import React, { useState, useEffect } from 'react';
import { AISCShape } from '../../types/aisc';
import { fetchAndParseShape } from '../../utils/csvParser';
import { Search } from 'lucide-react';
import { toFraction } from '../../utils/format';
import { getAngleGage, getBeamFlangeGage, getBeamWebGage } from '../../utils/aiscData';
import AngleGageVisualizer from './AngleGageVisualizer';

const GageSelector: React.FC = () => {
    const [shapeType, setShapeType] = useState<'W' | 'C' | 'L'>('L');
    const [shapes, setShapes] = useState<AISCShape[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedShape, setSelectedShape] = useState<AISCShape | null>(null);

    // Manual/Current Dimensions State (Used for Angles)
    // Default to a standard size
    const [leg1, setLeg1] = useState<number>(4);
    const [leg2, setLeg2] = useState<number>(4);
    const [thickness, setThickness] = useState<number>(0.5);

    // Load Shapes when type changes
    useEffect(() => {
        const loadShapes = async () => {
            setLoading(true);
            setSearchTerm('');
            setSelectedShape(null);

            const fileName = shapeType === 'W' ? 'W_shapes.csv' : shapeType === 'C' ? 'C_shapes.csv' : 'L_shapes.csv';
            const loaded = await fetchAndParseShape(fileName, shapeType);

            // Sort logic: Smallest to Largest
            const sorted = loaded.sort((a, b) => {
                // For Angles (L)
                if (shapeType === 'L') {
                    const getLeg1 = (s: AISCShape) => Math.max(s.b || 0, s.d || 0);
                    const getLeg2 = (s: AISCShape) => Math.min(s.b || 0, s.d || 0);

                    const l1a = getLeg1(a);
                    const l1b = getLeg1(b);
                    if (l1a !== l1b) return l1a - l1b; // Ascending Leg 1 (e.g. L2 < L3)

                    const l2a = getLeg2(a);
                    const l2b = getLeg2(b);
                    if (l2a !== l2b) return l2a - l2b; // Ascending Leg 2

                    return (a.t || 0) - (b.t || 0); // Ascending Thickness
                }

                // For W and C shapes
                const parseName = (n: string) => {
                    // Handle W14X90 or W14x90
                    const parts = n.toUpperCase().split('X');
                    // Depth part e.g. W14 -> 14
                    // Remove leading letters
                    const depthStr = parts[0].replace(/^[A-Z]+/, '');
                    const depth = parseFloat(depthStr) || 0;
                    const weight = parseFloat(parts[1]) || 0;
                    return { depth, weight };
                };

                const pA = parseName(a.name);
                const pB = parseName(b.name);

                if (pA.depth !== pB.depth) return pA.depth - pB.depth; // Smallest Depth first
                return pA.weight - pB.weight; // Lightest Weight first
            });

            setShapes(sorted);
            setLoading(false);
        };
        loadShapes();
    }, [shapeType]);

    // Filter shapes
    const filteredShapes = shapes.filter(s =>
        s.name.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const handleShapeSelect = (shape: AISCShape) => {
        setSearchTerm(shape.name);
        setSelectedShape(shape);
        setShowDropdown(false);

        // If Angle, auto-populate dimensions
        if (shapeType === 'L') {
            setLeg1(shape.b || 0);
            setLeg2(shape.d || 0);
            setThickness(shape.t || 0);
        }
    };

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg mt-4 w-full">
            <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-1 flex justify-between items-center px-1">
                <span>Beam, Channel & Angle Gage Selector</span>
                <span className="text-xs text-gray-500 font-normal">AISC Manual</span>
            </h4>

            {/* Adjusted grid: L gets 300px sidebar, others get 1fr 1fr */}
            <div className={`grid grid-cols-1 ${shapeType === 'L' ? 'md:grid-cols-[300px_1fr]' : 'md:grid-cols-[1fr_1fr]'} gap-6`}>

                {/* Left Column: Controls */}
                <div className="flex flex-col gap-4">

                    {/* Shape Type Toggle */}
                    <div className="flex gap-2">
                        {(['W', 'C', 'L'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setShapeType(type)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded border ${shapeType === type ? 'bg-[#76b900] text-black border-[#76b900]' : 'bg-black text-gray-400 border-gray-700 hover:text-white'}`}
                            >
                                {type === 'W' ? 'W Shapes' : type === 'C' ? 'Channels' : 'Angles'}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative z-20">
                        <label className="block text-[#76b900] text-xs font-bold mb-1">Select Shape</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`Search ${shapeType} Shape...`}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm focus:border-[#76b900] outline-none pl-8"
                            />
                            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                        </div>

                        {showDropdown && searchTerm && (
                            <div className="absolute top-full left-0 w-full mt-1 max-h-60 overflow-y-auto bg-[#111] border border-gray-700 rounded shadow-xl z-30 custom-scrollbar">
                                {loading ? (
                                    <div className="p-2 text-gray-500 text-xs text-center">Loading...</div>
                                ) : filteredShapes.length > 0 ? (
                                    filteredShapes.map(s => (
                                        <button
                                            key={s.name}
                                            onClick={() => handleShapeSelect(s)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#76b900]/20 hover:text-white border-b border-gray-800 last:border-0"
                                        >
                                            <span className="font-bold">{s.name}</span>
                                            {shapeType === 'W' && <span className="text-xs text-gray-500 ml-2">bf={toFraction(s.bf)}</span>}
                                            {shapeType === 'L' && <span className="text-xs text-gray-500 ml-2">({Math.max(s.b || 0, s.d || 0)}x{Math.min(s.b || 0, s.d || 0)}x{s.t})</span>}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500 text-xs text-center">No matches</div>
                                )}
                            </div>
                        )}
                        {showDropdown && searchTerm && (
                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                        )}
                    </div>

                    {/* Angle Explicit Inputs (Always visible for L) */}
                    {shapeType === 'L' && (
                        <div className="bg-black/20 p-3 rounded border border-gray-800/50">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 block">Custom Dimensions</span>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-gray-400 text-[10px] mb-1">Leg 1</label>
                                    <input
                                        type="number"
                                        value={leg1}
                                        onChange={(e) => setLeg1(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-gray-700 rounded p-1 text-white text-sm focus:border-[#76b900] outline-none"
                                    />
                                    <div className="text-right text-[10px] text-gray-500 mt-1 h-3">{toFraction(leg1)}</div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-[10px] mb-1">Leg 2</label>
                                    <input
                                        type="number"
                                        value={leg2}
                                        onChange={(e) => setLeg2(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-gray-700 rounded p-1 text-white text-sm focus:border-[#76b900] outline-none"
                                    />
                                    <div className="text-right text-[10px] text-gray-500 mt-1 h-3">{toFraction(leg2)}</div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-[10px] mb-1">Thick</label>
                                    <input
                                        type="number"
                                        value={thickness}
                                        onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-gray-700 rounded p-1 text-white text-sm focus:border-[#76b900] outline-none"
                                    />
                                    <div className="text-right text-[10px] text-gray-500 mt-1 h-3">{toFraction(thickness)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Results */}
                <div className="bg-black/30 rounded border border-gray-800 p-4 flex flex-col justify-center min-h-[200px]">
                    {!selectedShape && shapeType !== 'L' ? (
                        <div className="text-center text-gray-500 text-sm italic">
                            Select a shape to view standard gages.
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {shapeType === 'W' && selectedShape && (() => {
                                // Calculated Beam Logic
                                const nominalDepth = parseFloat(selectedShape.name.substring(1).split('X')[0]); // W14x... -> 14
                                const bf = selectedShape.bf || 0;

                                const flangeGage = getBeamFlangeGage(bf);
                                const webGage = getBeamWebGage(nominalDepth);

                                return (
                                    <>
                                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-xs uppercase tracking-wider">Flange Gage</span>
                                                {/* Show 'bf' for verification as requested */}
                                                <span className="text-[10px] text-gray-500">
                                                    Based on bf: <span className="text-gray-300 font-bold">{toFraction(bf)}</span> ({bf}")
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-3xl text-white font-mono font-bold text-[#76b900]">
                                                    {flangeGage ? `${toFraction(flangeGage)}` : '-'}
                                                </span>
                                                {flangeGage && <span className="text-xs text-gray-500">{flangeGage}"</span>}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-xs uppercase tracking-wider">Web Gage</span>
                                                <span className="text-[10px] text-gray-600">Calculated (Standard)</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-3xl text-white font-mono font-bold">
                                                    {webGage ? `${toFraction(webGage.gage)}` : '-'}
                                                </span>
                                                {webGage && <span className="text-xs text-gray-500">{webGage.gage}"</span>}
                                            </div>
                                        </div>
                                        {webGage?.note && (
                                            <div className="mt-2 text-xs text-yellow-500 italic border-t border-gray-800 pt-1">
                                                {webGage.note}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {shapeType === 'C' && selectedShape && (
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs uppercase tracking-wider">Usual Gage</span>
                                        <span className="text-[10px] text-gray-600">Database (WGi)</span>
                                    </div>
                                    <span className="text-3xl text-white font-mono font-bold text-[#76b900]">
                                        {selectedShape.WGi ? `${toFraction(selectedShape.WGi)}` : '-'}
                                    </span>
                                </div>
                            )}

                            {shapeType === 'L' && (() => {
                                // Logic for Angles using manual state (which is auto-filled by search)
                                const dim1 = leg1;
                                const dim2 = leg2;

                                const leg1Val = Math.max(dim1, dim2);
                                const leg2Val = Math.min(dim1, dim2);

                                const gage1 = getAngleGage(leg1Val);
                                const gage2 = getAngleGage(leg2Val);

                                return (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 items-start">
                                            {/* Column 1: Info (Takes more space) */}
                                            <div className="space-y-6 min-w-0">
                                                {/* Leg 1 Info */}
                                                <div className="flex justify-between items-start border-b border-gray-800 pb-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-400 text-xs uppercase tracking-wider">Leg 1 ({leg1Val}")</span>
                                                        <span className="text-[10px] text-gray-600">Stand. Gage</span>
                                                    </div>
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-xl text-white font-mono font-bold text-[#76b900]">
                                                            {gage1 ? `${toFraction(gage1.g)}` : '-'}
                                                        </span>
                                                        {gage1 && (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs text-gray-500 font-mono mb-1">{gage1.g}"</span>
                                                                {(gage1.g1 || gage1.g2) && (
                                                                    <div className="flex flex-col gap-y-1 text-[10px] text-right font-mono text-gray-400 bg-gray-900/50 p-1 px-2 rounded border border-gray-800 mt-1 whitespace-nowrap">
                                                                        {gage1.g1 && <span>g1: <span className="text-white">{toFraction(gage1.g1)}</span></span>}
                                                                        {gage1.g2 && <span>g2: <span className="text-white">{toFraction(gage1.g2)}</span></span>}
                                                                        {gage1.g3 && <span>g3: <span className="text-white">{toFraction(gage1.g3)}</span></span>}
                                                                        {gage1.g4 && <span>g4: <span className="text-white">{toFraction(gage1.g4)}</span></span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Leg 2 Info */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-400 text-xs uppercase tracking-wider">Leg 2 ({leg2Val}")</span>
                                                        <span className="text-[10px] text-gray-600">Stand. Gage</span>
                                                    </div>
                                                    <div className="flex flex-col items-end flex-shrink-0">
                                                        <span className="text-xl text-white font-mono font-bold text-[#76b900]">
                                                            {gage2 ? `${toFraction(gage2.g)}` : '-'}
                                                        </span>
                                                        {gage2 && (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs text-gray-500 font-mono mb-1">{gage2.g}"</span>
                                                                {(gage2.g1 || gage2.g2) && (
                                                                    <div className="flex flex-col gap-y-1 text-[10px] text-right font-mono text-gray-400 bg-gray-900/50 p-1 px-2 rounded border border-gray-800 mt-1 whitespace-nowrap">
                                                                        {gage2.g1 && <span>g1: <span className="text-white">{toFraction(gage2.g1)}</span></span>}
                                                                        {gage2.g2 && <span>g2: <span className="text-white">{toFraction(gage2.g2)}</span></span>}
                                                                        {gage2.g3 && <span>g3: <span className="text-white">{toFraction(gage2.g3)}</span></span>}
                                                                        {gage2.g4 && <span>g4: <span className="text-white">{toFraction(gage2.g4)}</span></span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Visualizer (Right Side) */}
                                            <div className="flex justify-center items-center bg-black/20 rounded-lg border border-gray-800/50 p-1">
                                                <AngleGageVisualizer
                                                    leg1={leg1Val}
                                                    leg2={leg2Val}
                                                    thickness={thickness}
                                                    gage1={gage1}
                                                    gage2={gage2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GageSelector;
