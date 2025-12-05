import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeId } from '../lib/themes';

interface SettingsState {
    // Theme
    themeId: ThemeId;
    setTheme: (id: ThemeId) => void;

    // Drawing Speed (per method)
    methodSpeeds: Record<string, number>;
    setMethodSpeed: (method: string, speed: number) => void;

    // Window Preferences
    alwaysOnTop: boolean;
    setAlwaysOnTop: (enabled: boolean) => void;
    miniModeScale: number;
    setMiniModeScale: (scale: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Defaults
            themeId: 'dark',
            setTheme: (id) => set({ themeId: id }),

            methodSpeeds: {
                matrix: 1000,
                spiral: 800,
                diagonal: 1200,
                random: 500,
            },
            setMethodSpeed: (method, speed) =>
                set((state) => ({
                    methodSpeeds: { ...state.methodSpeeds, [method]: speed }
                })),

            alwaysOnTop: false,
            setAlwaysOnTop: (enabled) => set({ alwaysOnTop: enabled }),

            miniModeScale: 1.0,
            setMiniModeScale: (scale) => set({ miniModeScale: scale }),
        }),
        {
            name: 'sawbot-settings', // key in localStorage
        }
    )
);
