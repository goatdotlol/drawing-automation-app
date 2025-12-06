import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function Overlay() {
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Cancel selection and hide overlay
                await invoke('cancel_selection');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        // Use screenX/screenY for global coordinates
        setStartPos({ x: e.screenX, y: e.screenY });
        setCurrentPos({ x: e.screenX, y: e.screenY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            // Use screenX/screenY for global coordinates
            setCurrentPos({ x: e.screenX, y: e.screenY });
        }
    };

    const handleMouseUp = async () => {
        if (isDragging && startPos && currentPos) {
            setIsDragging(false);

            const x = Math.min(startPos.x, currentPos.x);
            const y = Math.min(startPos.y, currentPos.y);
            const width = Math.abs(currentPos.x - startPos.x);
            const height = Math.abs(currentPos.y - startPos.y);

            if (width > 10 && height > 10) {
                // Send global screen coordinates to backend
                await invoke('finish_selection', { x, y, width, height });
            } else {
                // Selection too small, cancel
                await invoke('cancel_selection');
            }

            setStartPos(null);
            setCurrentPos(null);
        }
    };

    const getSelectionStyle = () => {
        if (!startPos || !currentPos) return {};

        // Convert global screen coords to client coords for display
        const left = Math.min(startPos.x, currentPos.x) - window.screenX;
        const top = Math.min(startPos.y, currentPos.y) - window.screenY;
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        return {
            left,
            top,
            width,
            height,
        };
    };

    return (
        <div
            className="w-screen h-screen bg-black/30 cursor-crosshair relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {startPos && currentPos && (
                <div
                    className="absolute border-2 border-green-400 bg-green-400/10 backdrop-blur-none pointer-events-none"
                    style={getSelectionStyle()}
                >
                    {/* Size indicator */}
                    <div className="absolute -top-6 left-0 bg-green-400 text-black px-2 py-0.5 rounded text-xs font-mono">
                        {Math.abs(currentPos.x - startPos.x)} × {Math.abs(currentPos.y - startPos.y)}
                    </div>
                </div>
            )}

            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface/95 text-white px-4 py-2 rounded-full text-sm font-medium border border-gray-700 shadow-xl backdrop-blur-md">
                Click and drag to select area • <span className="text-error font-bold">ESC</span> to cancel
            </div>
        </div>
    );
}
