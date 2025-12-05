import { Bell, User, Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function Header() {
    const appWindow = getCurrentWindow();
    const minimize = () => appWindow.minimize();
    const toggleMaximize = () => appWindow.toggleMaximize();
    const close = () => appWindow.close();

    return (
        <div data-tauri-drag-region className="h-12 bg-surface border-b border-gray-700 flex items-center justify-between px-4 select-none">
            <div className="flex items-center gap-4">
                <h2 className="font-medium text-text-muted text-sm">SawBot - Drawing Automation</h2>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700 rounded-full text-text-muted hover:text-white transition-colors">
                    <Bell className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-full text-text-muted hover:text-white transition-colors mr-2">
                    <User className="w-4 h-4" />
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
