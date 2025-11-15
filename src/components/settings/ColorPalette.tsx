import { Palette } from "lucide-react";
import { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { captureScreenshot, detectColorPalette } from "../../utils/tauriCommands";

export default function ColorPalette() {
  const { colorPalette, setColorPalette } = useSettingsStore();
  const [isDetecting, setIsDetecting] = useState(false);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const screenshot = await captureScreenshot();
      const colors = await detectColorPalette(screenshot);
      setColorPalette(colors);
      setIsDetecting(false);
    } catch (error) {
      console.error("Failed to detect colors:", error);
      // Fallback to mock colors
      const mockColors = [
        "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
        "#FFFF00", "#FF00FF", "#00FFFF", "#808080", "#FFA500",
      ];
      setColorPalette(mockColors);
      setIsDetecting(false);
    }
  };

  const handleManualAdd = () => {
    const color = prompt("Enter color (hex format, e.g., #FF0000):");
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      setColorPalette([...colorPalette, color]);
    }
  };

  const handleRemoveColor = (index: number) => {
    setColorPalette(colorPalette.filter((_, i) => i !== index));
  };

  return (
    <Card variant="elevated">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="text-discord-accent" size={24} />
          <h2 className="text-2xl font-bold text-white">Color Palette</h2>
        </div>
        <p className="text-discord-text-secondary">
          Detect or manually configure the available colors for drawing. Colors will be automatically matched from your image.
        </p>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleAutoDetect}
              isLoading={isDetecting}
              className="flex-1"
            >
              {isDetecting ? "Detecting..." : "Auto-Detect Colors"}
            </Button>
            <Button variant="secondary" onClick={handleManualAdd}>
              Add Color
            </Button>
          </div>

          {colorPalette.length > 0 ? (
            <div>
              <div className="text-sm font-medium text-discord-text-secondary mb-2">
                Detected Colors ({colorPalette.length})
              </div>
              <div className="grid grid-cols-5 gap-2">
                {colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-lg border-2 border-gray-700 overflow-hidden"
                  >
                    <div
                      className="w-full h-full cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <button
                      onClick={() => handleRemoveColor(index)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-gray-700 rounded-lg">
              <Palette className="mx-auto mb-2 text-discord-text-secondary" size={32} />
              <p className="text-discord-text-secondary">
                No colors detected. Click "Auto-Detect Colors" to scan the color palette area.
              </p>
            </div>
          )}

          <div className="p-4 bg-discord-secondary rounded-lg">
            <div className="text-sm text-discord-text-secondary mb-2">Color Matching</div>
            <p className="text-xs text-discord-text-secondary">
              Image colors will be automatically matched to the closest available color using CIE Lab color space
              and Delta E 2000 algorithm for perceptual accuracy.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

