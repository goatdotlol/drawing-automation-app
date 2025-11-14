import { Play, Eye } from "lucide-react";
import { useState } from "react";
import { useDrawingStore } from "../../stores/drawingStore";
import { useImageStore } from "../../stores/imageStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { startDrawing as startDrawingCommand } from "../../utils/tauriCommands";
import { fileToUint8Array, uint8ArrayToNumberArray } from "../../utils/imageUtils";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Countdown from "./Countdown";
import Preview from "./Preview";
import { ToastContainer, Toast } from "../ui/Toast";

export default function Controls() {
  const { image } = useImageStore();
  const { drawingMethod, speed, canvasBounds, isCalibrated, colorPalette } = useSettingsStore();
  const { startDrawing: setDrawingState } = useDrawingStore();
  const [showPreview, setShowPreview] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const canStart = image && isCalibrated && canvasBounds;

  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleStart = async () => {
    if (!canStart || !image || !canvasBounds) {
      addToast("error", "Please complete all setup steps first");
      return;
    }

    setShowCountdown(true);
  };

  const handleCountdownComplete = async () => {
    setShowCountdown(false);
    
    try {
      if (!image || !canvasBounds) {
        addToast("error", "Please complete all setup steps first");
        return;
      }
      // Convert image file to Uint8Array
      const imageData = await fileToUint8Array(image);
      const imageArray = uint8ArrayToNumberArray(imageData);

      // Call Tauri command
      await startDrawingCommand({
        image_data: imageArray,
        method: drawingMethod,
        speed,
        canvas_bounds: {
          x: canvasBounds.x,
          y: canvasBounds.y,
          width: canvasBounds.width,
          height: canvasBounds.height,
        },
        color_palette: colorPalette,
      });

      setDrawingState();
      addToast("success", "Drawing started!");
    } catch (error: any) {
      console.error("Failed to start drawing:", error);
      addToast("error", `Failed to start drawing: ${error.message || error}`);
    }
  };

  const handleCountdownCancel = () => {
    setShowCountdown(false);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <Card variant="elevated">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Draw</h2>

        <div className="space-y-3">
          <div className="p-4 bg-discord-secondary rounded-lg space-y-2">
            <div className="text-sm font-medium text-white mb-3">Settings Summary</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-discord-text-secondary">Method:</span>
                <span className="text-white ml-2">{drawingMethod}</span>
              </div>
              <div>
                <span className="text-discord-text-secondary">Speed:</span>
                <span className="text-white ml-2">{speed}x</span>
              </div>
              <div>
                <span className="text-discord-text-secondary">Canvas:</span>
                <span className="text-white ml-2">
                  {canvasBounds ? `${canvasBounds.width}×${canvasBounds.height}` : "Not set"}
                </span>
              </div>
              <div>
                <span className="text-discord-text-secondary">Status:</span>
                <span className={`ml-2 ${isCalibrated ? "text-discord-success" : "text-discord-error"}`}>
                  {isCalibrated ? "Ready" : "Not calibrated"}
                </span>
              </div>
            </div>
          </div>

          {!canStart && (
            <div className="p-4 bg-discord-error/20 border border-discord-error rounded-lg">
              <p className="text-sm text-discord-error">
                {!image && "• Upload an image first\n"}
                {!isCalibrated && "• Calibrate canvas position\n"}
                {!canvasBounds && "• Set canvas dimensions"}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              disabled={!canStart}
              className="flex-1"
            >
              <Play size={20} className="mr-2" />
              Start Drawing
            </Button>
            <Button variant="secondary" onClick={handlePreview} disabled={!canStart}>
              <Eye size={20} />
            </Button>
          </div>

          <p className="text-xs text-discord-text-secondary text-center">
            A 3-2-1 countdown will appear before drawing starts
          </p>
        </div>
      </div>

      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} onCancel={handleCountdownCancel} />
      )}
      <Preview isOpen={showPreview} onClose={() => setShowPreview(false)} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Card>
  );
}

