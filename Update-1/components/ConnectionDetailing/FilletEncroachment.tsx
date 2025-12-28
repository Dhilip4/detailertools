import React, { useState, useEffect } from 'react';
import { toFraction } from '../../utils/format';
import { fetchAndParseShape } from '../../utils/csvParser';
import { AISCShape } from '../../types/aisc';
import { Search } from 'lucide-react';

const FilletEncroachment: React.FC = () => {
    // Beam Selection State
    const [shapes, setShapes] = useState<AISCShape[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Parameters
    const [kdet, setKdet] = useState<number>(1.5);
    const [tf, setTf] = useState<number>(0.5);
    // Add tw for accurate visualization
    const [tw, setTw] = useState<number>(0.3); // Default roughly W14x...

    const [encroachment, setEncroachment] = useState<string>("-");
    const [encroachmentValue, setEncroachmentValue] = useState<number>(0);

    // Load W Shapes on mount
    useEffect(() => {
        const loadShapes = async () => {
            setLoading(true);
            const loaded = await fetchAndParseShape('W_shapes.csv', 'W');
            // Sort by name
            const sorted = loaded.sort((a, b) => {
                // Simple numeric extraction sort
                const getWeight = (n: string) => parseFloat(n.split('X')[1] || '0');
                const getDepth = (n: string) => parseFloat(n.split('W')[1]?.split('X')[0] || '0');

                const dA = getDepth(a.name);
                const dB = getDepth(b.name);
                if (dA !== dB) return dA - dB; // Ascending depth (W8, W10, ...)

                return getWeight(a.name) - getWeight(b.name); // Ascending weight
            });
            setShapes(sorted);
            setLoading(false);
        };
        loadShapes();
    }, []);

    // Filter shapes
    const filteredShapes = shapes.filter(s =>
        s.name.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const handleShapeSelect = (shape: AISCShape) => {
        setSearchTerm(shape.name);
        setShowDropdown(false);

        // Auto-fill k_det and tf
        // Priority: k_det -> k1 -> k_des -> k
        const k = shape.kdet || shape.kdes || shape.k || 0;
        const t = shape.tf || 0;
        const w = shape.tw || 0;

        if (k) setKdet(k);
        if (t) setTf(t);
        if (w) setTw(w);
    };

    useEffect(() => {
        calculateEncroachment();
    }, [kdet, tf]);

    const calculateEncroachment = () => {
        // Round to nearest 1/32" to handle database precision issues (e.g. 0.365 vs 0.375)
        // This ensures values close to 1/8 increments snap to them for the logic check.
        // W14x30: k=0.75, tf=0.385, diff=0.365. Nearest 1/32 is 12/32 = 0.375.
        const rawDiff = kdet - tf;
        const diff = Math.round(rawDiff * 32) / 32;
        const epsilon = 0.001;

        let result = "-";
        let val = 0;

        // Logic: Descending thresholds to handle gaps conservatively.
        // Valid range ends at 1 3/8" (1.375)

        if (diff > 1.375 + epsilon) {
            result = "See AISC"; val = 0;
        }
        // 1 5/16 (1.3125) <= diff <= 1 3/8 (1.375) -> 3/8
        else if (diff >= 1.3125 - epsilon) {
            result = "3/8"; val = 0.375;
        }
        // 7/8 (0.875) <= diff < 1 5/16 -> 5/16
        else if (diff >= 0.875 - epsilon) {
            result = "5/16"; val = 0.3125;
        }
        // 9/16 (0.5625) <= diff < 7/8 -> 1/4
        else if (diff >= 0.5625 - epsilon) {
            result = "1/4"; val = 0.25;
        }
        // 3/8 (0.375) <= diff < 9/16 -> 3/16
        else if (diff >= 0.375 - epsilon) {
            result = "3/16"; val = 0.1875;
        }
        // 0 <= diff < 3/8 -> 1/8
        else if (diff >= 0) {
            result = "1/8"; val = 0.125;
        }
        else {
            result = "See AISC"; val = 0;
        }

        setEncroachment(result);
        setEncroachmentValue(val);
    };

    // Visualization Parameters
    const scale = 60; // Reduced Scale for better fit
    const svgWidth = 500;
    const svgHeight = 400;

    // Geometry - Symmetric T
    const cx = svgWidth / 2;
    const topY = 40;

    // Flange
    const flangeWidth = 300;
    const flangeHeight = tf * scale;
    const flangeBottomY = topY + flangeHeight;

    // Web
    const webThickness = tw * scale; // Use real database Tw
    const webHeight = 250;
    const webLeftX = cx - webThickness / 2;
    const webRightX = cx + webThickness / 2;

    // Fillets
    const radius = Math.max(0, (kdet - tf) * scale);
    const kLineY = topY + (kdet * scale);

    // Encroachment Plate (Left Side)
    // Plate top is at (kLineY - encroachmentValue*scale)
    const plateTopY = kLineY - (encroachmentValue * scale);
    const plateWidth = 60;

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg mt-4 w-full">
            <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-1 flex justify-between items-center px-1">
                <span>Fillet Encroachment Visualizer</span>
                <span className="text-xs text-gray-500 font-normal">AISC Fig 10-3</span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                {/* Inputs Panel */}
                <div className="flex flex-col gap-4">

                    {/* Beam Selection */}
                    <div className="relative z-20">
                        <label className="block text-[#76b900] text-sm font-bold mb-2">Select Beam (Optional)</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search W Shape (e.g. W14x90)..."
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
                                            <span className="text-xs text-gray-500 ml-2">k={s.kdet || s.kdes}" tf={s.tf}"</span>
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

                    <div className="bg-black/30 p-3 rounded border border-gray-800">
                        <label className="block text-gray-400 text-xs mb-3 uppercase tracking-wider font-bold">Manual Overrides</label>
                        <div className="space-y-3">
                            <div className="grid grid-cols-[1fr_80px] gap-2 items-center">
                                <label className="text-gray-400 text-xs">k_det (in)</label>
                                <div className="text-right">
                                    <input
                                        type="number"
                                        step="0.0625"
                                        value={kdet}
                                        onChange={(e) => { setKdet(parseFloat(e.target.value) || 0); setSearchTerm(''); }}
                                        className="w-full bg-black border border-gray-700 rounded p-1 text-white font-mono text-right text-sm focus:border-[#76b900] outline-none"
                                    />
                                    <div className="text-[#76b900] font-mono text-[10px] mt-1">{toFraction(kdet)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[1fr_80px] gap-2 items-center">
                                <label className="text-gray-400 text-xs">t_f (in)</label>
                                <div className="text-right">
                                    <input
                                        type="number"
                                        step="0.0625"
                                        value={tf}
                                        onChange={(e) => { setTf(parseFloat(e.target.value) || 0); setSearchTerm(''); }}
                                        className="w-full bg-black border border-gray-700 rounded p-1 text-white font-mono text-right text-sm focus:border-[#76b900] outline-none"
                                    />
                                    <div className="text-[#76b900] font-mono text-[10px] mt-1">{toFraction(tf)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[1fr_80px] gap-2 items-center">
                                <label className="text-gray-400 text-xs">t_w (Web, in)</label>
                                <div className="text-right">
                                    <input
                                        type="number"
                                        step="0.0625"
                                        value={tw}
                                        onChange={(e) => { setTw(parseFloat(e.target.value) || 0); setSearchTerm(''); }}
                                        className="w-full bg-black border border-gray-700 rounded p-1 text-white font-mono text-right text-sm focus:border-[#76b900] outline-none"
                                    />
                                    <div className="text-[#76b900] font-mono text-[10px] mt-1">{toFraction(tw)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#76b900]/10 p-4 rounded border border-[#76b900]/30 text-center mt-auto">
                        {/* Calculation Breakdown */}
                        <div className="mb-2 pb-2 border-b border-[#76b900]/20">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Calculation (k_det - tf)</span>
                            <span className="text-white font-mono text-sm">
                                {toFraction(kdet)} - {toFraction(tf)} = <span className="text-[#76b900]">{toFraction(Math.max(0, kdet - tf))}</span>
                            </span>
                        </div>

                        <span className="text-[#76b900] text-xs uppercase tracking-wide block mb-1">Max Encroachment</span>
                        <span className="text-5xl text-white font-mono font-bold">{encroachment}</span>
                        {encroachment !== "See AISC" && <span className="text-gray-400 text-xs mt-2 block">inch</span>}
                    </div>
                </div>

                {/* SVG Visualization */}
                <div className="bg-black rounded-xl border border-gray-800 overflow-hidden relative flex items-center justify-center min-h-[400px]">
                    <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
                        <defs>
                            <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="4" height="8" transform="translate(0,0)" fill="#222" />
                            </pattern>
                            <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L6,3 z" fill="#76b900" />
                            </marker>
                            <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
                                <path d="M6,0 L6,6 L0,3 z" fill="#76b900" />
                            </marker>
                        </defs>

                        {/* Background Grid Lines (Subtle) */}
                        <path d={`M 0 ${topY} L ${svgWidth} ${topY}`} stroke="#333" strokeDasharray="2,2" />
                        <path d={`M ${cx} 0 L ${cx} ${svgHeight}`} stroke="#333" strokeDasharray="2,2" opacity="0.3" />

                        {/* 1. Flange (Top) */}
                        <rect x={cx - flangeWidth / 2} y={topY} width={flangeWidth} height={flangeHeight} fill="url(#hatch)" stroke="#555" />

                        {/* 2. Web (Center) */}
                        {/* We draw simple rect for web below fillet start */}
                        <rect x={webLeftX} y={flangeBottomY + radius} width={webThickness} height={webHeight - (flangeBottomY + radius - topY)} fill="url(#hatch)" stroke="#555" />

                        {/* 3. Fillets (Left and Right - CONCAVE) */}
                        {/* Left Fillet */}
                        <path
                            d={`M ${webLeftX} ${flangeBottomY + radius} A ${radius} ${radius} 0 0 0 ${webLeftX - radius} ${flangeBottomY} L ${webLeftX} ${flangeBottomY} Z`}
                            fill="#333"
                        />
                        <path
                            d={`M ${webLeftX} ${flangeBottomY + radius} A ${radius} ${radius} 0 0 0 ${webLeftX - radius} ${flangeBottomY}`}
                            fill="none" stroke="#555" strokeWidth="1.5"
                        />

                        {/* Right Fillet - Concave */}
                        <path
                            d={`M ${webRightX} ${flangeBottomY + radius} A ${radius} ${radius} 0 0 1 ${webRightX + radius} ${flangeBottomY} L ${webRightX} ${flangeBottomY} Z`}
                            fill="#333"
                        />
                        <path
                            d={`M ${webRightX} ${flangeBottomY + radius} A ${radius} ${radius} 0 0 1 ${webRightX + radius} ${flangeBottomY}`}
                            fill="none" stroke="#555" strokeWidth="1.5"
                        />

                        {/* 4. Encroaching Plate (Left Side) - Flush with web face */}
                        <rect
                            x={webLeftX - plateWidth}
                            y={plateTopY}
                            width={plateWidth}
                            height={svgHeight - plateTopY - 20}
                            fill="#333"
                            stroke="#76b900"
                            strokeWidth="2"
                        />

                        {/* DIMENSIONS - Clearer Separation */}

                        {/* k_det Dimension (RIGHT SIDE) */}
                        <g transform={`translate(${cx + flangeWidth / 2 + 20}, 0)`}>
                            <line x1="-10" y1={topY} x2="10" y2={topY} stroke="#555" />
                            <line x1="-10" y1={kLineY} x2="60" y2={kLineY} stroke="#555" /> {/* Extend line out */}
                            <line x1="0" y1={topY} x2="0" y2={kLineY} stroke="#76b900" markerEnd="url(#arrow)" markerStart="url(#arrow-start)" />
                            <text x="10" y={(topY + kLineY) / 2} fill="#76b900" fontSize="14" fontWeight="bold" alignmentBaseline="middle">k_det = {toFraction(kdet)}</text>
                        </g>

                        {/* t_f Dimension (LEFT SIDE - Far Left) */}
                        <g transform={`translate(${cx - flangeWidth / 2 - 20}, 0)`}>
                            <line x1="-10" y1={topY} x2="10" y2={topY} stroke="#555" />
                            <line x1="-10" y1={flangeBottomY} x2="10" y2={flangeBottomY} stroke="#555" />
                            <line x1="0" y1={topY} x2="0" y2={flangeBottomY} stroke="#aaa" markerEnd="url(#arrow)" markerStart="url(#arrow-start)" />
                            <text x="-10" y={(topY + flangeBottomY) / 2} fill="#aaa" fontSize="12" textAnchor="end" alignmentBaseline="middle">tf = {toFraction(tf)}</text>
                        </g>

                        {/* k-line label (Right side extension) */}
                        <line x1={webRightX + radius} y1={kLineY} x2={cx + flangeWidth / 2 + 60} y2={kLineY} stroke="#555" strokeDasharray="4 4" />
                        <text x={cx + 60} y={kLineY - 5} fill="#555" fontSize="10">k-line</text>

                        {/* Encroachment Dimension (Zoomed View at Plate) */}
                        <g transform={`translate(${webLeftX - plateWidth}, 0)`}>
                            {encroachmentValue > 0 && (
                                <>
                                    {/* Vertical Dimension Line */}
                                    <line x1="-15" y1={plateTopY} x2="-15" y2={kLineY} stroke="#FF4444" strokeWidth="1.5" />

                                    {/* Top Tick (at Plate Top) */}
                                    <line x1="-25" y1={plateTopY} x2="0" y2={plateTopY} stroke="#FF4444" strokeWidth="1.5" />

                                    {/* Bottom Tick (at k-line) */}
                                    <line x1="-25" y1={kLineY} x2="-5" y2={kLineY} stroke="#FF4444" strokeWidth="1.5" strokeDasharray="2 2" />

                                    {/* Label - Rotated or Side - White Text */}
                                    <text
                                        x="-30"
                                        y={(plateTopY + kLineY) / 2}
                                        fill="#FFFFFF"
                                        fontSize="14"
                                        fontWeight="bold"
                                        alignmentBaseline="middle"
                                        textAnchor="end"
                                        transform={`rotate(-90, -30, ${(plateTopY + kLineY) / 2})`}
                                    >
                                        Encr = {encroachment}
                                    </text>
                                </>
                            )}
                        </g>

                    </svg>

                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <div className="px-2 py-1 rounded bg-black/80 border border-gray-800 text-[10px] text-gray-400">
                            Scale: {scale / 20}:1 (Approx)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilletEncroachment;
