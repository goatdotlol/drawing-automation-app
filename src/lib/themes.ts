export type ThemeId = 'dark' | 'light' | 'cyber' | 'sunset' | 'forest' | 'midnight';

export interface Theme {
    id: ThemeId;
    name: string;
    colors: {
        background: string;
        surface: string;
        primary: string;
        textMain: string;
        textMuted: string;
        border: string;
        success: string;
        error: string;
    };
}

export const themes: Record<ThemeId, Theme> = {
    dark: {
        id: 'dark',
        name: 'Classic Dark',
        colors: {
            background: '#0f172a', // slate-950
            surface: '#1e293b',    // slate-800
            primary: '#3b82f6',    // blue-500
            textMain: '#f8fafc',
            textMuted: '#94a3b8',
            border: '#334155',
            success: '#22c55e',
            error: '#ef4444'
        }
    },
    light: {
        id: 'light',
        name: 'Clean Light',
        colors: {
            background: '#f8fafc', // slate-50
            surface: '#ffffff',    // white
            primary: '#3b82f6',
            textMain: '#0f172a',
            textMuted: '#64748b',
            border: '#e2e8f0',
            success: '#16a34a',
            error: '#dc2626'
        }
    },
    cyber: {
        id: 'cyber',
        name: 'Cyberpunk',
        colors: {
            background: '#09090b', // zinc-950
            surface: '#18181b',    // zinc-900
            primary: '#d946ef',    // fuchsia-500
            textMain: '#e4e4e7',
            textMuted: '#a1a1aa',
            border: '#27272a',
            success: '#00eebb',    // neon green/teal
            error: '#ff0055'       // neon red/pink
        }
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Drive',
        colors: {
            background: '#2a1b24', // deep purple/brown
            surface: '#451a2e',    // wine
            primary: '#f97316',    // orange-500
            textMain: '#fff1f2',
            textMuted: '#fda4af',
            border: '#831843',
            success: '#fde047',
            error: '#be123c'
        }
    },
    forest: {
        id: 'forest',
        name: 'Deep Forest',
        colors: {
            background: '#052e16', // green-950
            surface: '#14532d',    // green-900
            primary: '#4ade80',    // green-400
            textMain: '#f0fdf4',
            textMuted: '#86efac',
            border: '#166534',
            success: '#84cc16',
            error: '#991b1b'
        }
    },
    midnight: {
        id: 'midnight',
        name: 'Starry Night',
        colors: {
            background: '#020617', // slate-950 but darker
            surface: '#172554',    // blue-950
            primary: '#6366f1',    // indigo-500
            textMain: '#e0e7ff',
            textMuted: '#818cf8',
            border: '#1e1b4b',
            success: '#4f46e5',
            error: '#e11d48'
        }
    }
};
