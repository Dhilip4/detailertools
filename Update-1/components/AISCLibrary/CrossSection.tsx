import React from 'react';
import { AISCShape } from '../../types/aisc';

interface CrossSectionProps {
    shape: AISCShape;
    width?: number;
    height?: number;
}

export const CrossSection: React.FC<CrossSectionProps> = ({ shape, width = 380, height = 380 }) => {
    if (!shape) return null;

    const renderShape = () => {
        switch (shape.type) {
            case 'W':
            case 'M':
            case 'S':
            case 'HP':
                return <IShapePath shape={shape} width={width} height={height} />;
            case 'C':
            case 'MC':
                return <ChannelPath shape={shape} width={width} height={height} />;
            case 'L':
            case 'Angle':
                return <AnglePath shape={shape} width={width} height={height} />;
            case 'HSS_Rect':
                return <HSSRectPath shape={shape} width={width} height={height} />;
            case 'HSS_Round':
            case 'PIPE':
                return <PipePath shape={shape} width={width} height={height} />;
            case 'WT':
            case 'MT':
            case 'ST':
                return <TeePath shape={shape} width={width} height={height} />;
            default:
                return (
                    <text x={width / 2} y={height / 2} textAnchor="middle" fill="#666" fontSize="14">
                        Preview not available
                    </text>
                );
        }
    };

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-lg">
            <defs>
                {/* Gradient for steel material look */}
                <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4a4a4a" />
                    <stop offset="50%" stopColor="#3a3a3a" />
                    <stop offset="100%" stopColor="#2a2a2a" />
                </linearGradient>

                {/* Arrow markers for dimensions */}
                <marker id="dimArrowStart" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
                    <path d="M8,0 L0,3 L8,6" fill="none" stroke="#76b900" strokeWidth="1" />
                </marker>
                <marker id="dimArrowEnd" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6" fill="none" stroke="#76b900" strokeWidth="1" />
                </marker>

                {/* Drop shadow for depth */}
                <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                </filter>
            </defs>
            {renderShape()}
        </svg>
    );
};

// --- Scaling Helper ---
const useShapeScale = (d: number, b: number, width: number, height: number, padding: number = 75) => {
    const availW = width - 2 * padding;
    const availH = height - 2 * padding;
    const safeD = d || 1;
    const safeB = b || 1;
    const scale = Math.min(availW / safeB, availH / safeD);
    const cx = width / 2;
    const cy = height / 2;
    return { scale, cx, cy };
};

// --- I-Shape (W, M, S, HP) ---
const IShapePath = ({ shape, width, height }: { shape: AISCShape, width: number, height: number }) => {
    const d = shape.d || 10;
    const bf = shape.bf || 5;
    const tf = shape.tf || 0.5;
    const tw = shape.tw || 0.3;
    const k = shape.kdes || shape.k || tf;
    const r = Math.max(0, k - tf);

    const { scale, cx, cy } = useShapeScale(d, bf, width, height);

    const sd = d * scale;
    const sbf = bf * scale;
    const stf = tf * scale;
    const stw = tw * scale;
    const sr = Math.min(r * scale, stf * 0.8);

    const topY = -sd / 2;
    const bottomY = sd / 2;
    const leftX = -sbf / 2;
    const rightX = sbf / 2;
    const webLeft = -stw / 2;
    const webRight = stw / 2;
    const flangeBottom = topY + stf;
    const flangeTopBottom = bottomY - stf;

    const pathData = [
        `M ${cx + leftX} ${cy + topY}`,
        `L ${cx + rightX} ${cy + topY}`,
        `L ${cx + rightX} ${cy + flangeBottom}`,
        `L ${cx + webRight + sr} ${cy + flangeBottom}`,
        `Q ${cx + webRight} ${cy + flangeBottom} ${cx + webRight} ${cy + flangeBottom + sr}`,
        `L ${cx + webRight} ${cy + flangeTopBottom - sr}`,
        `Q ${cx + webRight} ${cy + flangeTopBottom} ${cx + webRight + sr} ${cy + flangeTopBottom}`,
        `L ${cx + rightX} ${cy + flangeTopBottom}`,
        `L ${cx + rightX} ${cy + bottomY}`,
        `L ${cx + leftX} ${cy + bottomY}`,
        `L ${cx + leftX} ${cy + flangeTopBottom}`,
        `L ${cx + webLeft - sr} ${cy + flangeTopBottom}`,
        `Q ${cx + webLeft} ${cy + flangeTopBottom} ${cx + webLeft} ${cy + flangeTopBottom - sr}`,
        `L ${cx + webLeft} ${cy + flangeBottom + sr}`,
        `Q ${cx + webLeft} ${cy + flangeBottom} ${cx + webLeft - sr} ${cy + flangeBottom}`,
        `L ${cx + leftX} ${cy + flangeBottom}`,
        `Z`
    ].join(' ');

    return (
        <g>
            {/* Shadow layer */}
            <path d={pathData} fill="#1a1a1a" transform="translate(2, 2)" opacity="0.5" />

            {/* Main shape with gradient */}
            <path d={pathData} fill="url(#steelGradient)" stroke="#76b900" strokeWidth="1.5" filter="url(#dropShadow)" />

            {/* Highlight on top flange */}
            <rect x={cx + leftX + 2} y={cy + topY + 1} width={sbf - 4} height={stf * 0.4} fill="rgba(255,255,255,0.08)" rx="1" />

            {/* Dimension: depth (d) - left side */}
            <DimensionLine x1={cx + leftX - 30} y1={cy + topY} x2={cx + leftX - 30} y2={cy + bottomY} label={`d = ${d}"`} vertical />

            {/* Dimension: flange width (bf) - top */}
            <DimensionLine x1={cx + leftX} y1={cy + topY - 25} x2={cx + rightX} y2={cy + topY - 25} label={`bf = ${bf}"`} />

            {/* Fillet radius arc dimension (k) */}
            {sr > 3 && (
                <RadiusArc
                    cx={cx + webRight}
                    cy={cy + flangeBottom}
                    radius={sr}
                    label={`k = ${k}"`}
                />
            )}

            {/* Dimension callout for tw - positioned below shape */}
            <g>
                <rect x={cx - 35} y={cy + bottomY + 8} width="70" height="20" rx="3" fill="#0a0a0a" opacity="0.95" />
                <text x={cx} y={cy + bottomY + 22} fill="#76b900" fontSize="12" fontFamily="'Inter', monospace" fontWeight="600" textAnchor="middle">
                    tw = {tw}"
                </text>
            </g>
        </g>
    );
};

// --- Channel (C, MC) ---
const ChannelPath = ({ shape, width, height }: { shape: AISCShape, width: number, height: number }) => {
    const d = shape.d || 10;
    const bf = shape.bf || 3;
    const tf = shape.tf || 0.5;
    const tw = shape.tw || 0.3;
    const k = shape.kdes || shape.k || tf;
    const r = Math.max(0, k - tf);

    const { scale, cx, cy } = useShapeScale(d, bf, width, height);

    const sd = d * scale;
    const sbf = bf * scale;
    const stf = tf * scale;
    const stw = tw * scale;
    const sr = Math.min(r * scale, stf * 0.8);

    const leftX = -sbf / 2;
    const rightX = sbf / 2;
    const topY = -sd / 2;
    const bottomY = sd / 2;

    const pathData = [
        `M ${cx + leftX} ${cy + topY}`,
        `L ${cx + rightX} ${cy + topY}`,
        `L ${cx + rightX} ${cy + topY + stf}`,
        `L ${cx + leftX + stw + sr} ${cy + topY + stf}`,
        `Q ${cx + leftX + stw} ${cy + topY + stf} ${cx + leftX + stw} ${cy + topY + stf + sr}`,
        `L ${cx + leftX + stw} ${cy + bottomY - stf - sr}`,
        `Q ${cx + leftX + stw} ${cy + bottomY - stf} ${cx + leftX + stw + sr} ${cy + bottomY - stf}`,
        `L ${cx + rightX} ${cy + bottomY - stf}`,
        `L ${cx + rightX} ${cy + bottomY}`,
        `L ${cx + leftX} ${cy + bottomY}`,
        `Z`
    ].join(' ');

    return (
        <g>
            <path d={pathData} fill="#1a1a1a" transform="translate(2, 2)" opacity="0.5" />
            <path d={pathData} fill="url(#steelGradient)" stroke="#76b900" strokeWidth="1.5" filter="url(#dropShadow)" />

            <DimensionLine x1={cx + leftX - 30} y1={cy + topY} x2={cx + leftX - 30} y2={cy + bottomY} label={`d = ${d}"`} vertical />
            <DimensionLine x1={cx + leftX} y1={cy + topY - 25} x2={cx + rightX} y2={cy + topY - 25} label={`bf = ${bf}"`} />

            {sr > 3 && (
                <RadiusArc cx={cx + leftX + stw} cy={cy + topY + stf} radius={sr} label={`k = ${k}"`} />
            )}
        </g>
    );
};

// --- Angle (L) ---
const AnglePath = ({ shape, width, height }: { shape: AISCShape, width: number, height: number }) => {
    const d = shape.d || 4;
    const b = shape.b || shape.bf || 4;
    const t = shape.t || shape.tw || 0.25;
    const k = shape.kdes || shape.k || t;
    const r = Math.max(0, k - t);

    // Increase padding to 85 to prevent label clipping on the left
    const { scale, cx, cy } = useShapeScale(d, b, width, height, 85);

    const sd = d * scale;
    const sb = b * scale;
    const st = t * scale;
    const sr = Math.min(r * scale, st * 0.8);

    const leftX = -sb / 2;
    const bottomY = sd / 2;

    const pathData = [
        `M ${cx + leftX} ${cy + bottomY - sd}`,
        `L ${cx + leftX + st} ${cy + bottomY - sd}`,
        `L ${cx + leftX + st} ${cy + bottomY - st - sr}`,
        `Q ${cx + leftX + st} ${cy + bottomY - st} ${cx + leftX + st + sr} ${cy + bottomY - st}`,
        `L ${cx + leftX + sb} ${cy + bottomY - st}`,
        `L ${cx + leftX + sb} ${cy + bottomY}`,
        `L ${cx + leftX} ${cy + bottomY}`,
        `Z`
    ].join(' ');

    // Create labels as strings
    const dLabel = d.toFixed(1) + '"';
    const bLabel = b.toFixed(1) + '"';

    return (
        <g>
            <path d={pathData} fill="#1a1a1a" transform="translate(2, 2)" opacity="0.5" />
            <path d={pathData} fill="url(#steelGradient)" stroke="#76b900" strokeWidth="1.5" filter="url(#dropShadow)" />

            {/* Vertical dimension line and label - inline to bypass DimensionLine bug */}
            <g>
                {/* Vertical line with arrows */}
                <line
                    x1={cx + leftX - 25}
                    y1={cy + bottomY - sd}
                    x2={cx + leftX - 25}
                    y2={cy + bottomY}
                    stroke="#76b900"
                    strokeWidth="1.2"
                    markerStart="url(#dimArrowStart)"
                    markerEnd="url(#dimArrowEnd)"
                />
                {/* Extension lines */}
                <line x1={cx + leftX - 30} y1={cy + bottomY - sd} x2={cx + leftX - 15} y2={cy + bottomY - sd} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                <line x1={cx + leftX - 30} y1={cy + bottomY} x2={cx + leftX - 15} y2={cy + bottomY} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                {/* Label background */}
                <rect
                    x={cx + leftX - 80}
                    y={cy - 12}
                    width="70"
                    height="22"
                    rx="4"
                    fill="#0a0a0a"
                    opacity="0.95"
                />
                {/* Label text */}
                <text
                    x={cx + leftX - 45}
                    y={cy + 5}
                    fill="#76b900"
                    fontSize="14"
                    fontFamily="'Inter', monospace"
                    fontWeight="700"
                    textAnchor="middle"
                >
                    {d}"
                </text>
            </g>

            {/* Horizontal dimension line and label - inline */}
            <g>
                {/* Horizontal line with arrows */}
                <line
                    x1={cx + leftX}
                    y1={cy + bottomY + 25}
                    x2={cx + leftX + sb}
                    y2={cy + bottomY + 25}
                    stroke="#76b900"
                    strokeWidth="1.2"
                    markerStart="url(#dimArrowStart)"
                    markerEnd="url(#dimArrowEnd)"
                />
                {/* Extension lines */}
                <line x1={cx + leftX} y1={cy + bottomY + 20} x2={cx + leftX} y2={cy + bottomY + 35} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                <line x1={cx + leftX + sb} y1={cy + bottomY + 20} x2={cx + leftX + sb} y2={cy + bottomY + 35} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                {/* Label background */}
                <rect
                    x={cx + leftX + sb / 2 - 35}
                    y={cy + bottomY + 7}
                    width="70"
                    height="22"
                    rx="4"
                    fill="#0a0a0a"
                    opacity="0.95"
                />
                {/* Label text */}
                <text
                    x={cx + leftX + sb / 2}
                    y={cy + bottomY + 22}
                    fill="#76b900"
                    fontSize="14"
                    fontFamily="'Inter', monospace"
                    fontWeight="700"
                    textAnchor="middle"
                >
                    {b}"
                </text>
            </g>
        </g>
    );
};

// --- HSS Rectangular ---
const HSSRectPath = ({ shape, width, height }: { shape: AISCShape, width: number, height: number }) => {
    const H = shape.Ht || shape.d || 10;
    const B = shape.B || shape.bf || 5;
    const t = shape.tdes || shape.tnom || shape.tw || 0.25;
    const ro = 2 * t;
    const ri = Math.max(0, ro - t);

    const { scale, cx, cy } = useShapeScale(H, B, width, height);

    const sH = H * scale;
    const sB = B * scale;
    const st = t * scale;
    const sro = ro * scale;
    const sri = ri * scale;

    return (
        <g>
            <rect x={cx - sB / 2 + 2} y={cy - sH / 2 + 2} width={sB} height={sH} rx={sro} fill="#1a1a1a" opacity="0.5" />
            <rect x={cx - sB / 2} y={cy - sH / 2} width={sB} height={sH} rx={sro} fill="url(#steelGradient)" stroke="#76b900" strokeWidth="1.5" filter="url(#dropShadow)" />
            <rect x={cx - sB / 2 + st} y={cy - sH / 2 + st} width={sB - 2 * st} height={sH - 2 * st} rx={sri} fill="#0a0a0a" stroke="#333" strokeWidth="0.5" />

            <DimensionLine x1={cx - sB / 2 - 25} y1={cy - sH / 2} x2={cx - sB / 2 - 25} y2={cy + sH / 2} label={`${H}"`} vertical />
            <DimensionLine x1={cx - sB / 2} y1={cy - sH / 2 - 22} x2={cx + sB / 2} y2={cy - sH / 2 - 22} label={`${B}"`} />
        </g>
    );
};

// --- Pipe / Round HSS ---
const PipePath = ({ shape, width, height }: { shape: AISCShape, width: number, height: number }) => {
    const od = shape.OD || 10;
    const t = shape.tdes || shape.tnom || 0.3;
    const id = shape.ID || (od - 2 * t);

    const { scale, cx, cy } = useShapeScale(od, od, width, height);
    const sod = od * scale;
    const sid = id * scale;

    return (
        <g>
            <circle cx={cx + 2} cy={cy + 2} r={sod / 2} fill="#1a1a1a" opacity="0.5" />
            <circle cx={cx} cy={cy} r={sod / 2} fill="url(#steelGradient)" stroke="#76b900" strokeWidth="1.5" filter="url(#dropShadow)" />
            <circle cx={cx} cy={cy} r={sid / 2} fill="#0a0a0a" stroke="#333" strokeWidth="0.5" />

            <DimensionLine x1={cx - sod / 2} y1={cy - sod / 2 - 22} x2={cx + sod / 2} y2={cy - sod / 2 - 22} label={`OD = ${od}"`} />
        </g>
    );
};

// --- Tee (WT, MT, ST) ---
const TeePath = ({ shape, width, height }: { shape: AISCShape, width: number, height: number }) => {
    const d = shape.d || 10;
    const bf = shape.bf || 5;
    const tf = shape.tf || 0.5;
    const tw = shape.tw || 0.3;
    const k = shape.kdes || shape.k || tf;
    const r = Math.max(0, k - tf);

    const { scale, cx, cy } = useShapeScale(d, bf, width, height);

    const sd = d * scale;
    const sbf = bf * scale;
    const stf = tf * scale;
    const stw = tw * scale;
    const sr = Math.min(r * scale, stf * 0.8);

    const topY = -sd / 2;
    const bottomY = sd / 2;
    const leftX = -sbf / 2;
    const rightX = sbf / 2;
    const webLeft = -stw / 2;
    const webRight = stw / 2;
    const flangeBottom = topY + stf;

    const pathData = [
        `M ${cx + leftX} ${cy + topY}`,
        `L ${cx + rightX} ${cy + topY}`,
        `L ${cx + rightX} ${cy + flangeBottom}`,
        `L ${cx + webRight + sr} ${cy + flangeBottom}`,
        `Q ${cx + webRight} ${cy + flangeBottom} ${cx + webRight} ${cy + flangeBottom + sr}`,
        `L ${cx + webRight} ${cy + bottomY}`,
        `L ${cx + webLeft} ${cy + bottomY}`,
        `L ${cx + webLeft} ${cy + flangeBottom + sr}`,
        `Q ${cx + webLeft} ${cy + flangeBottom} ${cx + webLeft - sr} ${cy + flangeBottom}`,
        `L ${cx + leftX} ${cy + flangeBottom}`,
        `Z`
    ].join(' ');

    return (
        <g>
            <path d={pathData} fill="#1a1a1a" transform="translate(2, 2)" opacity="0.5" />
            <path d={pathData} fill="url(#steelGradient)" stroke="#76b900" strokeWidth="1.5" filter="url(#dropShadow)" />

            <DimensionLine x1={cx + leftX - 30} y1={cy + topY} x2={cx + leftX - 30} y2={cy + bottomY} label={`d = ${d}"`} vertical />
            <DimensionLine x1={cx + leftX} y1={cy + topY - 22} x2={cx + rightX} y2={cy + topY - 22} label={`bf = ${bf}"`} />

            {sr > 3 && (
                <RadiusArc cx={cx + webRight} cy={cy + flangeBottom} radius={sr} label={`k = ${k}"`} />
            )}
        </g>
    );
};

// --- Radius Arc Dimension ---
const RadiusArc = ({ cx, cy, radius, label }: { cx: number, cy: number, radius: number, label: string }) => {
    // Draw a small arc indicator at the fillet location
    const arcPath = `M ${cx + radius * 1.5} ${cy} A ${radius * 1.5} ${radius * 1.5} 0 0 1 ${cx} ${cy + radius * 1.5}`;

    return (
        <g className="radius-dimension">
            {/* Arc indicator */}
            <path
                d={arcPath}
                fill="none"
                stroke="#ff9800"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                opacity="0.9"
            />

            {/* Leader line */}
            <line
                x1={cx + radius}
                y1={cy + radius}
                x2={cx + radius + 35}
                y2={cy + radius + 25}
                stroke="#ff9800"
                strokeWidth="1"
            />

            {/* Label background */}
            <rect
                x={cx + radius + 30}
                y={cy + radius + 18}
                width="55"
                height="20"
                rx="3"
                fill="#0a0a0a"
                opacity="0.95"
            />

            {/* Label text */}
            <text
                x={cx + radius + 57}
                y={cy + radius + 32}
                fill="#ff9800"
                fontSize="12"
                fontFamily="'Inter', monospace"
                fontWeight="600"
                textAnchor="middle"
            >
                {label}
            </text>
        </g>
    );
};

// --- Dimension Line Component ---
const DimensionLine = ({
    x1, y1, x2, y2, label, vertical = false
}: {
    x1: number, y1: number, x2: number, y2: number, label: string, vertical?: boolean
}) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
        <g className="dimension-line">
            {/* Main line */}
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#76b900"
                strokeWidth="1.2"
                markerStart="url(#dimArrowStart)"
                markerEnd="url(#dimArrowEnd)"
            />

            {/* Extension lines */}
            {vertical ? (
                <>
                    <line x1={x1 - 5} y1={y1} x2={x1 + 10} y2={y1} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                    <line x1={x2 - 5} y1={y2} x2={x2 + 10} y2={y2} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                </>
            ) : (
                <>
                    <line x1={x1} y1={y1 - 5} x2={x1} y2={y1 + 10} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                    <line x1={x2} y1={y2 - 5} x2={x2} y2={y2 + 10} stroke="#76b900" strokeWidth="0.6" opacity="0.7" />
                </>
            )}

            {/* Label background */}
            <rect
                x={vertical ? x1 - 55 : midX - 35}
                y={vertical ? midY - 12 : y1 - 18}
                width="70"
                height="22"
                rx="4"
                fill="#0a0a0a"
                opacity="0.95"
            />

            {/* Label text - LARGER */}
            <text
                x={vertical ? x1 - 20 : midX}
                y={vertical ? midY + 5 : y1 - 3}
                fill="#76b900"
                fontSize="14"
                fontFamily="'Inter', monospace"
                fontWeight="700"
                textAnchor="middle"
            >
                {label}
            </text>
        </g>
    );
};
