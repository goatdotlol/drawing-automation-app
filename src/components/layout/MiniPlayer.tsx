import { Maximize2, Activity, Upload, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface MiniPlayerProps {
    onExpand: () => void;
    isDrawing: boolean;
    onStart: () => void;
    onStop: () => void;
    selectedMethod: string;
    onMethodChange: (method: string) => void;
    onUploadClick: () => void;
}

const methods = [
    { id: 'matrix', name: 'Matrix' },
    { id: 'dithering', name: 'Dither' },
    { id: 'continuous', name: 'Line' },
    { id: 'spiral', name: 'Spiral' },
    { id: 'stippling', name: 'Stipple' },
    { id: 'contour', name: 'Contour' }
];

export function MiniPlayer({
    onExpand,
    isDrawing,
    onStart,
    onStop,
    selectedMethod,
    onMethodChange,
    onUploadClick
}: MiniPlayerProps) {
    const [isPinned, setIsPinned] = useState(true); // Auto-pinned in mini mode
    const methodSpeeds = useSettingsStore((state) => state.methodSpeeds);
    const setMethodSpeed = useSettingsStore((state) => state.setMethodSpeed);

    const currentSpeed = methodSpeeds[selectedMethod] || 1000;

    // Auto-pin when mini mode is active
    useEffect(() => {
        const appWindow = getCurrentWindow();
        appWindow.setAlwaysOnTop(true);
        setIsPinned(true);

        return () => {
            // Cleanup if needed
        };
    }, []);

    const togglePin = async () => {
        const appWindow = getCurrentWindow();
        const newState = !isPinned;
        setIsPinned(newState);
        await appWindow.setAlwaysOnTop(newState);
    };

    const adjustSpeed = (delta: number) => {
        const newSpeed = Math.max(100, Math.min(5000, currentSpeed + delta));
        setMethodSpeed(selectedMethod, newSpeed);
    };

    return (
        <div className="h-full flex flex-col bg-background border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
            {/* Header / Drag Region */}
            <div
                data-tauri-drag-region
                className="h-8 bg-surface border-b border-gray-700 flex items-center justify-between px-2 select-none"
            >
                <div className="flex items-center gap-1.5 pointer-events-none">
                    <Activity className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-text-muted">SawBot Mini</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePin}
                        className={`p-1 rounded text-xs transition-colors ${isPinned ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700 text-text-muted hover:text-white'}`}
                        title={isPinned ? "Unpin" : "Pin on Top"}
                    >
                        📌
                    </button>
                    <button
                        onClick={onExpand}
                        className="p-1 hover:bg-gray-700 rounded text-text-muted hover:text-white transition-colors"
                        title="Expand"
                    >
                        <Maximize2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Main Controls - Compact Grid */}
            <div className="flex-1 p-3 flex flex-col gap-2 bg-background/50 backdrop-blur-sm">
                {/* Method Selector */}
                <div className="space-y-1">
                    <label className="text-[10px] text-text-muted font-medium">Method</label>
                    <select
                        value={selectedMethod}
                        onChange={(e) => onMethodChange(e.target.value)}
                        className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-white focus:border-primary focus:outline-none"
                    >
                        {methods.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                {/* Speed Control */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] text-text-muted font-medium">Speed</label>
                        <span className="text-[10px] text-primary font-mono">{currentSpeed}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => adjustSpeed(-100)}
                            className="px-1.5 py-0.5 bg-surface hover:bg-gray-700 rounded text-xs text-white transition-colors"
                        >
                            −
                        </button>
                        <div className="flex-1 h-1.5 bg-surface rounded overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${((currentSpeed - 100) / 4900) * 100}%` }}
                            />
                        </div>
                        <button
                            onClick={() => adjustSpeed(100)}
                            className="px-1.5 py-0.5 bg-surface hover:bg-gray-700 rounded text-xs text-white transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                        onClick={onUploadClick}
                        className="p-2 bg-surface hover:bg-gray-700 rounded flex flex-col items-center justify-center gap-1 transition-colors group"
                        title="Upload Image"
                    >
                        <Upload className="w-3.5 h-3.5 text-text-muted group-hover:text-white" />
                        <span className="text-[9px] text-text-muted group-hover:text-white">Upload</span>
                    </button>
                    <button
                        onClick={onExpand}
                        className="p-2 bg-surface hover:bg-gray-700 rounded flex flex-col items-center justify-center gap-1 transition-colors group"
                        title="Settings"
                    >
                        <Settings className="w-3.5 h-3.5 text-text-muted group-hover:text-white" />
                        <span className="text-[9px] text-text-muted group-hover:text-white">Settings</span>
                    </button>
                </div>

                {/* Start/Stop Button */}
                {!isDrawing ? (
                    <Button
                        onClick={onStart}
                        className="w-full h-10 text-sm font-medium shadow-lg shadow-primary/20 mt-1"
                    >
                        ▶ Start Drawing
                    </Button>
                ) : (
                    <Button
                        onClick={onStop}
                        className="w-full h-10 text-sm font-medium bg-error hover:bg-red-600 shadow-lg shadow-error/20 mt-1"
                    >
                        ⏹ Stop
                    </Button>
                )}
            </div>
        </div>
    );
}
