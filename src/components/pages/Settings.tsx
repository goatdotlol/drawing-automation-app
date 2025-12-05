import { themes, ThemeId } from '../../lib/themes';
import { useSettingsStore } from '../../stores/settingsStore';
import { Card } from '../ui/Card';
import { Palette } from 'lucide-react';

export function Settings() {
    const themeId = useSettingsStore((state) => state.themeId);
    const setTheme = useSettingsStore((state) => state.setTheme);

    return (
        <div className="space-y-6">
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Theme Selection</h2>
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(themes).map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setTheme(theme.id as ThemeId)}
                                className={`relative p-4 rounded-lg border-2 transition-all ${themeId === theme.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-border/60'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Palette className="w-5 h-5" />
                                    <h3 className="font-semibold text-white">{theme.name}</h3>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div
                                        className="h-8 rounded"
                                        style={{ backgroundColor: theme.colors.primary }}
                                    />
                                    <div
                                        className="h-8 rounded"
                                        style={{ backgroundColor: theme.colors.surface }}
                                    />
                                    <div
                                        className="h-8 rounded"
                                        style={{ backgroundColor: theme.colors.success }}
                                    />
                                    <div
                                        className="h-8 rounded"
                                        style={{ backgroundColor: theme.colors.error }}
                                    />
                                </div>
                                {themeId === theme.id && (
                                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                <Card>
                    <div className="space-y-2 text-text-muted">
                        <p><span className="font-semibold">Version:</span> 0.1.0</p>
                        <p><span className="font-semibold">Build:</span> Production</p>
                        <p className="pt-2 border-t border-border">
                            Drawing automation tool with advanced algorithms and customization options.
                        </p>
                    </div>
                </Card>
            </section>
        </div>
    );
}
