import { Home, Settings, Image as ImageIcon, Palette, History } from 'lucide-react';
import { cn } from '../ui/Button';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const navItems = [
        { id: 'home', icon: Home, label: 'Dashboard' },
        { id: 'upload', icon: ImageIcon, label: 'Upload' },
        { id: 'palette', icon: Palette, label: 'Colors' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="w-[280px] h-full bg-surface border-r border-gray-700 flex flex-col p-4">
            <div className="flex items-center gap-3 px-4 py-6 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-xl text-white">SawBot</h1>
                    <p className="text-xs text-text-muted">Automation Tool</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                            activeTab === item.id
                                ? 'bg-primary/10 text-white'
                                : 'text-text-muted hover:bg-gray-700/50 hover:text-white'
                        )}
                    >
                        <item.icon
                            className={cn(
                                'w-5 h-5 transition-colors',
                                activeTab === item.id ? 'text-primary' : 'text-text-muted group-hover:text-white'
                            )}
                        />
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(88,101,242,0.8)]" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-700">
                <div className="px-4 py-3 bg-background rounded-lg border border-gray-700 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-text-muted">System Ready</span>
                </div>
            </div>
        </div>
    );
}
