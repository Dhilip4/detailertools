import React from 'react';
import { AISCShape } from '../../types/aisc';
import { CrossSection } from './CrossSection';
import { Info, Ruler, Weight } from 'lucide-react';

interface ShapeViewerProps {
    shape: AISCShape | null;
}

export const ShapeViewer: React.FC<ShapeViewerProps> = ({ shape }) => {
    if (!shape) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-12 aisc-panel">
                <Info className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">Select a shape to view details</p>
            </div>
        );
    }

    // Helper to render property row with unit
    const PropertyRow = ({ label, value, unit, desc }: { label: string, value: any, unit?: string, desc?: string }) => (
        <div className="aisc-data-row">
            <div className="flex flex-col">
                <span className="text-gray-400 font-mono text-sm">{label}</span>
                {desc && <span className="text-xs text-gray-600">{desc}</span>}
            </div>
            <div className="text-right">
                <span className="text-white font-bold">{value !== undefined ? value : '-'}</span>
                {unit && value !== undefined && <span className="text-gray-500 text-xs ml-1">{unit}</span>}
            </div>
        </div>
    );

    return (
        <div className="grid lg:grid-cols-2 gap-6 h-full overflow-hidden">
            {/* Left: Visual */}
            <div className="aisc-panel flex flex-col min-h-0 overflow-hidden">
                {/* Header */}
                <div className="aisc-panel-header flex justify-between items-center">
                    <h2 className="text-xl font-black text-white">{shape.name}</h2>
                    <span className="aisc-badge">
                        {shape.type} Shape
                    </span>
                </div>

                {/* Visual Area */}
                <div className="flex-1 flex items-center justify-center min-h-0 p-2">
                    <div className="aisc-visual-box p-2 w-full h-full flex items-center justify-center">
                        <CrossSection shape={shape} width={380} height={380} />
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="aisc-stats-footer flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-[#76b900]" />
                        <span>{shape.weight} lb/ft</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#76b900]" />
                        <span>A = {shape.area} in²</span>
                    </div>
                </div>
            </div>

            {/* Right: Data Table */}
            <div className="aisc-panel flex flex-col min-h-0 overflow-hidden">
                {/* Header */}
                <div className="aisc-panel-header">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#76b900]" />
                        Engineering Properties
                    </h3>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                    {/* Dimensions Section */}
                    <div>
                        <h4 className="aisc-section-title">Dimensions</h4>
                        <div className="space-y-1">
                            {shape.d !== undefined && <PropertyRow label="d" desc="Depth / Leg" value={shape.d} unit="in" />}
                            {shape.b !== undefined && <PropertyRow label="b" desc="Leg Width" value={shape.b} unit="in" />}
                            {shape.bf !== undefined && <PropertyRow label="bf" desc="Flange Width" value={shape.bf} unit="in" />}
                            {shape.tw !== undefined && <PropertyRow label="tw" desc="Web Thickness" value={shape.tw} unit="in" />}
                            {shape.tf !== undefined && <PropertyRow label="tf" desc="Flange Thickness" value={shape.tf} unit="in" />}
                            {shape.t !== undefined && <PropertyRow label="t" desc="Thickness" value={shape.t} unit="in" />}
                            {shape.tnom !== undefined && <PropertyRow label="tnom" desc="Nominal Thickness" value={shape.tnom} unit="in" />}
                            {shape.tdes !== undefined && <PropertyRow label="tdes" desc="Design Thickness" value={shape.tdes} unit="in" />}
                            {shape.OD !== undefined && <PropertyRow label="OD" desc="Outer Diameter" value={shape.OD} unit="in" />}
                            {shape.ID !== undefined && <PropertyRow label="ID" desc="Inner Diameter" value={shape.ID} unit="in" />}
                            {shape.Ht !== undefined && <PropertyRow label="Ht" desc="Height" value={shape.Ht} unit="in" />}
                            {shape.B !== undefined && <PropertyRow label="B" desc="Width" value={shape.B} unit="in" />}
                        </div>
                    </div>

                    {/* Detailing Section */}
                    <div>
                        <h4 className="aisc-section-title">Detailing</h4>
                        <div className="space-y-1">
                            {(shape.kdes || shape.k) !== undefined && <PropertyRow label="k (des)" desc="Design fillet" value={shape.kdes || shape.k} unit="in" />}
                            {shape.kdet !== undefined && <PropertyRow label="k (det)" desc="Detailing fillet" value={shape.kdet} unit="in" />}
                            {shape.T !== undefined && <PropertyRow label="T" desc="T Dimension" value={shape.T} unit="in" />}
                            {shape.WGi !== undefined && <PropertyRow label="WGi" desc="Workable Gage (Inner)" value={shape.WGi} unit="in" />}
                            {shape.WGo !== undefined && <PropertyRow label="WGo" desc="Workable Gage (Outer)" value={shape.WGo} unit="in" />}
                        </div>
                    </div>

                    {/* Section Properties */}
                    <div>
                        <h4 className="aisc-section-title">Properties (Strong Axis X-X)</h4>
                        <div className="space-y-1">
                            {shape.Ix !== undefined && <PropertyRow label="Ix" desc="Moment of Inertia" value={shape.Ix} unit="in⁴" />}
                            {shape.Zx !== undefined && <PropertyRow label="Zx" desc="Plastic Modulus" value={shape.Zx} unit="in³" />}
                            {shape.Sx !== undefined && <PropertyRow label="Sx" desc="Elastic Modulus" value={shape.Sx} unit="in³" />}
                            {shape.rx !== undefined && <PropertyRow label="rx" desc="Radius of Gyration" value={shape.rx} unit="in" />}
                        </div>
                    </div>

                    {/* Weak Axis */}
                    <div>
                        <h4 className="aisc-section-title">Properties (Weak Axis Y-Y)</h4>
                        <div className="space-y-1">
                            {shape.Iy !== undefined && <PropertyRow label="Iy" desc="Moment of Inertia" value={shape.Iy} unit="in⁴" />}
                            {shape.Zy !== undefined && <PropertyRow label="Zy" desc="Plastic Modulus" value={shape.Zy} unit="in³" />}
                            {shape.Sy !== undefined && <PropertyRow label="Sy" desc="Elastic Modulus" value={shape.Sy} unit="in³" />}
                            {shape.ry !== undefined && <PropertyRow label="ry" desc="Radius of Gyration" value={shape.ry} unit="in" />}
                        </div>
                    </div>

                    {/* Geometry/Centroid */}
                    <div>
                        <h4 className="aisc-section-title">Geometry & Centroid</h4>
                        <div className="space-y-1">
                            {shape.x !== undefined && <PropertyRow label="x" desc="Centroid X" value={shape.x} unit="in" />}
                            {shape.y !== undefined && <PropertyRow label="y" desc="Centroid Y" value={shape.y} unit="in" />}
                            {shape.xp !== undefined && <PropertyRow label="xp" desc="Plastic Neutral Axis X" value={shape.xp} unit="in" />}
                            {shape.yp !== undefined && <PropertyRow label="yp" desc="Plastic Neutral Axis Y" value={shape.yp} unit="in" />}
                            {shape.eo !== undefined && <PropertyRow label="eo" desc="Shear Center" value={shape.eo} unit="in" />}
                        </div>
                    </div>

                    {/* Torsional Properties */}
                    <div>
                        <h4 className="aisc-section-title">Torsional & Flexural Properties</h4>
                        <div className="space-y-1">
                            {shape.J !== undefined && <PropertyRow label="J" desc="Torsional Constant" value={shape.J} unit="in⁴" />}
                            {shape.Cw !== undefined && <PropertyRow label="Cw" desc="Warping Constant" value={shape.Cw} unit="in⁶" />}
                            {shape.C !== undefined && <PropertyRow label="C" desc="Torsional Constant" value={shape.C} unit="in³" />}
                            {shape.ro !== undefined && <PropertyRow label="ro" desc="Polar Radius of Gyration" value={shape.ro} unit="in" />}
                            {shape.H !== undefined && <PropertyRow label="H" desc="Flexural Constant" value={shape.H} />}
                            {shape.rts !== undefined && <PropertyRow label="rts" desc="Effective Radius of Gyration" value={shape.rts} unit="in" />}
                            {shape.ho !== undefined && <PropertyRow label="ho" desc="Flange Centroid Distance" value={shape.ho} unit="in" />}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
