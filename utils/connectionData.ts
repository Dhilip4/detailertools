import { BoltDiameter, BoltClearance, HoleDimensions, EdgeDistances } from '../types/connection';

export const BOLT_DIAMETERS: BoltDiameter[] = [
    "1/2", "5/8", "3/4", "7/8", "1", "1-1/8", "1-1/4", "1-3/8", "1-1/2"
];

// Table J3.3 - Nominal Hole Dimensions
export const HOLE_DIMENSIONS: Record<BoltDiameter, HoleDimensions> = {
    "1/2": { diameter: "1/2", standard: 9 / 16, oversized: 5 / 8, shortSlotWidth: 9 / 16, shortSlotLength: 11 / 16, longSlotWidth: 9 / 16, longSlotLength: 1.25 },
    "5/8": { diameter: "5/8", standard: 11 / 16, oversized: 13 / 16, shortSlotWidth: 11 / 16, shortSlotLength: 7 / 8, longSlotWidth: 11 / 16, longSlotLength: 1.5625 },
    "3/4": { diameter: "3/4", standard: 13 / 16, oversized: 15 / 16, shortSlotWidth: 13 / 16, shortSlotLength: 1, longSlotWidth: 13 / 16, longSlotLength: 1.875 },
    "7/8": { diameter: "7/8", standard: 15 / 16, oversized: 1.0625, shortSlotWidth: 15 / 16, shortSlotLength: 1.125, longSlotWidth: 15 / 16, longSlotLength: 2.1875 },
    "1": { diameter: "1", standard: 1.125, oversized: 1.25, shortSlotWidth: 1.0625, shortSlotLength: 1.3125, longSlotWidth: 1.0625, longSlotLength: 2.5 },
    "1-1/8": { diameter: "1-1/8", standard: 1.25, oversized: 1.4375, shortSlotWidth: 1.1875, shortSlotLength: 1.5, longSlotWidth: 1.1875, longSlotLength: 2.8125 },
    "1-1/4": { diameter: "1-1/4", standard: 1.375, oversized: 1.5625, shortSlotWidth: 1.3125, shortSlotLength: 1.625, longSlotWidth: 1.3125, longSlotLength: 3.125 },
    "1-3/8": { diameter: "1-3/8", standard: 1.5, oversized: 1.6875, shortSlotWidth: 1.4375, shortSlotLength: 1.75, longSlotWidth: 1.4375, longSlotLength: 3.4375 },
    "1-1/2": { diameter: "1-1/2", standard: 1.625, oversized: 1.8125, shortSlotWidth: 1.5625, shortSlotLength: 1.875, longSlotWidth: 1.5625, longSlotLength: 3.75 },
};

// Table J3.4 - Minimum Edge Distance (Values for Sheared and Rolled Edges)
export const EDGE_DISTANCES: Record<BoltDiameter, EdgeDistances> = {
    "1/2": { diameter: "1/2", atShearedEdge: 0.875, atRolledEdge: 0.75 },
    "5/8": { diameter: "5/8", atShearedEdge: 1.125, atRolledEdge: 0.875 },
    "3/4": { diameter: "3/4", atShearedEdge: 1.25, atRolledEdge: 1.0 },
    "7/8": { diameter: "7/8", atShearedEdge: 1.5, atRolledEdge: 1.125 },
    "1": { diameter: "1", atShearedEdge: 1.75, atRolledEdge: 1.25 },
    "1-1/8": { diameter: "1-1/8", atShearedEdge: 2.0, atRolledEdge: 1.5 },
    "1-1/4": { diameter: "1-1/4", atShearedEdge: 2.25, atRolledEdge: 1.625 },
    "1-3/8": { diameter: "1-3/8", atShearedEdge: 2.375, atRolledEdge: 1.75 },
    "1-1/2": { diameter: "1-1/2", atShearedEdge: 2.625, atRolledEdge: 1.875 },
};

// Table 7-15 - Entering and Tightening Clearances (Estimated standard values)
// C1 = Entering Clearance, C2 = Tightening Clearance
export const BOLT_CLEARANCES: Record<BoltDiameter, BoltClearance> = {
    "1/2": { diameter: "1/2", decimalDiameter: 0.5, C1: 0.94, C2: 1.5 },
    "5/8": { diameter: "5/8", decimalDiameter: 0.625, C1: 1.06, C2: 1.5 },
    "3/4": { diameter: "3/4", decimalDiameter: 0.75, C1: 1.25, C2: 1.8 }, // Commonly 1-1/4 and 1-3/4+
    "7/8": { diameter: "7/8", decimalDiameter: 0.875, C1: 1.38, C2: 2.0 },
    "1": { diameter: "1", decimalDiameter: 1.0, C1: 1.56, C2: 2.25 },
    "1-1/8": { diameter: "1-1/8", decimalDiameter: 1.125, C1: 1.69, C2: 2.5 },
    "1-1/4": { diameter: "1-1/4", decimalDiameter: 1.25, C1: 1.81, C2: 2.75 },
    "1-3/8": { diameter: "1-3/8", decimalDiameter: 1.375, C1: 1.94, C2: 3.0 },
    "1-1/2": { diameter: "1-1/2", decimalDiameter: 1.5, C1: 2.06, C2: 3.25 },
};
