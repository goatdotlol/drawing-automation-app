import { Maximize2, Activity, Upload, Settings, AlertOctagon } from 'lucide-react';
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
    { id: 'contour', name: 'Contour' },
    { id: 'human', name: 'Human' }
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
    const [isPinned, setIsPinned] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [progress, setProgress] = useState(0);
    const methodSpeeds = useSettingsStore((state) => state.methodSpeeds);
    const setMethodSpeed = useSettingsStore((state) => state.setMethodSpeed);

    const currentSpeed = methodSpeeds[selectedMethod] || 1;

    // Auto-pin when mini mode is active
    useEffect(() => {
        const appWindow = getCurrentWindow();
        appWindow.setAlwaysOnTop(true);
        setIsPinned(true);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Elapsed time tracker
    useEffect(() => {
        let interval: number | undefined;
        if (isDrawing) {
            setElapsedTime(0);
            interval = window.setInterval(() => {
                setElapsedTime(t => t + 1);
            }, 1000);
        } else {
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isDrawing]);

    // Listen for progress updates (placeholder - will be implemented in backend)
    useEffect(() => {
        // TODO: Listen for progress events from backend
        // For now, simulate progress
        if (isDrawing) {
            const interval = window.setInterval(() => {
                setProgress(p => Math.min(100, p + 1));
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [isDrawing]);

    const togglePin = async () => {
        const appWindow = getCurrentWindow();
        const newState = !isPinned;
        setIsPinned(newState);
        await appWindow.setAlwaysOnTop(newState);
    };

    const adjustSpeed = (delta: number) => {
        const newSpeed = Math.max(0, Math.min(50, currentSpeed + delta));
        setMethodSpeed(selectedMethod, newSpeed);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const methodName = methods.find(m => m.id === selectedMethod)?.name || 'Unknown';

    // Emergency F8 hint
    const EmergencyHint = () => (
        <div className="text-[9px] text-text-muted text-center py-0.5 bg-surface/50 rounded border border-error/20">
            Press <span className="text-error font-bold">F8</span> for emergency stop
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-background/95 border border-gray-700 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Header / Drag Region */}
            <div
                data-tauri-drag-region
                className="h-8 bg-surface/80 border-b border-gray-700 flex items-center justify-between px-2 select-none backdrop-blur-sm"
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
                {/* Active Method Display */}
                {isDrawing && (
                    <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-2 border border-primary/30">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-text-muted">Drawing:</span>
                            <span className="text-xs font-bold text-primary">{methodName}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-text-muted">Time:</span>
                            <span className="text-xs font-mono text-white">{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-text-muted">Progress:</span>
                                <span className="text-[10px] font-mono text-primary">{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Method Selector - Only show when not drawing */}
                {!isDrawing && (
                    <div className="space-y-1">
                        <label className="text-[10px] text-text-muted font-medium">Method</label>
                        <select
                            value={selectedMethod}
                            onChange={(e) => onMethodChange(e.target.value)}
                            className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                        >
                            {methods.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Speed Control - Only show when not drawing */}
                {!isDrawing && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] text-text-muted font-medium">Speed</label>
                            <span className="text-[10px] text-primary font-mono">{currentSpeed}ms {currentSpeed === 0 && '⚡'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => adjustSpeed(-5)}
                                className="px-2 py-1 bg-surface hover:bg-gray-700 rounded text-xs text-white transition-colors"
                            >
                                −
                            </button>
                            <div className="flex-1 h-1.5 bg-surface rounded overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${(currentSpeed / 50) * 100}%` }}
                                />
                            </div>
                            <button
                                onClick={() => adjustSpeed(5)}
                                className="px-2 py-1 bg-surface hover:bg-gray-700 rounded text-xs text-white transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons - Only show when not drawing */}
                {!isDrawing && (
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
                )}

                {/* Start/Stop Button */}
                {!isDrawing ? (
                    <>
                        <Button
                            onClick={onStart}
                            className="w-full h-10 text-sm font-medium shadow-lg shadow-primary/20 mt-1"
                        >
                            ▶ Start Drawing
                        </Button>
                        <EmergencyHint />
                    </>
                ) : (
                    <>
                        <Button
                            onClick={onStop}
                            className="w-full h-10 text-sm font-medium bg-error hover:bg-red-600 shadow-lg shadow-error/20 mt-1 flex items-center justify-center gap-2"
                        >
                            <AlertOctagon className="w-4 h-4" />
                            STOP
                        </Button>
                        <EmergencyHint />
                    </>
                )}
            </div>
        </div>
    );
}
