import { useLogStore } from '../../stores/logStore';
import { X, Trash2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function DebugConsole() {
    const { logs, isVisible, toggleVisibility, clearLogs } = useLogStore();

    // F10 key listener
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'F10') {
                e.preventDefault();
                toggleVisibility();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [toggleVisibility]);
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 h-64 bg-black/90 border-t border-gray-700 backdrop-blur-md z-50 flex flex-col font-mono text-xs"
        >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center gap-2 text-text-muted">
                    <Terminal className="w-4 h-4" />
                    <span className="font-medium">Debug Console</span>
                    <span className="text-xs opacity-50">({logs.length} events)</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={clearLogs} className="p-1 hover:text-white transition-colors" title="Clear Logs">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={toggleVisibility} className="p-1 hover:text-white transition-colors" title="Close">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                        <span className={`uppercase font-bold shrink-0 w-16 ${log.level === 'error' ? 'text-red-500' :
                            log.level === 'warn' ? 'text-yellow-500' :
                                log.level === 'debug' ? 'text-blue-500' :
                                    'text-green-500'
                            }`}>
                            {log.level}
                        </span>
                        <span className="text-gray-400 shrink-0 w-20">[{log.source}]</span>
                        <span className="text-gray-300 break-all">{log.message}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-gray-600 italic">No logs yet...</div>
                )}
            </div>
        </motion.div>
    );
}
