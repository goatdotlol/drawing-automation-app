import { Minus, Square, X, Pin, Minimize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { useState } from 'react';

export function Header() {
    const appWindow = getCurrentWindow();
    const [isPinned, setIsPinned] = useState(false);
    const [isMini, setIsMini] = useState(false);

    const minimize = () => appWindow.minimize();
    const toggleMaximize = () => appWindow.toggleMaximize();
    const close = () => appWindow.close();

    const togglePin = async () => {
        const newState = !isPinned;
        setIsPinned(newState);
        await appWindow.setAlwaysOnTop(newState);
    };

    const toggleMini = async () => {
        const newState = !isMini;
        setIsMini(newState);
        if (newState) {
            await appWindow.setSize(new LogicalSize(300, 400));
        } else {
            await appWindow.setSize(new LogicalSize(1200, 800));
        }
    };

    return (
        <div data-tauri-drag-region className="h-12 bg-surface border-b border-gray-700 flex items-center justify-between px-4 select-none">
            <div className="flex items-center gap-4 pointer-events-none">
                <h2 className="font-medium text-text-muted text-sm">SawBot - Drawing Automation</h2>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleMini}
                    className={`p-2 rounded-full transition-colors ${isMini ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700 text-text-muted hover:text-white'}`}
                    title="Mini Mode"
                >
                    <Minimize2 className="w-4 h-4" />
                </button>

                <button
                    onClick={togglePin}
                    className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700 text-text-muted hover:text-white'}`}
                    title="Always on Top"
                >
                    <Pin className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-gray-700 mx-2" />

                <button onClick={minimize} className="p-2 hover:bg-gray-700 rounded-lg text-text-muted hover:text-white transition-colors">
                    <Minus className="w-4 h-4" />
                </button>
                <button onClick={toggleMaximize} className="p-2 hover:bg-gray-700 rounded-lg text-text-muted hover:text-white transition-colors">
                    <Square className="w-4 h-4" />
                </button>
                <button onClick={close} className="p-2 hover:bg-error hover:text-white rounded-lg text-text-muted transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
