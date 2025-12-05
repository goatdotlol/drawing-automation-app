import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';

export function Overlay() {
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                await getCurrentWindow().hide();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setCurrentPos({ x: e.clientX, y: e.clientY });
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
                // Emit event with selection coordinates
                await emit('area-selected', { x, y, width, height });
                await getCurrentWindow().hide();
            }

            setStartPos(null);
            setCurrentPos(null);
        }
    };

    const getSelectionStyle = () => {
        if (!startPos || !currentPos) return {};

        const left = Math.min(startPos.x, currentPos.x);
        const top = Math.min(startPos.y, currentPos.y);
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
            className="w-screen h-screen bg-black/50 cursor-crosshair relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {startPos && currentPos && (
                <div
                    className="absolute border-2 border-primary bg-primary/20 backdrop-blur-none"
                    style={getSelectionStyle()}
                />
            )}

            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface/90 text-white px-4 py-2 rounded-full text-sm font-medium border border-gray-700 shadow-xl backdrop-blur-md">
                Click and drag to select area • ESC to cancel
            </div>
        </div>
    );
}
