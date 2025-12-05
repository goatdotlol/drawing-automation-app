import { create } from 'zustand';

export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    source: 'frontend' | 'backend';
}

interface LogStore {
    logs: LogEntry[];
    addLog: (level: LogEntry['level'], message: string, source?: LogEntry['source']) => void;
    clearLogs: () => void;
    isVisible: boolean;
    toggleVisibility: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
    logs: [],
    isVisible: false, // Hidden by default, toggle with F10
    addLog: (level, message, source = 'frontend') => set((state) => ({
        logs: [
            {
                id: crypto.randomUUID(),
                timestamp: new Date().toLocaleTimeString(),
                level,
                message,
                source,
            },
            ...state.logs,
        ].slice(0, 1000),
    })),
    clearLogs: () => set({ logs: [] }),
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
}));
