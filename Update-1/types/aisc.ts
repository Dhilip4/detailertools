export interface AISCShape {
  type: 'W' | 'M' | 'S' | 'HP' | 'C' | 'MC' | 'L' | 'HSS_Rect' | 'HSS_Round' | 'PIPE' | 'WT' | 'MT' | 'ST' | '2L';
  name: string;
  weight: number; // lb/ft
  area: number; // in^2

  // Dimensions
  d?: number; // Depth (in)
  bf?: number; // Flange width (in)
  tw?: number; // Web thickness (in)
  tf?: number; // Flange thickness (in)
  kdes?: number; // Distance from outer face to web toe of fillet (design)
  kdet?: number; // Distance from outer face to web toe of fillet (detail)
  k?: number; // Generic k for shapes where kdes/kdet distinction isn't made

  // Specific to Angles
  b?: number; // Leg width (in) - for unequal angles
  t?: number; // Thickness (in)

  // Specific to HSS/Pipe
  Ht?: number; // Height (in)
  B?: number; // Width (in)
  tnom?: number; // Nominal wall thickness
  tdes?: number; // Design wall thickness
  OD?: number; // Outer Diameter (Round HSS/Pipe)
  ID?: number; // Inner Diameter (Pipe)

  // Detailing Dimensions
  T?: number; // Distance between fillets (in)
  WGi?: number; // Workable Gage (inner)
  WGo?: number; // Workable Gage (outer)

  // Section Properties (common subset)
  Ix?: number;
  Zx?: number;
  Sx?: number;
  rx?: number;
  Iy?: number;
  Zy?: number;
  Sy?: number;
  ry?: number;

  // Centroid & Shear Center
  x?: number; // Centroid X
  y?: number; // Centroid Y
  xp?: number; // Plastic Neutral Axis X
  yp?: number; // Plastic Neutral Axis Y
  eo?: number; // Shear Center

  // Torsional
  J?: number; // Torsional Constant
  Cw?: number; // Warping Constant
  C?: number; // Torsional Constant (HSS)
  ro?: number; // Polar Radius of Gyration
  H?: number; // Flexural Constant
  rts?: number; // Effective Radius of Gyration
  ho?: number; // Distance between flange centroids
}

export type ShapeType = AISCShape['type'];
