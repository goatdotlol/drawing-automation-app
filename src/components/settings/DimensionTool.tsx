import { Maximize2, Lock } from "lucide-react";
import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { captureScreenshot } from "../../utils/tauriCommands";

const aspectRatios = [
  { label: "Free", value: null },
  { label: "1:1 (Square)", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:2", value: 3 / 2 },
];

export default function DimensionTool() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockedAspectRatio, setLockedAspectRatio] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleAspectRatioChange = (ratio: number | null) => {
    setLockedAspectRatio(ratio);
    if (ratio) {
      setHeight(Math.round(width / ratio));
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockedAspectRatio) {
      setHeight(Math.round(newWidth / lockedAspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockedAspectRatio) {
      setWidth(Math.round(newHeight * lockedAspectRatio));
    }
  };

  const handleCaptureScreen = async () => {
    setIsCapturing(true);
    try {
      await captureScreenshot();
      // Screenshot captured, selection overlay would show here
      setIsCapturing(false);
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      setIsCapturing(false);
    }
  };

  return (
    <Card variant="elevated">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Maximize2 className="text-discord-accent" size={24} />
          <h2 className="text-2xl font-bold text-white">Dimensions & Aspect Ratio</h2>
        </div>
        <p className="text-discord-text-secondary">
          Set the drawing area dimensions. Use the screenshot tool to select from your screen.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Width (px)"
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              min={100}
              max={5000}
            />
            <Input
              label="Height (px)"
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              min={100}
              max={5000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-discord-text-secondary mb-2">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => handleAspectRatioChange(ratio.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    lockedAspectRatio === ratio.value
                      ? "border-discord-accent bg-discord-accent/10 text-white"
                      : "border-gray-700 bg-discord-dark text-discord-text-secondary hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {ratio.value && <Lock size={14} />}
                    {ratio.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-discord-secondary rounded-lg">
            <div className="text-sm text-discord-text-secondary mb-1">Current Dimensions</div>
            <div className="text-lg font-semibold text-white">
              {width} × {height} px
            </div>
            {lockedAspectRatio && (
              <div className="text-xs text-discord-text-secondary mt-1">
                Locked to {aspectRatios.find((r) => r.value === lockedAspectRatio)?.label}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={handleCaptureScreen}
            isLoading={isCapturing}
            className="w-full"
          >
            {isCapturing ? "Capturing..." : "Capture Screen & Select Area"}
          </Button>

          <p className="text-xs text-discord-text-secondary">
            Click to take a screenshot and drag to select the drawing area. The selection will be saved as your canvas bounds.
          </p>
        </div>
      </div>
    </Card>
  );
}

