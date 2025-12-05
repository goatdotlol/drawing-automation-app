import { useState } from 'react';

interface SpeedControlProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
}

export function SpeedControl({ value, onChange, min = 100, max = 5000, label = 'Speed (ms)' }: SpeedControlProps) {
    const [inputValue, setInputValue] = useState(value.toString());

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        onChange(newValue);
        setInputValue(newValue.toString());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        let newValue = parseInt(inputValue);
        if (isNaN(newValue)) {
            newValue = value;
        } else {
            newValue = Math.max(min, Math.min(max, newValue));
        }
        onChange(newValue);
        setInputValue(newValue.toString());
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-muted">{label}</label>
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    min={min}
                    max={max}
                    className="w-20 bg-surface border border-border rounded px-2 py-1 text-sm text-white text-right"
                />
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleSliderChange}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider"
                style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-surface) ${((value - min) / (max - min)) * 100}%, var(--color-surface) 100%)`
                }}
            />
        </div>
    );
}
