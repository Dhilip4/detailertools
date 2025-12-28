import React, { useState, useEffect, useRef } from 'react';
import { parseCSV, fetchAndParseShape } from '../../utils/csvParser';
import { getBoltRows } from '../../utils/aiscData';

interface Shape {
    shape: string;
    d: number;
    bf: number;
    tf: number;
    tw: number;
    weight: number;
}

const BoltRowsSelector: React.FC = () => {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Load W shapes
    useEffect(() => {
        const loadShapes = async () => {
            try {
                const wShapes = await fetchAndParseShape('W_shapes.csv', 'W');
                const parsedShapes = wShapes.map(s => ({
                    shape: s.name,
                    d: Number(s.d),
                    bf: Number(s.bf) || 0,
                    tf: Number(s.tf) || 0,
                    tw: Number(s.tw) || 0,
                    weight: s.weight || 0
                })).filter(s => s.shape && !isNaN(s.d) && s.d > 0);

                // Sort: Smallest Depth -> Largest Depth. Tie-break: Lightest Weight -> Heaviest Weight
                parsedShapes.sort((a, b) => {
                    const getNominal = (name: string) => {
                        const m = name.match(/^W(\d+)/i);
                        return m ? parseInt(m[1]) : 0;
                    };
                    const nomA = getNominal(a.shape);
                    const nomB = getNominal(b.shape);

                    if (nomA !== nomB) return nomA - nomB;
                    return a.weight - b.weight;
                });

                setShapes(parsedShapes);
                const defaultShape = parsedShapes.find(s => s.shape === 'W14X90') || parsedShapes.find(s => s.shape === 'W14x90') || parsedShapes[0];
                if (defaultShape) setSelectedShape(defaultShape);
            } catch (e) {
                console.error("Error loading shapes", e);
            }
        };
        loadShapes();
    }, []);

    const filteredShapes = shapes.filter(s =>
        s.shape.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50);

    const handleSelect = (s: Shape) => {
        setSelectedShape(s);
        setSearchQuery('');
        setShowDropdown(false);
    };

    let nominalDepth = 0;
    let rowsData = null;
    let debugMsg = "";

    if (selectedShape) {
        const match = selectedShape.shape.match(/^W(\d+)/i);
        if (match) {
            nominalDepth = parseInt(match[1]);
            rowsData = getBoltRows(nominalDepth);
        } else {
            debugMsg = "No nominal depth match";
        }
    }

    // Visualization
    const renderVisualizer = () => {
        if (!selectedShape) return <div className="text-gray-500 text-xs">No shape selected</div>;
        if (!rowsData) return <div className="text-gray-500 text-xs">No rows data available</div>;

        const { d, tf } = selectedShape;
        const { max } = rowsData;

        // Scale Setup (Increased by ~25% from 12->15)
        const scale = 15;
        const svgHeight = d * scale + 50;
        const svgWidth = 300;
        const beamLength = 200;

        const startX = 60;
        const startY = 25;

        // Dimensions
        const flangeHeight = Math.max(tf * scale, 4);
        const centerY = startY + (d * scale) / 2;

        // Bolts
        const pitch = 3 * scale;
        const totalBoltHeight = (max - 1) * pitch;
        const firstBoltY = centerY - (totalBoltHeight / 2);

        const boltX = startX + (3 * scale);

        const bolts = [];
        for (let i = 0; i < max; i++) {
            bolts.push(
                <g key={i}>
                    <circle
                        cx={boltX}
                        cy={firstBoltY + (i * pitch)}
                        r={0.4 * scale}
                        fill="#000"
                        stroke="#fff"
                        strokeWidth="1.5"
                    />
                    <line x1={boltX - 5} y1={firstBoltY + (i * pitch)} x2={boltX + 5} y2={firstBoltY + (i * pitch)} stroke="#555" strokeWidth="1" />
                    <line x1={boltX} y1={firstBoltY + (i * pitch) - 5} x2={boltX} y2={firstBoltY + (i * pitch) + 5} stroke="#555" strokeWidth="1" />
                </g>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded border border-gray-700 mt-4 w-full">
                <h5 className="text-gray-400 text-xs uppercase mb-2">Beam Elevation View</h5>
                <svg width={svgWidth} height={svgHeight} className="border border-gray-800 bg-black rounded shadow-inner">

                    {/* Beam Body */}
                    <rect
                        x={startX}
                        y={startY}
                        width={beamLength}
                        height={d * scale}
                        fill="#1a1a1a"
                        stroke="none"
                    />

                    {/* Flange Lines */}
                    <line x1={startX} y1={startY} x2={startX + beamLength} y2={startY} stroke="#555" strokeWidth="1" />
                    <line x1={startX} y1={startY + d * scale} x2={startX + beamLength} y2={startY + d * scale} stroke="#555" strokeWidth="1" />
                    <line x1={startX} y1={startY + flangeHeight} x2={startX + beamLength} y2={startY + flangeHeight} stroke="#555" strokeWidth="1" />
                    <line x1={startX} y1={startY + d * scale - flangeHeight} x2={startX + beamLength} y2={startY + d * scale - flangeHeight} stroke="#555" strokeWidth="1" />

                    {/* End Cut Line */}
                    <line x1={startX} y1={startY} x2={startX} y2={startY + d * scale} stroke="#555" strokeWidth="1" />
                    <path d={`M ${startX + beamLength} ${startY} L ${startX + beamLength} ${startY + d * scale}`} stroke="#555" strokeDasharray="4 2" />

                    {/* Centerline */}
                    <line
                        x1={startX - 10} y1={centerY}
                        x2={startX + beamLength + 10} y2={centerY}
                        stroke="#333"
                        strokeDasharray="4 2"
                    />

                    {/* Bolts */}
                    {bolts}

                    {/* 1. Bolt Pitch Dimension (LEFT) */}
                    {max > 1 && (
                        <g>
                            <line
                                x1={startX - 20} y1={firstBoltY}
                                x2={startX - 20} y2={firstBoltY + totalBoltHeight}
                                stroke="#76b900"
                                strokeWidth="1"
                            />
                            <line x1={startX - 25} y1={firstBoltY} x2={startX - 15} y2={firstBoltY} stroke="#76b900" />
                            <line x1={startX - 25} y1={firstBoltY + totalBoltHeight} x2={startX - 15} y2={firstBoltY + totalBoltHeight} stroke="#76b900" />

                            <text
                                x={startX - 30}
                                y={centerY}
                                fill="#76b900"
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="end"
                                alignmentBaseline="middle"
                                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            >
                                {(max - 1) * 3}"
                            </text>
                        </g>
                    )}

                    {/* 2. Depth Dimension (RIGHT) */}
                    <g>
                        <line
                            x1={startX + beamLength + 20} y1={startY}
                            x2={startX + beamLength + 20} y2={startY + d * scale}
                            stroke="#555"
                            strokeWidth="1"
                        />
                        <line x1={startX + beamLength + 15} y1={startY} x2={startX + beamLength + 25} y2={startY} stroke="#555" />
                        <line x1={startX + beamLength + 15} y1={startY + d * scale} x2={startX + beamLength + 25} y2={startY + d * scale} stroke="#555" />

                        <text
                            x={startX + beamLength + 30}
                            y={startY + (d * scale) / 2}
                            fill="#777"
                            fontSize="12"
                            alignmentBaseline="middle"
                            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                        >
                            d = {d}"
                        </text>
                    </g>

                </svg>
                <div className="flex flex-col items-center mt-3 space-y-1">
                    <span className="text-xs text-gray-400">Section: <span className="text-white font-bold">{selectedShape.shape}</span></span>
                    <span className="text-xs text-gray-400">Depth <span className="text-white">d = {d}"</span></span>
                    <span className="text-xs text-[#76b900] font-bold">Max Rows: {max}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg mt-4 w-full">
            <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-1">
                Bolt Rows Calculator
            </h4>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Search & Results */}
                <div className="space-y-6">
                    <div className="relative">
                        <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Select W Shape</label>
                        <div
                            className="bg-black border border-gray-700 rounded px-3 py-2 text-white flex justify-between items-center cursor-pointer hover:border-[#76b900]"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <span>{selectedShape ? selectedShape.shape : 'Select Shape...'}</span>
                            <span className="text-gray-500">▼</span>
                        </div>
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 bg-black border border-gray-700 z-50 max-h-60 overflow-y-auto rounded-b shadow-xl">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-[#111] text-white px-3 py-2 border-b border-gray-700 outline-none focus:border-[#76b900]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                {filteredShapes.map((s, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm text-gray-300"
                                        onClick={() => handleSelect(s)}
                                    >
                                        {s.shape} - <span className='text-gray-500 text-xs'>d={s.d}"</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {rowsData ? (
                        <div className="bg-black/30 p-4 rounded border border-gray-700">
                            <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                                <span className="text-gray-400 text-sm">Nominal Depth</span>
                                <span className="text-white font-mono font-bold">{nominalDepth}"</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-sm">Minimum Rows</span>
                                <span className="text-[#76b900] font-mono font-bold text-lg">{rowsData.min}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Max Rows @ 3"</span>
                                <span className="text-[#76b900] font-mono font-bold text-lg">{rowsData.max}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-200 text-sm">
                            {debugMsg || "Shape not supported (Depth > 36\" or unknown)."}
                        </div>
                    )}
                </div>
                {/* Right: Visualizer */}
                <div className="flex items-start justify-center">
                    {renderVisualizer()}
                </div>
            </div>
        </div>
    );
};

export default BoltRowsSelector;
