import { Grid, Activity, PenTool, Zap, MousePointer2, Layers } from 'lucide-react';
import { cn } from '../ui/Button';
import { SpeedControl } from '../ui/SpeedControl';
import { useSettingsStore } from '../../stores/settingsStore';

interface DrawingMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    defaultSpeed: number;
    minSpeed: number;
    maxSpeed: number;
}

const methods: DrawingMethod[] = [
    {
        id: 'matrix',
        name: 'Matrix Dot',
        description: 'Fast scanning with dot placement. Best for high contrast images.',
        icon: Grid,
        defaultSpeed: 1000,
        minSpeed: 100,
        maxSpeed: 3000
    },
    {
        id: 'dithering',
        name: 'Floyd-Steinberg',
        description: 'Error diffusion for high-quality shading and gradients.',
        icon: Activity,
        defaultSpeed: 1200,
        minSpeed: 200,
        maxSpeed: 4000
    },
    {
        id: 'continuous',
        name: 'Continuous Line',
        description: 'Single continuous line drawing. Artistic and organic look.',
        icon: PenTool,
        defaultSpeed: 2000,
        minSpeed: 500,
        maxSpeed: 5000
    },
    {
        id: 'spiral',
        name: 'Spiral Raster',
        description: 'Draws from center outward in a spiral pattern.',
        icon: Zap,
        defaultSpeed: 800,
        minSpeed: 100,
        maxSpeed: 2500
    },
    {
        id: 'stippling',
        name: 'Stippling',
        description: 'Varying dot density for realistic shading.',
        icon: MousePointer2,
        defaultSpeed: 1500,
        minSpeed: 300,
        maxSpeed: 4000
    },
    {
        id: 'contour',
        name: 'Contour/Vector',
        description: 'Traces outlines and fills shapes.',
        icon: Layers,
        defaultSpeed: 1000,
        minSpeed: 200,
        maxSpeed: 3500
    }
];

interface DrawingMethodSelectorProps {
    selectedMethod: string;
    onSelect: (methodId: string) => void;
}

export function DrawingMethodSelector({ selectedMethod, onSelect }: DrawingMethodSelectorProps) {
    const methodSpeeds = useSettingsStore((state) => state.methodSpeeds);
    const setMethodSpeed = useSettingsStore((state) => state.setMethodSpeed);

    const selectedMethodData = methods.find((m) => m.id === selectedMethod);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {methods.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => onSelect(method.id)}
                        className={cn(
                            "relative p-4 rounded-xl border text-left transition-all duration-200 group",
                            selectedMethod === method.id
                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                : "bg-surface border-border hover:border-gray-600 hover:bg-gray-700/30"
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-3 rounded-lg transition-colors",
                                selectedMethod === method.id ? "bg-primary text-white" : "bg-gray-800 text-gray-400 group-hover:text-white"
                            )}>
                                <method.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className={cn(
                                    "font-semibold transition-colors mb-1",
                                    selectedMethod === method.id ? "text-white" : "text-gray-200"
                                )}>
                                    {method.name}
                                </h3>
                                <p className="text-sm text-text-muted leading-snug">
                                    {method.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Speed Control for Selected Method */}
            {selectedMethodData && (
                <div className="p-4 bg-surface/50 rounded-lg border border-border">
                    <SpeedControl
                        value={methodSpeeds[selectedMethod] || selectedMethodData.defaultSpeed}
                        onChange={(speed) => setMethodSpeed(selectedMethod, speed)}
                        min={selectedMethodData.minSpeed}
                        max={selectedMethodData.maxSpeed}
                        label={`${selectedMethodData.name} Speed (ms)`}
                    />
                </div>
            )}
        </div>
    );
}
