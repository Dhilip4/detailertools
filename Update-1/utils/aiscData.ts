export type AngleGage = {
    leg: number;
    g: number;
    g1?: number; // Distance to first line
    g2?: number; // Spacing to second line
    g3?: number; // Spacing to third line
    g4?: number; // Spacing to fourth line
};

export const ANGLE_GAGES: AngleGage[] = [
    { leg: 12, g: 6, g1: 3, g2: 2.5, g3: 2.5, g4: 2.5 },
    { leg: 10, g: 5, g1: 3, g2: 2.5, g3: 2.5 },
    { leg: 8, g: 4.5, g1: 3, g2: 3 },
    { leg: 7, g: 4, g1: 2.5, g2: 3 },
    { leg: 6, g: 3.5, g1: 2.25, g2: 2.5 },
    { leg: 5, g: 3, g1: 2, g2: 1.75 },
    { leg: 4, g: 2.5 },
    { leg: 3.5, g: 2 },
    { leg: 3, g: 1.75 },
    { leg: 2.5, g: 1.375 }, // 1 3/8
    { leg: 2, g: 1.125 },   // 1 1/8
    { leg: 1.75, g: 1 },
    { leg: 1.5, g: 0.875 }, // 7/8
    { leg: 1.375, g: 0.875 }, // 7/8 -> 1.375 is 1 3/8
    { leg: 1.25, g: 0.75 },
    { leg: 1, g: 0.625 },
];

export const getAngleGage = (legSize: number): AngleGage | undefined => {
    return ANGLE_GAGES.find(ag => ag.leg === legSize);
};

export const getBeamFlangeGage = (bf: number): number | null => {
    // Logic: 
    // 4" -> 2 1/4"
    if (Math.abs(bf - 4) < 0.01) return 2.25;

    // 4 1/16 (4.0625) to 6" -> 2 3/4"
    if (bf >= 4.0625 && bf <= 6) return 2.75;

    // 6 1/16 (6.0625) to 7 15/16 (7.9375) -> 3 1/2"
    if (bf >= 6.0625 && bf <= 7.9375) return 3.5;

    // 8" and up -> 5 1/2"
    if (bf >= 8) return 5.5;

    // Fallback or smaller than 4?
    return null;
};

export const getBeamWebGage = (nominalDepth: number): { gage: number; note?: string } | null => {
    // W6 -> 2.5, stagger
    // W8 -> 4, stagger
    // W10 -> 4
    // W12+ -> 5.5

    if (nominalDepth === 6) return { gage: 2.5, note: "* Flange holes must be staggered" };
    if (nominalDepth === 8) return { gage: 4, note: "* Flange holes must be staggered" };
    if (nominalDepth === 10) return { gage: 4 };
    if (nominalDepth >= 12) return { gage: 5.5 };

    return null;
};

export const ANCHOR_ROD_DIAMETERS = [
    0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2
];

export const getAnchorHoleSize = (rodDia: number): number => {
    // Exact mappings from Table 14-2
    // 1/2 -> 1 1/16 (1.0625)
    if (Math.abs(rodDia - 0.5) < 0.001) return 1.0625;
    // 5/8 -> 1 3/16 (1.1875)
    if (Math.abs(rodDia - 0.625) < 0.001) return 1.1875;
    // 3/4 -> 1 5/16 (1.3125)
    if (Math.abs(rodDia - 0.75) < 0.001) return 1.3125;
    // 7/8 -> 1 9/16 (1.5625)
    if (Math.abs(rodDia - 0.875) < 0.001) return 1.5625;
    // 1 -> 1 13/16 (1.8125)
    if (Math.abs(rodDia - 1.0) < 0.001) return 1.8125;
    // 1 1/4 -> 2 1/16 (2.0625)
    if (Math.abs(rodDia - 1.25) < 0.001) return 2.0625;
    // 1 1/2 -> 2 5/16 (2.3125)
    if (Math.abs(rodDia - 1.5) < 0.001) return 2.3125;
    // 1 3/4 -> 2 3/4 (2.75)
    if (Math.abs(rodDia - 1.75) < 0.001) return 2.75;
    // 2 -> 3 1/4 (3.25)
    if (Math.abs(rodDia - 2.0) < 0.001) return 3.25;

    // Rule for > 2: db + 1.25"
    if (rodDia > 2) return rodDia + 1.25;

    return 0;
};

export const getBoltRows = (nominalDepth: number): { min: number; max: number } | null => {
    // Minimum Bolt Rows
    let min = 0;
    if (nominalDepth === 6) min = 1;
    else if (nominalDepth >= 8 && nominalDepth <= 12) min = 2;
    else if (nominalDepth >= 14 && nominalDepth <= 18) min = 3;
    else if (nominalDepth >= 21 && nominalDepth <= 24) min = 4;
    else if (nominalDepth >= 27 && nominalDepth <= 30) min = 5;
    else if (nominalDepth >= 33 && nominalDepth <= 36) min = 6;
    else min = 0; // W4? or > 36?

    // Maximum Bolt Rows @ 3" Spacing
    let max = 0;
    if (nominalDepth === 6) max = 1;
    else if (nominalDepth >= 8 && nominalDepth <= 10) max = 2;
    else if (nominalDepth >= 12 && nominalDepth <= 14) max = 3;
    else if (nominalDepth === 16) max = 4;
    else if (nominalDepth === 18) max = 5;
    else if (nominalDepth === 21) max = 6;
    else if (nominalDepth === 24) max = 7;
    else if (nominalDepth === 27) max = 8;
    else if (nominalDepth === 30) max = 9;
    else if (nominalDepth >= 33 && nominalDepth <= 36) max = 10;

    // Handle W40+ if necessary, but table stops at 36. 
    // We will return values if min > 0 to indicate valid range.
    if (min > 0) return { min, max };
    return null;
};
