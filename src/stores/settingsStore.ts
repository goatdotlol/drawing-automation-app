import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    themeId: string;
    methodSpeeds: Record<string, number>;
    windowPrefs: {
        alwaysOnTop: boolean;
        miniModeScale: number;
        lastPosition?: { x: number; y: number };
        lastSize?: { width: number; height: number };
    };
    setTheme: (themeId: string) => void;
    setMethodSpeed: (method: string, speed: number) => void;
    setWindowPref: (key: string, value: any) => void;
    setWindowPosition: (x: number, y: number) => void;
    setWindowSize: (width: number, height: number) => void;
}

// Migration function to convert old speeds (100-5000ms) to new range (0-50ms)
const migrateSpeed = (oldSpeed: number): number => {
    // If speed is already in new range (0-50), keep it
    if (oldSpeed >= 0 && oldSpeed <= 50) {
        return oldSpeed;
    }
    // Otherwise, map from old range to new range
    // Old: 100-5000ms  → New: 0-50ms
    // Formula: newSpeed = (oldSpeed - 100) / (5000 - 100) * 50
    const normalized = Math.max(0, Math.min(1, (oldSpeed - 100) / 4900));
    return Math.round(normalized * 50);
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            themeId: 'dark',
            methodSpeeds: {
                matrix: 1,
                dithering: 2,
                continuous: 2,
                spiral: 1,
                stippling: 10,
                contour: 2,
                human: 2
            },
            windowPrefs: {
                alwaysOnTop: false,
                miniModeScale: 1.0,
            },
            setTheme: (themeId) => set({ themeId }),
            setMethodSpeed: (method, speed) =>
                set((state) => ({
                    methodSpeeds: { ...state.methodSpeeds, [method]: speed },
                })),
            setWindowPref: (key, value) =>
                set((state) => ({
                    windowPrefs: { ...state.windowPrefs, [key]: value },
                })),
            setWindowPosition: (x, y) =>
                set((state) => ({
                    windowPrefs: { ...state.windowPrefs, lastPosition: { x, y } },
                })),
            setWindowSize: (width, height) =>
                set((state) => ({
                    windowPrefs: { ...state.windowPrefs, lastSize: { width, height } },
                })),
        }),
        {
            name: 'sawbot-settings',
            version: 2, // Increment version to trigger migration
            migrate: (persistedState: any, version: number) => {
                // Migrate from version 1 to version 2 (speed range change)
                if (version < 2) {
                    const migratedSpeeds: Record<string, number> = {};
                    for (const [method, speed] of Object.entries(persistedState.methodSpeeds || {})) {
                        migratedSpeeds[method] = migrateSpeed(speed as number);
                    }
                    return {
                        ...persistedState,
                        methodSpeeds: migratedSpeeds,
                    };
                }
                return persistedState;
            },
        }
    )
);
