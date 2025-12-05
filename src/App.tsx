import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainArea } from './components/layout/MainArea';
import { DropZone } from './components/upload/DropZone';
import { DrawingMethodSelector } from './components/settings/DrawingMethodSelector';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { DebugConsole } from './components/debug/DebugConsole';
import { invoke } from '@tauri-apps/api/core';
import { useLogStore } from './stores/logStore';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedMethod, setSelectedMethod] = useState('matrix');
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const addLog = useLogStore((state) => state.addLog);

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

        try {
            setIsDrawing(true);
            addLog('info', 'Starting drawing...', 'frontend');
            await invoke('start_drawing', {
                imagePath,
                speed: 1000, // Default speed
                method: selectedMethod,
                width: 100, // Default width
                height: 100, // Default height
                x: 0,
                y: 0,
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

    return (
        <div className="flex flex-col h-screen bg-background text-text overflow-hidden rounded-xl border border-gray-700 shadow-2xl">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

                <MainArea>
                    {activeTab === 'home' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <section>
                                        <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
                                        <Card>
                                            <DropZone onFileSelect={handleFileSelect} />
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
    );
}

export default App;
