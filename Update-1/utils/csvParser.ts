import { AISCShape, ShapeType } from '../types/aisc';

export const SHAPE_FILES = [
    { type: 'W', file: 'W_shapes.csv' },
    { type: 'C', file: 'C_shapes.csv' },
    { type: 'L', file: 'L_shapes.csv' },
    { type: 'HSS_Rect', file: 'HSS_shapes.csv' },
    { type: 'HSS_Round', file: 'HSS_R_shapes.csv' },
    { type: 'PIPE', file: 'PIPE_shapes.csv' },
    { type: 'WT', file: 'WT_shapes.csv' },
    { type: 'M', file: 'M_shapes.csv' },
    { type: 'S', file: 'S_shapes.csv' },
    { type: 'HP', file: 'HP_shapes.csv' },
    { type: 'MC', file: 'MC_shapes.csv' },
];

export const parseCSV = (csvText: string, type: ShapeType): AISCShape[] => {

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const shapes: AISCShape[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        // Relaxed check: allow empty trailing columns, but need at least name
        if (values.length < 2) continue;

        const shape: any = { type, name: values[0] }; // Assumes first column is always shape name

        headers.forEach((header, index) => {
            if (index === 0) return; // Skip name, already set

            const value = values[index];
            // Convert numeric values, keep strings if needed (though most are numbers)
            // Handle special characters or "–" (en-dash) which might be in CSV
            if (value && value !== '–' && value !== '-' && !isNaN(Number(value))) {
                shape[header] = Number(value);
            } else if (value) {
                // Keep as string if it's not a number but exists (e.g. might be useful for notes, though our interface uses numbers for props)
                // For now, if expected number is text, we might skip or store elsewhere. 
                // But our interface specifically defined optional numbers.
                // Let's try to map specific known columns that might be loose.
                // For now, we only strictly parse numbers.
            }
        });

        // Normalization logic
        // Map specific CSV headers to our unified interface if names differ slightly
        // logic based on reviewed CSVs:
        // W_shapes: k, k1 -> kdet, kdes. 
        // Wait, earlier view_file showed: k, k1. 
        // Usually k = k_des, k1 = k_det in some datasets, or vice versa. 
        // Verification from AISC Manual: 
        // k = design distance, k_det = detail distance.
        // In many CSVs: 'k' is design. 
        // Let's map 'k1' to 'kdet' if it exists, 'k' to 'kdes'.

        // Actually, looking at W_shapes.csv header from view_file:
        // shape,weight,area,d,bf,tw,tf,k,k1,T,WGi,WGo

        if (shape.k1 !== undefined) {
            shape.kdet = shape.k1;
        }
        if (shape.k !== undefined) {
            shape.kdes = shape.k;
        }

        // HSS: Ht is height, B is width. 

        shapes.push(shape as AISCShape);
    }

    return shapes;
};

export const fetchAndParseShape = async (fileName: string, type: ShapeType): Promise<AISCShape[]> => {
    try {
        const response = await fetch(`/shapes/${fileName}`);
        if (!response.ok) {
            console.error(`Failed to fetch ${fileName}`);
            return [];
        }
        const text = await response.text();
        return parseCSV(text, type);
    } catch (error) {
        console.error(`Error loading ${fileName}:`, error);
        return [];
    }
}



export const loadAllShapes = async (): Promise<AISCShape[]> => {
    let allShapes: AISCShape[] = [];
    // We can run in parallel
    const promises = SHAPE_FILES.map(item => fetchAndParseShape(item.file, item.type as ShapeType));
    const results = await Promise.all(promises);
    results.forEach(shapes => {
        allShapes = [...allShapes, ...shapes];
    });
    return allShapes;
};
