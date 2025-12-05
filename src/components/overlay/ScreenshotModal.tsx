import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

interface ScreenshotModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    onSelectArea: (coords: { x1: number, y1: number, x2: number, y2: number }) => void;
}

export const ScreenshotModal = ({ isOpen, onClose, imageUrl, onSelectArea }: ScreenshotModalProps) => {
    const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
    const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // If not open or no image, don't render
    if (!isOpen || !imageUrl) return null;

    const handleMouseDown = (e: React.MouseEvent) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setCurrentPos({ x: e.clientX, y: e.clientY });
        setSelection(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!startPos) return;
        setCurrentPos({ x: e.clientX, y: e.clientY });

        const x = Math.min(startPos.x, e.clientX);
        const y = Math.min(startPos.y, e.clientY);
        const w = Math.abs(e.clientX - startPos.x);
        const h = Math.abs(e.clientY - startPos.y);

        setSelection({ x, y, w, h });
    };

    const handleMouseUp = () => {
        if (startPos && currentPos && selection) {
            // Confirm selection
            onSelectArea({
                x1: selection.x,
                y1: selection.y,
                x2: selection.x + selection.w,
                y2: selection.y + selection.h
            });
            setStartPos(null);
            setCurrentPos(null);
        }
    };

    // Use portal to render outside the main app structure, covering everything
    return createPortal(
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-auto">
            <div className="relative cursor-crosshair select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setStartPos(null)} // Cancel if leaving image area
            >
                <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Screenshot"
                    className="max-w-none block" // Ensure it doesn't scale down, we want 1:1 pixel mapping ideally
                    style={{ pointerEvents: 'none' }} // Let clicks pass through to container
                />

                {/* Selection Box */}
                {selection && (
                    <div
                        className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
                        style={{
                            left: selection.x,
                            top: selection.y,
                            width: selection.w,
                            height: selection.h
                        }}
                    />
                )}
            </div>

            {/* Close/Cancel Button */}
            <div className="fixed top-4 right-4 z-50">
                <Button variant="danger" onClick={onClose}>Cancel</Button>
            </div>

            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-surface/90 p-2 rounded text-white text-sm pointer-events-none">
                Click and drag to select area
            </div>
        </div>,
        document.body
    );
};
