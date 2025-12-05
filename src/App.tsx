import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainArea } from './components/layout/MainArea';
import { DropZone } from './components/upload/DropZone';
import { DrawingMethodSelector } from './components/settings/DrawingMethodSelector';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { DebugConsole } from './components/debug/DebugConsole';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { useLogStore } from './stores/logStore';
import { MiniPlayer } from './components/layout/MiniPlayer';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedMethod, setSelectedMethod] = useState('matrix');
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const addLog = useLogStore((state) => state.addLog);

    const toggleMini = async () => {
        const appWindow = getCurrentWindow();
        const newState = !isMini;
        setIsMini(newState);
        if (newState) {
            await appWindow.setSize(new LogicalSize(300, 150)); // Compact size
        } else {
            await appWindow.setSize(new LogicalSize(1200, 800));
        }
    };

    const handleFileSelect = (fileOrPath: File | string) => {
        let path = '';
        if (typeof fileOrPath === 'string') {
            path = fileOrPath;
        } else {
            // Fallback for drag and drop if path is available
            path = (fileOrPath as any).path || '';
        }

        if (path) {
            setImagePath(path);
            addLog('info', `File selected: ${path}`, 'frontend');
        } else {
            addLog('error', 'Could not get file path. Please click to browse instead of drag-and-drop.', 'frontend');
        }
    };

    const handleStartDrawing = async () => {
        if (!imagePath) {
            addLog('warn', 'No image selected', 'frontend');
            return;
        }

        // Calculate dimensions from manual selection
        const x = Math.min(manualSelection.x1, manualSelection.x2);
        const y = Math.min(manualSelection.y1, manualSelection.y2);
        const width = Math.abs(manualSelection.x2 - manualSelection.x1);
        const height = Math.abs(manualSelection.y2 - manualSelection.y1);

        if (width === 0 || height === 0) {
            addLog('warn', 'Invalid drawing area (width or height is 0)', 'frontend');
            return;
        }

        try {
            setIsDrawing(true);
            addLog('info', `Starting drawing at ${x},${y} ${width}x${height}...`, 'frontend');
            await invoke('start_drawing', {
                imagePath,
                speed: 1000, // Default speed
                method: selectedMethod,
                width,
                height,
                x,
                y,
            });
            addLog('info', 'Drawing started successfully', 'backend');
        } catch (error) {
            console.error(error);
            addLog('error', `Failed to start drawing: ${error}`, 'backend');
            setIsDrawing(false);
        }
    };

    const handleStopDrawing = async () => {
        try {
            await invoke('stop_drawing');
            setIsDrawing(false);
            addLog('info', 'Drawing stopped', 'frontend');
        } catch (error) {
            addLog('error', `Failed to stop drawing: ${error}`, 'backend');
        }
    };

    const [manualSelection, setManualSelection] = useState({
        x1: 0, y1: 0, x2: 0, y2: 0
    });

    const handleCapture = async (point: 'p1' | 'p2') => {
        try {
            addLog('info', `Move mouse to ${point === 'p1' ? 'Top-Left' : 'Bottom-Right'} and press F9/F10...`, 'frontend');

            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds to move mouse

            const pos = await invoke<{ 0: number, 1: number }>('get_mouse_position');
            // Rust returns a tuple, which JS sees as an array or object depending on serialization.
            // Let's assume array [x, y] or object {0: x, 1: y}
            const [x, y] = Array.isArray(pos) ? pos : [pos[0], pos[1]];

            setManualSelection(prev => {
                const newState = { ...prev };
                if (point === 'p1') {
                    newState.x1 = x;
                    newState.y1 = y;
                } else {
                    newState.x2 = x;
                    newState.y2 = y;
                }
                return newState;
            });

            addLog('success', `Captured ${point}: ${x}, ${y}`, 'frontend');

        } catch (error) {
            console.error(error);
            addLog('error', `Failed to capture mouse: ${error}`, 'frontend');
        }
    };

    const handleSelectArea = async () => {
        try {
            const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
            const overlay = await WebviewWindow.getByLabel('overlay');
            if (overlay) {
                // Ensure it's visible and covers the screen
                await overlay.show();
                await overlay.setFocus();
                await overlay.maximize();
            }
        } catch (error) {
            console.error('Failed to open overlay:', error);
            addLog('error', 'Failed to open selection tool', 'frontend');
        }
    };

    // Listen for area selection
    useEffect(() => {
        const setupListener = async () => {
            const { listen } = await import('@tauri-apps/api/event');
            const unlisten = await listen('area-selected', (event: any) => {
                const { x, y, width, height } = event.payload;
                addLog('info', `Area selected: ${Math.round(x)},${Math.round(y)} ${Math.round(width)}x${Math.round(height)}`, 'frontend');

                // Update manual selection state
                setManualSelection({
                    x1: Math.round(x),
                    y1: Math.round(y),
                    x2: Math.round(x + width),
                    y2: Math.round(y + height)
                });
            });
            return unlisten;
        };

        // We need to handle the cleanup of the promise-based listener
        let unlistenFn: (() => void) | undefined;
        setupListener().then(fn => unlistenFn = fn);

        return () => {
            if (unlistenFn) unlistenFn();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-transparent overflow-hidden rounded-xl shadow-2xl">
            {isMini ? (
                <MiniPlayer
                    onExpand={toggleMini}
                    isDrawing={isDrawing}
                    onStart={handleStartDrawing}
                    onStop={handleStopDrawing}
                />
            ) : (
                <div className="flex flex-col h-full bg-background border border-gray-700 rounded-xl overflow-hidden">
                    <Header isMini={isMini} toggleMini={toggleMini} />

                    <div className="flex flex-1 overflow-hidden">
                        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

                        <MainArea>
                            {activeTab === 'home' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Column */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <section>
                                                <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
                                                <Card>
                                                    <DropZone onFileSelect={handleFileSelect} />
                                                    <div className="mt-4 space-y-4">
                                                        <Button variant="secondary" className="w-full" onClick={handleSelectArea}>
                                                            Select Drawing Area (Snipping Tool)
                                                        </Button>

                                                        <div className="p-4 bg-surface/50 rounded-lg border border-gray-700">
                                                            <h3 className="text-sm font-medium text-text-muted mb-3">Manual Selection</h3>
                                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs text-text-muted">Top-Left (X, Y)</label>
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="number"
                                                                            value={manualSelection.x1}
                                                                            onChange={(e) => setManualSelection(s => ({ ...s, x1: parseInt(e.target.value) || 0 }))}
                                                                            className="w-full bg-background border border-gray-700 rounded px-2 py-1 text-sm"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            value={manualSelection.y1}
                                                                            onChange={(e) => setManualSelection(s => ({ ...s, y1: parseInt(e.target.value) || 0 }))}
                                                                            className="w-full bg-background border border-gray-700 rounded px-2 py-1 text-sm"
                                                                        />
                                                                    </div>
                                                                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleCapture('p1')}>
                                                                        Capture (Wait 3s)
                                                                    </Button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs text-text-muted">Bottom-Right (X, Y)</label>
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="number"
                                                                            value={manualSelection.x2}
                                                                            onChange={(e) => setManualSelection(s => ({ ...s, x2: parseInt(e.target.value) || 0 }))}
                                                                            className="w-full bg-background border border-gray-700 rounded px-2 py-1 text-sm"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            value={manualSelection.y2}
                                                                            onChange={(e) => setManualSelection(s => ({ ...s, y2: parseInt(e.target.value) || 0 }))}
                                                                            className="w-full bg-background border border-gray-700 rounded px-2 py-1 text-sm"
                                                                        />
                                                                    </div>
                                                                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleCapture('p2')}>
                                                                        Capture (Wait 3s)
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-xs text-text-muted">Width</label>
                                                                    <input
                                                                        type="number"
                                                                        value={Math.abs(manualSelection.x2 - manualSelection.x1)}
                                                                        className="w-full bg-background border border-gray-700 rounded px-2 py-1 text-sm"
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-text-muted">Height</label>
                                                                    <input
                                                                        type="number"
                                                                        value={Math.abs(manualSelection.y2 - manualSelection.y1)}
                                                                        className="w-full bg-background border border-gray-700 rounded px-2 py-1 text-sm"
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </section>

                                            <section>
                                                <h2 className="text-xl font-bold text-white mb-4">Drawing Method</h2>
                                                <DrawingMethodSelector
                                                    selectedMethod={selectedMethod}
                                                    onSelect={setSelectedMethod}
                                                />
                                            </section>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            <section>
                                                <h2 className="text-xl font-bold text-white mb-4">Status</h2>
                                                <Card className="bg-gradient-to-br from-surface to-surface/50">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-text-muted">Service Status</span>
                                                            <span className="text-success font-medium flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                                                Online
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-text-muted">Mouse Driver</span>
                                                            <span className="text-success font-medium">Ready</span>
                                                        </div>
                                                        <div className="pt-4 border-t border-gray-700">
                                                            {!isDrawing ? (
                                                                <Button className="w-full" onClick={handleStartDrawing}>
                                                                    Start Drawing
                                                                </Button>
                                                            ) : (
                                                                <Button className="w-full bg-error hover:bg-red-600" onClick={handleStopDrawing}>
                                                                    Stop Drawing
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </section>

                                            <section>
                                                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                                                <Card>
                                                    <div className="text-center py-8 text-text-muted">
                                                        No recent drawings
                                                    </div>
                                                </Card>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab !== 'home' && (
                                <div className="flex items-center justify-center h-full text-text-muted">
                                    Work in progress...
                                </div>
                            )}
                        </MainArea>
                    </div>
                    <DebugConsole />
                </div>
            )}
        </div>
    );
}

export default App;
