import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Activity, PenTool, Zap, MousePointer2, Layers } from 'lucide-react';
import { cn } from '../ui/Button';

interface DrawingMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    speed: string;
}

const methods: DrawingMethod[] = [
    {
        id: 'matrix',
        name: 'Matrix Dot',
        description: 'Fast scanning with dot placement. Best for high contrast images.',
        icon: Grid,
        speed: 'Fast'
    },
    {
        id: 'dithering',
        name: 'Floyd-Steinberg',
        description: 'Error diffusion for high-quality shading and gradients.',
        icon: Activity,
        speed: 'Medium'
    },
    {
        id: 'continuous',
        name: 'Continuous Line',
        description: 'Single continuous line drawing. Artistic and organic look.',
        icon: PenTool,
        speed: 'Slow'
    },
    {
        id: 'spiral',
        name: 'Spiral Raster',
        description: 'Draws from center outward in a spiral pattern.',
        icon: Zap,
        speed: 'Medium'
    },
    {
        id: 'stippling',
        name: 'Stippling',
        description: 'Varying dot density for realistic shading.',
        icon: MousePointer2,
        speed: 'Slow'
    },
    {
        id: 'contour',
        name: 'Contour/Vector',
        description: 'Traces outlines and fills shapes.',
        icon: Layers,
        speed: 'Variable'
    }
];

interface DrawingMethodSelectorProps {
    selectedMethod: string;
    onSelect: (methodId: string) => void;
}

export function DrawingMethodSelector({ selectedMethod, onSelect }: DrawingMethodSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
                <button
                    key={method.id}
                    onClick={() => onSelect(method.id)}
                    className={cn(
                        "relative p-4 rounded-xl border text-left transition-all duration-200 group overflow-hidden",
                        selectedMethod === method.id
                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                            : "bg-surface border-gray-700 hover:border-gray-600 hover:bg-gray-700/30"
                    )}
                >
                    <div className="flex items-start gap-4 relative z-10">
                        <div className={cn(
                            "p-3 rounded-lg transition-colors",
                            selectedMethod === method.id ? "bg-primary text-white" : "bg-gray-800 text-gray-400 group-hover:text-white"
                        )}>
                            <method.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={cn(
                                    "font-semibold transition-colors",
                                    selectedMethod === method.id ? "text-white" : "text-gray-200"
                                )}>
                                    {method.name}
                                </h3>
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    selectedMethod === method.id ? "bg-primary text-white" : "bg-gray-800 text-gray-400"
                                )}>
                                    {method.speed}
                                </span>
                            </div>
                            <p className="text-sm text-text-muted leading-snug">
                                {method.description}
                            </p>
                        </div>
                    </div>

                    {selectedMethod === method.id && (
                        <motion.div
                            layoutId="active-glow"
                            className="absolute inset-0 bg-primary/5 pointer-events-none"
                            initial={false}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
