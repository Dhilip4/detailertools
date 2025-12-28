export type BoltDiameter =
    | "1/2"
    | "5/8"
    | "3/4"
    | "7/8"
    | "1"
    | "1-1/8"
    | "1-1/4"
    | "1-3/8"
    | "1-1/2";

export interface BoltClearance {
    diameter: BoltDiameter;
    decimalDiameter: number;
    C1: number; // Entering Clearance (in) - Approximate standard
    C2: number; // Tightening Clearance (in) - Approximate standard
}

export interface HoleDimensions {
    diameter: BoltDiameter;
    standard: number;      // d + 1/16
    oversized: number;     // d + 3/16 (varies)
    shortSlotWidth: number; // d + 1/16
    shortSlotLength: number; // d + 3/8 (varies)
    longSlotWidth: number; // d + 1/16
    longSlotLength: number; // 2.5 * d (varies)
}

export interface EdgeDistances {
    diameter: BoltDiameter;
    atShearedEdge: number;
    atRolledEdge: number;
}
