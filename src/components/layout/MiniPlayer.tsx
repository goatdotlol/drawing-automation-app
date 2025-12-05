import { Maximize2, Play, Square, Activity } from 'lucide-react';
import { Button } from '../ui/Button';

interface MiniPlayerProps {
    onExpand: () => void;
    isDrawing: boolean;
    onStart: () => void;
    onStop: () => void;
}

export function MiniPlayer({ onExpand, isDrawing, onStart, onStop }: MiniPlayerProps) {
    return (
        <div className="h-full flex flex-col bg-background border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
            {/* Header / Drag Region */}
            <div
                data-tauri-drag-region
                className="h-8 bg-surface border-b border-gray-700 flex items-center justify-between px-3 select-none"
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <Activity className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-text-muted">SawBot Mini</span>
                </div>
                <button
                    onClick={onExpand}
                    className="p-1 hover:bg-gray-700 rounded text-text-muted hover:text-white transition-colors"
                    title="Expand"
                >
                    <Maximize2 className="w-3 h-3" />
                </button>
            </div>

            {/* Controls */}
            <div className="flex-1 p-4 flex items-center justify-center gap-4 bg-background/50 backdrop-blur-sm">
                {!isDrawing ? (
                    <Button
                        onClick={onStart}
                        className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20"
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Start
                    </Button>
                ) : (
                    <Button
                        onClick={onStop}
                        className="w-full h-12 text-lg font-medium bg-error hover:bg-red-600 shadow-lg shadow-error/20"
                    >
                        <Square className="w-5 h-5 mr-2 fill-current" />
                        Stop
                    </Button>
                )}
            </div>
        </div>
    );
}
