import React from 'react';
import { AngleGage } from '../../utils/aiscData';
import { toFraction } from '../../utils/format';

interface AngleGageVisualizerProps {
    leg1: number; // Vertical Leg
    leg2: number; // Horizontal Leg
    thickness: number;
    gage1?: AngleGage; // Gage for Leg 1
    gage2?: AngleGage; // Gage for Leg 2
}

const AngleGageVisualizer: React.FC<AngleGageVisualizerProps> = ({ leg1, leg2, thickness, gage1, gage2 }) => {
    // Scaling
    const maxDim = Math.max(leg1, leg2);
    const scale = 200 / (maxDim * 1.2);
    const padding = 60;

    const L1 = leg1 * scale;
    const L2 = leg2 * scale;
    const T = thickness * scale;

    // Hole Size Logic: User requested "fill the thickness"
    const holeSize = T;

    // Draw L shape (Corner at top-left 0,0 relative to shape group)
    const path = `M 0 0 L ${L2} 0 L ${L2} ${T} L ${T} ${T} L ${T} ${L1} L 0 ${L1} Z`;

    // Helper to get distances
    const getGageDistances = (info: AngleGage): number[] => {
        if (info.g1) {
            const dists = [info.g1];
            if (info.g2) dists.push(dists[dists.length - 1] + info.g2);
            if (info.g3) dists.push(dists[dists.length - 1] + info.g3);
            if (info.g4) dists.push(dists[dists.length - 1] + info.g4);
            return dists;
        }
        return [info.g];
    };

    const renderGageLines = (gageInfo: AngleGage | undefined, isVerticalLeg: boolean) => {
        if (!gageInfo) return null;

        const distances = getGageDistances(gageInfo);
        const holeColor = "#ccff00"; // Yellowish
        const dimColor = "#76b900"; // Green

        return distances.map((dist, idx) => {
            const key = `${isVerticalLeg ? 'v' : 'h'}-${idx}`;
            const gPos = dist * scale;

            // Label: "4 1/2" (4.5")"
            const label = `${toFraction(dist)}`;
            const subLabel = `(${dist}")`;

            if (isVerticalLeg) {
                // Vertical Leg (Leg 1)
                // Distance 'g' is from Top (Y=0) down along Y axis.
                // Hole Center at y = gPos, x = T/2.
                const holeX = T / 2;
                const holeY = gPos;

                return (
                    <React.Fragment key={key}>
                        {/* Horizontal dashed line at Y=holeY extending right */}
                        <line
                            x1={0} y1={holeY} x2={L2 + 20} y2={holeY}
                            stroke={dimColor} strokeWidth="1" strokeDasharray="3" opacity="0.5"
                        />

                        {/* Hole Marker */}
                        <rect
                            x={holeX - holeSize / 2}
                            y={holeY - holeSize / 2}
                            width={holeSize} height={holeSize}
                            fill={holeColor}
                            stroke="none"
                        />

                        {/* Label at the end of the line */}
                        <text x={L2 + 25} y={holeY - 5} fill={dimColor} fontSize="10" dominantBaseline="middle">
                            {label}
                        </text>
                        <text x={L2 + 25} y={holeY + 7} fill="gray" fontSize="8" dominantBaseline="middle">
                            {subLabel}
                        </text>
                    </React.Fragment>
                );

            } else {
                // Horizontal Leg (Leg 2)
                // Distance 'g' is from Left (X=0) right along X axis.
                // Hole Center at x = gPos, y = T/2.
                const holeX = gPos;
                const holeY = T / 2;

                return (
                    <React.Fragment key={key}>
                        {/* Vertical dashed line at X=holeX extending down */}
                        <line
                            x1={holeX} y1={0} x2={holeX} y2={L1 + 20}
                            stroke={dimColor} strokeWidth="1" strokeDasharray="3" opacity="0.5"
                        />

                        {/* Hole Marker */}
                        <rect
                            x={holeX - holeSize / 2}
                            y={holeY - holeSize / 2}
                            width={holeSize} height={holeSize}
                            fill={holeColor}
                            stroke="none"
                        />

                        {/* Label */}
                        <text x={holeX} y={L1 + 30} fill={dimColor} fontSize="10" textAnchor="middle">
                            {label}
                        </text>
                        <text x={holeX} y={L1 + 42} fill="gray" fontSize="8" textAnchor="middle">
                            {subLabel}
                        </text>
                    </React.Fragment>
                );
            }
        });
    };

    return (
        <div className="flex justify-center items-center p-2 w-full">
            <svg viewBox={`-${padding} -${padding} ${350} ${350}`} width="100%" height="auto" style={{ maxWidth: '400px' }}>
                <g transform={`translate(${padding}, ${padding})`}>
                    {/* Shape */}
                    <path d={path} fill="#333" stroke="#666" strokeWidth="1" />

                    {/* Leg 1 Length Label (Left side) */}
                    <line x1={-15} y1={0} x2={-15} y2={L1} stroke="gray" strokeWidth="1" />
                    <line x1={-10} y1={0} x2={-20} y2={0} stroke="gray" strokeWidth="1" />
                    <line x1={-10} y1={L1} x2={-20} y2={L1} stroke="gray" strokeWidth="1" />
                    <text x={-25} y={L1 / 2} fill="gray" fontSize="12" textAnchor="end" dominantBaseline="middle" transform={`rotate(-90, -25, ${L1 / 2})`}>
                        {leg1}"
                    </text>

                    {/* Leg 2 Length Label (Top side) */}
                    <line x1={0} y1={-15} x2={L2} y2={-15} stroke="gray" strokeWidth="1" />
                    <line x1={0} y1={-10} x2={0} y2={-20} stroke="gray" strokeWidth="1" />
                    <line x1={L2} y1={-10} x2={L2} y2={-20} stroke="gray" strokeWidth="1" />
                    <text x={L2 / 2} y={-25} fill="gray" fontSize="12" textAnchor="middle">
                        {leg2}"
                    </text>

                    {/* Gages */}
                    {renderGageLines(gage1, true)}
                    {renderGageLines(gage2, false)}
                </g>
            </svg>
        </div>
    );
};

export default AngleGageVisualizer;
