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

// Helper component for Dimension Lines
const DimensionLine: React.FC<{
    start: number; // Start coordinate along the axis
    end: number;   // End coordinate along the axis
    pos: number;   // The constant coordinate (perpendicular axis position)
    axis: 'x' | 'y'; // Direction of the dimension line
    label: string;
    subLabel?: string;
    color?: string;
    tickSize?: number;
}> = ({ start, end, pos, axis, label, subLabel, color = "#76b900", tickSize = 3.5 }) => {
    // Determine coordinates based on axis
    // If axis is 'y' (Vertical dimension), x is constant (pos), y varies (start to end)

    const isX = axis === 'x';
    const x1 = isX ? start : pos;
    const y1 = isX ? pos : start;
    const x2 = isX ? end : pos;
    const y2 = isX ? pos : end;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Tick Marks (Diagonal /)
    // At start point
    const startTickPath = `M ${isX ? start - tickSize : pos - tickSize} ${isX ? pos + tickSize : start + tickSize} L ${isX ? start + tickSize : pos + tickSize} ${isX ? pos - tickSize : start - tickSize}`;
    // At end point
    const endTickPath = `M ${isX ? end - tickSize : pos - tickSize} ${isX ? pos + tickSize : end + tickSize} L ${isX ? end + tickSize : pos + tickSize} ${isX ? pos - tickSize : end - tickSize}`;

    // Extension Lines (small overlap)
    // We assume the caller handles the main extension lines from the object to the dim line if needed, 
    // but typically standard drafting has a small gap from object and extends slightly past the dim line.
    // For this simple viz, we will just draw the main dim line and ticks.
    // We will add small extensions perpendicular to the dim line at start/end to make it look "bounded"
    const extLen = tickSize * 1.5;
    const startExt = isX
        ? <line x1={start} y1={pos - extLen} x2={start} y2={pos + extLen} stroke={color} strokeWidth="1" />
        : <line x1={pos - extLen} y1={start} x2={pos + extLen} y2={start} stroke={color} strokeWidth="1" />;
    const endExt = isX
        ? <line x1={end} y1={pos - extLen} x2={end} y2={pos + extLen} stroke={color} strokeWidth="1" />
        : <line x1={pos - extLen} y1={end} x2={pos + extLen} y2={end} stroke={color} strokeWidth="1" />;

    return (
        <g>
            {/* Main Line */}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" />

            {/* Ticks */}
            <path d={startTickPath} stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d={endTickPath} stroke={color} strokeWidth="2" strokeLinecap="round" />

            {/* Extensions (vertical/horizontal markers at ends) */}
            {startExt}
            {endExt}

            {/* Text */}
            <g transform={`translate(${midX}, ${midY})`}>
                {isX ? (
                    // Horizontal Text (Above/Below line? usually above)
                    // We'll put it slightly off the line
                    <React.Fragment>
                        <text x="0" y="-4" fill={color} fontSize="11" textAnchor="middle" fontWeight="bold" style={{ textShadow: '1px 1px 2px black' }}>{label}</text>
                        {subLabel && <text x="0" y="8" fill="#aaa" fontSize="9" textAnchor="middle" style={{ textShadow: '1px 1px 2px black' }}>{subLabel}</text>}
                    </React.Fragment>
                ) : (
                    // Vertical Text
                    // Rotate -90? Or keep upright next to line?
                    // Standard is often aligned with line.
                    <g transform="rotate(-90)">
                        <text x="0" y="-4" fill={color} fontSize="11" textAnchor="middle" fontWeight="bold" style={{ textShadow: '1px 1px 2px black' }}>{label}</text>
                        {subLabel && <text x="0" y="8" fill="#aaa" fontSize="9" textAnchor="middle" style={{ textShadow: '1px 1px 2px black' }}>{subLabel}</text>}
                    </g>
                )}
            </g>
        </g>
    );
};

const AngleGageVisualizer: React.FC<AngleGageVisualizerProps> = ({ leg1, leg2, thickness, gage1, gage2 }) => {
    // Scaling
    const maxDim = Math.max(leg1, leg2);
    const scale = 290 / (maxDim * 1.1);
    const padding = 80; // Increased padding for dimensions

    const L1 = leg1 * scale;
    const L2 = leg2 * scale;
    const T = thickness * scale;
    const holeSize = T; // Or fixed size? keeping as T per request

    // Coordinates
    // Origin (0,0) is Outer Heel
    // Vertical Leg: (0,0) to (0, L1) (Outer Left Edge)
    // Horizontal Leg: (0,0) to (L2, 0) (Outer Top Edge)

    // Shape Path
    // Start Top-Left (0,0) -> Top-Right (L2,0) -> Down Thickness (L2,T) -> Left to Inner Corner (T,T) -> Down to Bottom (T,L1) -> Left to Bottom-Left (0,L1) -> Close
    const path = `M 0 0 L ${L2} 0 L ${L2} ${T} L ${T} ${T} L ${T} ${L1} L 0 ${L1} Z`;

    const renderDimensions = (info: AngleGage | undefined, isVerticalLeg: boolean) => {
        if (!info) return null;

        // Extract intervals (g1, g2, g3...)
        // API: g (primary), or g1, g2...
        // If g1 is present, use g1, g2...
        // If only g is present, implies single hole at g.

        const intervals: { dist: number, label: string }[] = [];

        if (info.g1) {
            intervals.push({ dist: info.g1, label: "g1" });
            if (info.g2) intervals.push({ dist: info.g2, label: "g2" });
            if (info.g3) intervals.push({ dist: info.g3, label: "g3" });
            if (info.g4) intervals.push({ dist: info.g4, label: "g4" });
        } else {
            intervals.push({ dist: info.g, label: "g" });
        }

        const dims = [];
        let currentPos = 0; // Distance from reference edge (Heel)

        // Determine Line Position (Offset from leg)
        // Vertical Leg: Measure Y. Line is vertical, placed at X > T.
        // Horizontal Leg: Measure X. Line is horizontal, placed at Y > T.

        // We want them "outside" the L shape inner space? 
        // Or outside the whole bounding box?
        // User image shows them on the OUTSIDE of the L?
        // Wait, typical gage is from BACK of angle (Heel).
        // Vertical Leg Gage 'g': distance from TOP edge (Y=0) downwards? NO.
        // For an angle leg, gage is usually from the BACK (Heel).
        // Vertical Leg: Back is Left Edge (X=0)? No, Back is Top Edge (Y=0) IF vertical leg is the one sticking UP?
        // Let's standardise the orientation:
        // L shape.
        // Vertical Leg is the one on the Left, going Down. Back of angle is the Outer Corner (0,0).
        // Gage on Vertical Leg is measured from the OUTSIDE VERTICAL FACE? No, usually from Heel or Toe.
        // Standard AISC Gage 'g' is from the BACK of the angle (Heel).
        // So for Vertical Leg (Left side): Measure from Top Edge (y=0)? NO.
        // If we are looking at the cross section:
        // Vertical Leg is the one along Y axis.
        // Gage 'g' is distance from Heel (Top Edge of horizontal leg / Corner) DOWN the vertical leg? 
        // OR distance from Heel (Left Edge) ACROSS the vertical leg width?
        // Usually 'g' is along the leg length? NO.
        // 'g' locates the hole ACROSS the width of the leg.
        // So on a 4" leg, g might be 2.5".
        // Vertical Leg (Height L1, Width T).
        // The leg "Length" we see in cross section is actually its WIDTH in terms of the angle profile (e.g. L4x4).
        // So L1 is the Leg Size (e.g. 4").
        // We are looking at the SECTION.
        // Use 'g' along the long dimension of the rect.

        // Vertical Leg (Along Y axis, length L1):
        // Measurement starts at Y=0 (Heel).
        // Measures *along* Y axis.
        // So dim line should be parallel to Y axis.
        // Position X should be outside. Let's put it to the Right of the leg? 
        // Or Left? Usually to the left if referencing 0?
        // But 0,0 is top-left.
        // Let's put dimensions for Vertical Leg on the LEFT or RIGHT?
        // User image: Vertical dims on the LEFT? No, image provided has dims on Top and Right.
        // Wait, the image provided is "Beam, Channel & Angle Gage Selector".
        // The image shows an L shape.
        // Top leg (Horizontal) has dims on Top.
        // Side leg (Vertical) has dims on Right? Or Left?
        // Actually, looking at the code I wrote before:
        // Vertical Leg: `holeY` varies. So we are measuring Y position. 
        // Horizontal Leg: `holeX` varies. So we are measuring X position.

        // So for Vertical Leg:
        // We measure distance from Top (Y=0).
        // So we want a dim line running vertically.
        // Offset: Put it to the Right of T? Or Left of 0?
        // Let's put it at X = -dimOffset (Left of the shape) or X = T + dimOffset (Right, inside the L).
        // User Image hints: "g/g1 is from back of angle".
        // I will put Vertical Leg dims on the LEFT (since Back/Heel is usually reference).
        // Wait, if (0,0) is top-left, then Left is outside.
        // Horizontal Leg dims on the TOP (Outside).

        const dimOffset = 40;
        const linePos = isVerticalLeg ? -dimOffset : -dimOffset;
        // If vertical leg, x=-40. If horizontal leg, y=-40.

        // Also we want Extension lines from the points on the object to the dim line.

        // Accumulate dimensions
        let absolutePos = 0;

        const dimElements: React.ReactNode[] = [];
        const extLines: React.ReactNode[] = [];

        // Add Extension at Start (Heel)
        // From (0,0) to LinePos.
        if (isVerticalLeg) {
            // Ext line at Y=0, from X=0 to X=LinePos
            extLines.push(<line key="start-ext" x1={0} y1={0} x2={linePos} y2={0} stroke="#76b900" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />);
        } else {
            // Ext line at X=0, from Y=0 to Y=LinePos
            extLines.push(<line key="start-ext" x1={0} y1={0} x2={0} y2={linePos} stroke="#76b900" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />);
        }

        intervals.forEach((interval, idx) => {
            const startVal = absolutePos;
            const endVal = absolutePos + interval.dist;

            const startPx = startVal * scale;
            const endPx = endVal * scale;

            // Dimension Line for this interval
            dimElements.push(
                <DimensionLine
                    key={`${isVerticalLeg ? 'v' : 'h'}-${idx}`}
                    start={startPx}
                    end={endPx}
                    pos={linePos}
                    axis={isVerticalLeg ? 'y' : 'x'}
                    label={`${toFraction(interval.dist)}`}
                    subLabel={`(${interval.dist})`}
                />
            );

            // Extension Line at End of interval
            // Hole center is at endPx.
            // Draw ext line from Center of hole to dim line.

            // Hole Center Coords
            const holeCenter = isVerticalLeg
                ? { x: T / 2, y: endPx }
                : { x: endPx, y: T / 2 };

            if (isVerticalLeg) {
                extLines.push(
                    <line key={`ext-${idx}`}
                        x1={holeCenter.x} y1={holeCenter.y}
                        x2={linePos} y2={holeCenter.y}
                        stroke="#76b900" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />
                );

                // Draw Hole
                dimElements.push(
                    <rect key={`hole-${idx}`}
                        x={holeCenter.x - holeSize / 2} y={holeCenter.y - holeSize / 2}
                        width={holeSize} height={holeSize}
                        fill="#ccff00" stroke="none"
                    />
                );

            } else {
                extLines.push(
                    <line key={`ext-${idx}`}
                        x1={holeCenter.x} y1={holeCenter.y}
                        x2={holeCenter.x} y2={linePos}
                        stroke="#76b900" strokeWidth="0.5" strokeDasharray="2" opacity="0.5" />
                );

                // Draw Hole
                dimElements.push(
                    <rect key={`hole-${idx}`}
                        x={holeCenter.x - holeSize / 2} y={holeCenter.y - holeSize / 2}
                        width={holeSize} height={holeSize}
                        fill="#ccff00" stroke="none"
                    />
                );
            }

            absolutePos += interval.dist;
        });

        return (
            <React.Fragment>
                {extLines}
                {dimElements}
            </React.Fragment>
        );
    };

    return (
        <div className="flex justify-center items-center p-4 w-full bg-[#1e1e1e] rounded-lg">
            <svg viewBox={`-${padding} -${padding} ${350 + padding} ${350 + padding}`} width="100%" height="auto" style={{ maxWidth: '800px' }}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <g transform={`translate(${padding}, ${padding})`}>

                    {/* The L Shape */}
                    <path d={path} fill="#333" stroke="#555" strokeWidth="2" />

                    {/* Overall Leg Dimensions (Gray, farther out) */}
                    {/* Leg 1 (Vertical) - Left side, farther out than gages */}
                    {/* We put gages at -40, so put Leg Dim at -70? */}
                    <DimensionLine
                        start={0} end={L1} pos={-70} axis='y'
                        label={`${leg1}"`} color="#666"
                    />
                    {/* Ext lines for Leg 1 */}
                    <line x1={0} y1={0} x2={-70} y2={0} stroke="#666" strokeWidth="0.5" />
                    <line x1={0} y1={L1} x2={-70} y2={L1} stroke="#666" strokeWidth="0.5" />


                    {/* Leg 2 (Horizontal) - Top side, farther out */}
                    <DimensionLine
                        start={0} end={L2} pos={-70} axis='x'
                        label={`${leg2}"`} color="#666"
                    />
                    {/* Ext lines for Leg 2 */}
                    <line x1={0} y1={0} x2={0} y2={-70} stroke="#666" strokeWidth="0.5" />
                    <line x1={L2} y1={0} x2={L2} y2={-70} stroke="#666" strokeWidth="0.5" />

                    {/* Gage Dimensions */}
                    {renderDimensions(gage1, true)}
                    {renderDimensions(gage2, false)}

                </g>
            </svg>
        </div>
    );
};

export default AngleGageVisualizer;
