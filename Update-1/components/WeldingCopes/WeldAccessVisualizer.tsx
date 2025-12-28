import React, { useState } from 'react';

const WeldAccessVisualizer: React.FC = () => {
    const [dist, setDist] = useState(1.25);
    const [height, setHeight] = useState(0.5); // Example bolt head height

    // Rule: "If a bolt head... is within 1 inch of the weld line"
    const minClearance = 1.0;
    // Interference if dist < 1.0 OR if obstruction height blocks 45-degree access (height > dist)
    const isInterference = dist < minClearance || height > dist;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-stretch">
            {/* Inputs */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg flex flex-col gap-4">
                <h3 className="text-[#76b900] font-bold uppercase tracking-wider text-sm border-b border-gray-700 pb-2">
                    Weld Access Check
                </h3>

                <p className="text-gray-400 text-xs">
                    Ensure welder has unobstructed 45° access to the joint.
                    Obstructing elements (bolts, flanges) within 1" often cause defects.
                </p>

                <div>
                    <label className="block text-gray-400 text-xs mb-1">Obstruction Distance (d)</label>
                    <input
                        type="number"
                        step="0.125"
                        value={dist}
                        onChange={(e) => setDist(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none"
                    />
                    <div className="text-right text-xs mt-1 text-gray-500">Min Recom: 1.0"</div>
                </div>

                <div>
                    <label className="block text-gray-400 text-xs mb-1">Obstruction Height (h)</label>
                    <input
                        type="number"
                        step="0.125"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-[#76b900] outline-none"
                    />
                </div>

                <div className={`mt-4 p-3 rounded border text-center font-bold ${isInterference ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-green-900/20 border-green-500 text-green-400'}`}>
                    {isInterference ? "INTERFERENCE DETECTED" : "ACCESS CLEAR"}
                </div>
            </div>

            {/* Visualizer */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 shadow-lg flex items-center justify-center min-h-[300px]">
                <svg width="400" height="300" viewBox="-50 -50 400 300" className="w-full h-full">
                    {/* Background Grid */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect x="-50" y="-50" width="400" height="300" fill="url(#grid)" />

                    {/* Coordinate System: Origin (0,0) is the corner/root. Y is Down (SVG default), so flip? No, let's just draw logical.
                        Corner at (50, 250). Positive X right, Negative Y up.
                    */}
                    <g transform="translate(50, 250) scale(1, -1)">
                        {/* Scale Factor: 50px = 1 inch */}
                        {/* Plate 1 (Horizontal) */}
                        <rect x="-50" y="-20" width="350" height="20" fill="#444" stroke="#666" />
                        {/* Plate 2 (Vertical) */}
                        <rect x="-20" y="0" width="20" height="200" fill="#444" stroke="#666" />

                        {/* Weld (Fillet) */}
                        <path d="M 0,0 L 15,0 L 0,15 Z" fill="#76b900" /> {/* Approx 0.3" weld */}

                        {/* Obstruction */}
                        <rect
                            x={dist * 50}
                            y={0}
                            width="30"
                            height={height * 50}
                            fill={isInterference ? "#ef4444" : "#555"}
                            stroke="white"
                            strokeWidth="1"
                        />
                        <text transform="scale(1, -1)" x={dist * 50} y="20" fill="white" fontSize="12">Obstruction</text>

                        {/* 45 Degree Approach Path */}
                        {/* Line from Weld Face center at 45 deg */}
                        <line x1="10" y1="10" x2="150" y2="150" stroke="#76b900" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />

                        {/* Clearance Zone */}
                        <rect x="0" y="0" width="50" height="10" fill="#ef4444" opacity="0.2" /> {/* 1 inch zone */}
                    </g>

                    {/* Annotation */}
                    <g transform="translate(50, 250)">
                        <text x="0" y="30" fill="gray" fontSize="12">Root (0,0)</text>
                        <line x1="0" y1="10" x2={dist * 50} y2="10" stroke="white" strokeWidth="1" />
                        <text x={dist * 25} y="25" fill="white" fontSize="12">{dist}"</text>
                    </g>
                </svg>
            </div>
        </div>
    );
};
export default WeldAccessVisualizer;
