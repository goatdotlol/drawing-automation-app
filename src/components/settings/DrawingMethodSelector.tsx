import { Grid, Activity, PenTool, Zap, MousePointer2, Layers, Sparkles, Radar } from 'lucide-react';
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
        description: 'Fast row scanning with dot placement. Best for high contrast.',
        icon: Grid,
        defaultSpeed: 1,
        minSpeed: 0,
        maxSpeed: 50
    },
    {
        id: 'dithering',
        name: 'Floyd-Steinberg',
        description: 'Error diffusion dithering for smooth gradients.',
        icon: Activity,
        defaultSpeed: 2,
        minSpeed: 0,
        maxSpeed: 50
    },
    {
        id: 'continuous',
        name: 'Continuous Line',
        description: 'Single continuous serpentine path. Organic look.',
        icon: PenTool,
        defaultSpeed: 2,
        minSpeed: 0,
        maxSpeed: 50
    },
    {
        id: 'spiral',
        name: 'Spiral Raster',
        description: 'Spirals outward from center using polar coordinates.',
        icon: Radar,
        defaultSpeed: 1,
        minSpeed: 0,
        maxSpeed: 50
    },
    {
        id: 'stippling',
        name: 'Stippling',
        description: 'Variable density dots based on brightness. No scanning.',
        icon: Sparkles,
        defaultSpeed: 10,
        minSpeed: 0,
        maxSpeed: 50
    },
    {
        id: 'contour',
        name: 'Contour',
        description: 'Canny edge detection. Traces detected edges only.',
        icon: Layers,
        defaultSpeed: 2,
        minSpeed: 0,
        maxSpeed: 50
    },
    {
        id: 'human',
        name: 'Human/Outline',
        description: 'Edge tracing with optimized path. Sketch-like.',
        icon: MousePointer2,
        defaultSpeed: 2,
        minSpeed: 0,
        maxSpeed: 50
    }
];

interface DrawingMethodSelectorProps {
    selectedMethod: string;
    onSelect: (methodId: string) => void;
}

export function DrawingMethodSelector({ selectedMethod, onSelect }: DrawingMethodSelectorProps) {
    const methodSpeeds = useSettingsStore((state) => state.methodSpeeds);
    const setMethodSpeed = useSettingsStore((state) => state.setMethodSpeed);

    // Get speed for selected method (fallback to default)
    const getSpeed = (methodId: string) => {
        const method = methods.find(m => m.id === methodId);
        return methodSpeeds[methodId] ?? method?.defaultSpeed ?? 1;
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2" >
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    const speed = getSpeed(method.id);

                    return (
                        <div
                            key={method.id}
                            className={cn(
                                'group relative p-4 rounded-lg border-2 transition-all cursor-pointer',
                                'hover:border-primary/50 hover:shadow-md hover:shadow-primary/10',
                                isSelected
                                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                    : 'border-border bg-surface'
                            )}
                            onClick={() => onSelect(method.id)}
                        >
                            {/* Icon */}
                            <div className={cn(
                                'mb-3 flex items-center justify-center w-12 h-12 rounded-lg transition-colors',
                                isSelected
                                    ? 'bg-primary text-white'
                                    : 'bg-background text-text-muted group-hover:bg-primary/20 group-hover:text-primary'
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>

                            {/* Name & Description */}
                            <h3 className={cn(
                                'text-base font-semibold mb-1',
                                isSelected ? 'text-primary' : 'text-white'
                            )}>
                                {method.name}
                            </h3>
                            <p className="text-xs text-text-muted mb-4">
                                {method.description}
                            </p>

                            {/* Speed Control - Only shown when selected */}
                            {isSelected && (
                                <div className="mt-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                                    <label className="text-xs text-text-muted font-medium mb-2 block">
                                        Speed: {speed}ms (0 = fastest)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={method.minSpeed}
                                            max={method.maxSpeed}
                                            value={speed}
                                            onChange={(e) => setMethodSpeed(method.id, parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-background rounded-lg appearance-none cursor-pointer
                                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                                                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                                                hover:[&::-webkit-slider-thumb]:bg-blue-400 transition-all"
                                        />
                                        <input
                                            type="number"
                                            min={method.minSpeed}
                                            max={method.maxSpeed}
                                            value={speed}
                                            onChange={(e) => setMethodSpeed(method.id, parseInt(e.target.value) || method.minSpeed)}
                                            className="w-16 px-2 py-1 bg-background border border-border rounded text-xs text-white text-center
                                                focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
