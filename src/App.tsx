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
import { useSettingsStore } from './stores/settingsStore';
import { MiniPlayer } from './components/layout/MiniPlayer';
import { ScreenshotModal } from './components/overlay/ScreenshotModal';
import { useTheme } from './hooks/useTheme';
import { Settings } from './components/pages/Settings';

function App() {
    useTheme(); // Apply theme from settings

    const [activeTab, setActiveTab] = useState('home');
    const [selectedMethod, setSelectedMethod] = useState('matrix');
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isMini, setIsMini] = useState(false);
    const addLog = useLogStore((state) => state.addLog);
    const methodSpeeds = useSettingsStore((state) => state.methodSpeeds);

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
            const speed = methodSpeeds[selectedMethod] || 1000;
            addLog('info', `Starting drawing at ${x},${y} ${width}x${height}...`, 'frontend');
            await invoke('start_drawing', {
                imagePath,
                speed,
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

    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);

    const handleCaptureScreen = async () => {
        try {
            const appWindow = getCurrentWindow();
            // Hide the window before capturing
            await appWindow.hide();
            // Small delay to ensure window is fully hidden
            await new Promise(resolve => setTimeout(resolve, 200));

            const url = await invoke<string>('capture_screen');

            // Show the window again
            await appWindow.show();

            setScreenshotUrl(url);
            setIsScreenshotModalOpen(true);
            addLog('info', 'Screen captured for selection', 'frontend');
        } catch (error) {
            console.error('Failed to capture screen:', error);
            const appWindow = getCurrentWindow();
            await appWindow.show(); // Ensure window is shown even on error
            addLog('error', `Failed to capture screen: ${error}`, 'frontend');
        }
    };

    const handleAreaSelected = (coords: { x1: number, y1: number, x2: number, y2: number }) => {
        setManualSelection(coords);
        setIsScreenshotModalOpen(false);
        setScreenshotUrl(null);
        addLog('info', `Area selected: ${coords.x1},${coords.y1} - ${coords.x2},${coords.y2}`, 'frontend');
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
                                                        <Button variant="secondary" className="w-full hidden" onClick={handleSelectArea}>
                                                            Select Drawing Area (Snipping Tool)
                                                        </Button>

                                                        <div className="p-4 bg-surface/50 rounded-lg border border-gray-700">
                                                            <h3 className="text-sm font-medium text-text-muted mb-3">Drawing Area</h3>
                                                            <div className="mb-4">
                                                                <Button variant="secondary" className="w-full" onClick={handleCaptureScreen}>
                                                                    Capture Screen & Select Area
                                                                </Button>
                                                            </div>
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

                            {activeTab === 'settings' && <Settings />}

                            {activeTab === 'history' && (
                                <div className="space-y-6">
                                    <section>
                                        <h2 className="text-2xl font-bold text-white mb-4">Drawing History</h2>
                                        <Card>
                                            <div className="text-center py-12 text-text-muted">
                                                <p>No drawings recorded yet.</p>
                                                <p className="text-sm mt-2">Completed drawings will appear here.</p>
                                            </div>
                                        </Card>
                                    </section>
                                </div>
                            )}

                            {activeTab !== 'home' && activeTab !== 'settings' && activeTab !== 'history' && (
                                <div className="flex items-center justify-center h-full text-text-muted">
                                    Work in progress...
                                </div>
                            )}
                        </MainArea>
                    </div>
                    <DebugConsole />
                </div>
            )}
            <ScreenshotModal
                isOpen={isScreenshotModalOpen}
                onClose={() => setIsScreenshotModalOpen(false)}
                imageUrl={screenshotUrl}
                onSelectArea={handleAreaSelected}
            />
        </div>
    );
}

export default App;
