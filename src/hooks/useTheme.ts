import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { themes, ThemeId } from '../lib/themes';

export function useTheme() {
    const themeId = useSettingsStore((state) => state.themeId);

    useEffect(() => {
        const theme = themes[themeId as ThemeId];
        const root = document.documentElement;

        // Apply CSS variables
        root.style.setProperty('--color-background', theme.colors.background);
        root.style.setProperty('--color-surface', theme.colors.surface);
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-text-main', theme.colors.textMain);
        root.style.setProperty('--color-text-muted', theme.colors.textMuted);
        root.style.setProperty('--color-border', theme.colors.border);
        root.style.setProperty('--color-success', theme.colors.success);
        root.style.setProperty('--color-error', theme.colors.error);

        // Update color scheme
        root.style.colorScheme = themeId === 'light' ? 'light' : 'dark';
    }, [themeId]);
}
