import React from 'react';
import { BoltClearance } from '../../types/connection';
import { toFraction } from '../../utils/format';

interface ClearanceVisualizerProps {
    clearance: BoltClearance;
    type: 'entering' | 'tightening';
}

const ClearanceVisualizer: React.FC<ClearanceVisualizerProps> = ({ clearance, type }) => {
    // Scale factor adjusted to fit max clearance in 280px
    // Max C2 approx 3.25". 3.25 * 40 = 130px.
    // Center at 140. 140 + 130 = 270. Fits with 10px margin.
    const scale = 40;
    const cx = 140;
    const cy = 140;

    const boltRadius = (clearance.decimalDiameter / 2) * scale;
    const clearanceRadius = ((type === 'entering' ? clearance.C1 : clearance.C2)) * scale;

    // Hexagon Bolt Head Calculation
    const hexHeadRadius = boltRadius * 1.6;
    const hexPoints = Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60 - 30) * (Math.PI / 180); // -30 for flat top
        return `${cx + hexHeadRadius * Math.cos(angle)},${cy + hexHeadRadius * Math.sin(angle)}`;
    }).join(' ');

    return (
        <div className="flex flex-col items-center">
            <svg width="280" height="280" viewBox="0 0 280 280" className="border border-gray-700 bg-[#1a1a1a] rounded-lg shadow-inner">
                <defs>
                    <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#333" strokeWidth="1" />
                    </pattern>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#76b900" />
                    </marker>
                </defs>

                {/* Background Grid */}
                <path d="M140 0 V280 M0 140 H280" stroke="#333" strokeDasharray="4 4" />

                {/* Clearance Zone (The required empty space) */}
                <circle cx={cx} cy={cy} r={clearanceRadius} fill="rgba(118, 185, 0, 0.1)" stroke="#76b900" strokeWidth="2" strokeDasharray="5 5" />

                {/* Bolt Head (Hexagon) */}
                <polygon points={hexPoints} fill="#444" stroke="#fff" strokeWidth="1" />

                {/* Bolt Shaft (Inner Dotted Circle) */}
                <circle cx={cx} cy={cy} r={boltRadius} fill="none" stroke="#aaa" strokeWidth="1" strokeDasharray="2 2" />

                {/* Dimension Line radius */}
                <line x1={cx} y1={cy} x2={cx + clearanceRadius} y2={cy} stroke="#76b900" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x={cx + clearanceRadius / 2} y={cy - 10} fill="#76b900" textAnchor="middle" fontSize="14" fontWeight="bold">
                    {type === 'entering' ? 'C1' : 'C2'} = {toFraction(type === 'entering' ? clearance.C1 : clearance.C2)}
                </text>

                {/* Legend/Label */}
                <text x="10" y="270" fill="#888" fontSize="12">
                    {type === 'entering' ? 'Entering Clearance' : 'Tightening Clearance'}
                </text>
            </svg>
        </div>
    );
};

export default ClearanceVisualizer;
