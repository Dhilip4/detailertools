import { AISCShape } from '../types/aisc';
import { toFraction } from './format';

export interface WeldSize {
    decimal: number;
    fraction: string;
    note?: string;
}

export interface CopeDimensions {
    dc: number; // Depth
    lc: number; // Length
    radius: number;
    warnings: string[];
}

// Table J2.4 - Minimum Fillet Weld Size
export const getMinFilletWeld = (thinnerPartThickness: number): WeldSize => {
    let size = 0.3125; // Default > 3/4" -> 5/16"
    if (thinnerPartThickness <= 0.25) size = 0.125; // 1/8"
    else if (thinnerPartThickness <= 0.5) size = 0.1875; // 3/16"
    else if (thinnerPartThickness <= 0.75) size = 0.25; // 1/4"

    return { decimal: size, fraction: toFraction(size) };
};

// Section J2.2b - Maximum Fillet Weld Size
export const getMaxFilletWeld = (edgeThickness: number): WeldSize => {
    if (edgeThickness < 0.25) {
        return {
            decimal: edgeThickness,
            fraction: toFraction(edgeThickness),
            note: "Full thickness allowed (J2.2b)"
        };
    }
    const max = edgeThickness - 0.0625; // t - 1/16"
    return {
        decimal: max,
        fraction: toFraction(max),
        note: "t - 1/16\" (J2.2b)"
    };
};

// Beam Cope Calculation (Manual Part 9)
export const calculateCope = (
    filler: AISCShape,
    girder: AISCShape,
    clearance: number = 0.5,
    radius: number = 0.5
): CopeDimensions => {
    const warnings: string[] = [];

    // Girder properties
    // k is typically Design k. Detailing k is usually used for clearance checks.
    // If Detailing k is not available, Design k + tolerance is standard.
    const k_girder = girder.k;

    // Top Cope Depth (dc)
    // Must clear girder fillet.
    // Logic: dc >= k + clearance
    const min_dc = k_girder + clearance;

    // Cope Length (lc)
    // Must extend beyond flange to ensure easy erection.
    // Logic: Distance from web face to interaction point + clearance
    const webFaceToEdge = (girder.bf - girder.tw) / 2;
    const min_lc = webFaceToEdge + clearance;

    // Checks
    if (min_dc > filler.d / 2) {
        warnings.push(`Deep Cope Warning: Cope depth (${toFraction(min_dc)}) exceeds 50% of beam depth.`);
    }

    if (radius < 0.5) {
        warnings.push("Sharp Re-entrant Corner: Minimum radius of 1/2\" recommended.");
    }

    return {
        dc: min_dc,
        lc: min_lc,
        radius,
        warnings
    };
};
