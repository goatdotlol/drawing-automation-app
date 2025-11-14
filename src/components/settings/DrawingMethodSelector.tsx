import { Settings2 } from "lucide-react";
import { useSettingsStore, DrawingMethod } from "../../stores/settingsStore";
import Card from "../ui/Card";

const methods: { value: DrawingMethod; label: string; description: string; estimatedTime: string }[] = [
  {
    value: "matrix-dot",
    label: "Matrix Dot (Fast scan)",
    description: "Scans left-to-right, top-to-bottom placing dots at calculated intervals. Fast and efficient.",
    estimatedTime: "~2-5 min",
  },
  {
    value: "floyd-steinberg",
    label: "Floyd-Steinberg Dithering",
    description: "Error diffusion dithering for high-quality black/white conversion with optimized spiral pattern.",
    estimatedTime: "~5-10 min",
  },
  {
    value: "continuous-line",
    label: "Continuous Line",
    description: "Never lifts pen, creates image with one continuous line using edge detection and path optimization.",
    estimatedTime: "~10-15 min",
  },
  {
    value: "spiral-raster",
    label: "Spiral Raster",
    description: "Draws from center outward in spiral pattern. Creates dramatic reveal effect.",
    estimatedTime: "~3-7 min",
  },
  {
    value: "scanline",
    label: "Scanline Method",
    description: "Traditional line-by-line with color blending. High accuracy, moderate speed.",
    estimatedTime: "~8-12 min",
  },
  {
    value: "stippling",
    label: "Stippling/Pointillism",
    description: "Varying dot density for shading. More dots in darker areas, fewer in lighter areas.",
    estimatedTime: "~6-10 min",
  },
  {
    value: "contour-vector",
    label: "Contour/Vector Drawing",
    description: "Traces outlines and fills using edge detection and vectorization.",
    estimatedTime: "~7-12 min",
  },
];

export default function DrawingMethodSelector() {
  const { drawingMethod, setDrawingMethod } = useSettingsStore();

  return (
    <Card variant="elevated">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Settings2 className="text-discord-accent" size={24} />
          <h2 className="text-2xl font-bold text-white">Drawing Method</h2>
        </div>
        <p className="text-discord-text-secondary">
          Select the algorithm for drawing your image. Each method has different speed and quality characteristics.
        </p>

        <div className="space-y-3">
          {methods.map((method) => (
            <label
              key={method.value}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                drawingMethod === method.value
                  ? "border-discord-accent bg-discord-accent/10"
                  : "border-gray-700 bg-discord-dark hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="drawingMethod"
                  value={method.value}
                  checked={drawingMethod === method.value}
                  onChange={(e) => setDrawingMethod(e.target.value as DrawingMethod)}
                  className="mt-1 w-4 h-4 text-discord-accent focus:ring-discord-accent"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{method.label}</span>
                    <span className="text-sm text-discord-text-secondary">{method.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-discord-text-secondary">{method.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}

