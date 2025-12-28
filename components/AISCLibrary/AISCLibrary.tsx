import React, { useState, useEffect } from 'react';
import { Database, Layers } from 'lucide-react';
import { AISCShape, ShapeType } from '../../types/aisc';
import { fetchAndParseShape } from '../../utils/csvParser';
import { ShapeViewer } from './ShapeViewer';

const SHAPE_TYPES: { type: ShapeType; label: string; file: string }[] = [
    { type: 'W', label: 'W Shapes (Wide Flange)', file: 'W_shapes.csv' },
    { type: 'C', label: 'C Shapes (Channels)', file: 'C_shapes.csv' },
    { type: 'L', label: 'L Shapes (Angles)', file: 'L_shapes.csv' },
    { type: 'HSS_Rect', label: 'HSS (Rectangular)', file: 'HSS_shapes.csv' },
    { type: 'HSS_Round', label: 'HSS (Round)', file: 'HSS_R_shapes.csv' },
    { type: 'PIPE', label: 'Pipe', file: 'PIPE_shapes.csv' },
    { type: 'WT', label: 'WT (Structural Tees)', file: 'WT_shapes.csv' },
    { type: 'M', label: 'M Shapes', file: 'M_shapes.csv' },
    { type: 'S', label: 'S Shapes (American Standard)', file: 'S_shapes.csv' },
    { type: 'HP', label: 'HP Shapes (Piles)', file: 'HP_shapes.csv' },
    { type: 'MC', label: 'MC Shapes', file: 'MC_shapes.csv' },
];

export const AISCLibrary: React.FC = () => {
    const [selectedType, setSelectedType] = useState<ShapeType>('W');
    const [searchQuery, setSearchQuery] = useState('');
    const [shapes, setShapes] = useState<AISCShape[]>([]);
    const [selectedShape, setSelectedShape] = useState<AISCShape | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadShapes = async () => {
            setLoading(true);
            const typeInfo = SHAPE_TYPES.find(t => t.type === selectedType);
            if (typeInfo) {
                const loadedShapes = await fetchAndParseShape(typeInfo.file, selectedType);

                // Natural numeric sort: W8 before W10, W10X100 before W10X12
                const naturalSort = (a: AISCShape, b: AISCShape) => {
                    // Extract parts: prefix letters and numbers
                    const parseShape = (name: string) => {
                        const match = name.match(/^([A-Za-z]+)(\d+\.?\d*)X?(\d+\.?\d*)?/);
                        if (!match) return { prefix: name, depth: 0, weight: 0 };
                        return {
                            prefix: match[1],
                            depth: parseFloat(match[2]) || 0,
                            weight: parseFloat(match[3]) || 0
                        };
                    };

                    const pa = parseShape(a.name);
                    const pb = parseShape(b.name);

                    // First sort by prefix
                    if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
                    // Then by depth (numeric)
                    if (pa.depth !== pb.depth) return pa.depth - pb.depth;
                    // Then by weight (numeric)
                    return pa.weight - pb.weight;
                };

                const sortedShapes = loadedShapes.sort(naturalSort);
                setShapes(sortedShapes);
                if (sortedShapes.length > 0) {
                    setSelectedShape(sortedShapes[0]);
                }
            }
            setLoading(false);
        };
        loadShapes();
    }, [selectedType]);

    const filteredShapes = shapes.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col md:h-[calc(100vh-120px)] md:max-h-[850px] h-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#76b900]/20 border border-[#76b900]/30">
                            <Database className="w-7 h-7 text-[#76b900]" />
                        </div>
                        AISC Digital Library
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 ml-14">AISC Shapes Database (v16.0)</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5 flex-1 md:min-h-0 md:overflow-hidden h-auto">
                {/* Sidebar: Filters & List */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-4 md:min-h-0 md:overflow-hidden h-auto">

                    {/* Type Selector */}
                    <div className="aisc-panel p-4 flex-shrink-0">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <Layers className="w-3 h-3 text-[#76b900]" />
                            Shape Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as ShapeType)}
                            className="aisc-select w-full"
                        >
                            {SHAPE_TYPES.map(t => (
                                <option key={t.type} value={t.type}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Shape List */}
                    <div className="aisc-panel flex flex-col md:overflow-hidden md:flex-1 md:min-h-0 h-96">
                        {/* Filter */}
                        <div className="p-3 border-b border-white/5 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Filter shapes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="aisc-input w-full"
                            />
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 p-2 custom-scrollbar min-h-0">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="inline-block w-6 h-6 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <p className="text-sm">Loading shapes...</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredShapes.map(shape => (
                                        <button
                                            key={shape.name}
                                            onClick={() => setSelectedShape(shape)}
                                            className={`aisc-shape-item w-full text-left ${selectedShape?.name === shape.name ? 'selected' : ''
                                                }`}
                                        >
                                            {shape.name}
                                        </button>
                                    ))}
                                    {filteredShapes.length === 0 && (
                                        <div className="text-center py-8 text-gray-600 text-sm">No shapes found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="aisc-stats-footer flex-shrink-0">
                            {filteredShapes.length} shapes available
                        </div>
                    </div>
                </div>

                {/* Main Content: Viewer */}
                <div className="col-span-12 md:col-span-9 md:min-h-0 md:overflow-hidden h-auto">
                    <ShapeViewer shape={selectedShape} />
                </div>
            </div>
        </div>
    );
};
