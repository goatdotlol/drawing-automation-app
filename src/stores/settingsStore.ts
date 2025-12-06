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

    // Window position/size
    windowPrefs: {
        lastPosition?: { x: number; y: number };
        lastSize?: { width: number; height: number };
    };
    setWindowPosition: (x: number, y: number) => void;
    setWindowSize: (width: number, height: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Defaults
            themeId: 'dark',
            setTheme: (id) => set({ themeId: id }),

            methodSpeeds: {
                matrix: 1,
                spiral: 1,
                diagonal: 2,
                random: 5,
                dithering: 2,
                continuous: 2,
                stippling: 10,
                contour: 2,
                human: 2
            },
            setMethodSpeed: (method, speed) =>
                set((state) => ({
                    methodSpeeds: { ...state.methodSpeeds, [method]: speed }
                })),

            alwaysOnTop: false,
            setAlwaysOnTop: (enabled) => set({ alwaysOnTop: enabled }),

            miniModeScale: 1.0,
            setMiniModeScale: (scale) => set({ miniModeScale: scale }),

            windowPrefs: {},
            setWindowPosition: (x, y) =>
                set((state) => ({
                    windowPrefs: { ...state.windowPrefs, lastPosition: { x, y } }
                })),
            setWindowSize: (width, height) =>
                set((state) => ({
                    windowPrefs: { ...state.windowPrefs, lastSize: { width, height } }
                })),
        }),
        {
            name: 'sawbot-settings', // key in localStorage
        }
    )
);
