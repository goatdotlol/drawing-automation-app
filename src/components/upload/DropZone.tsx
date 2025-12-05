import { useState, useCallback } from 'react';
import { Upload, FileImage, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../ui/Button';
import { open } from '@tauri-apps/plugin-dialog';

interface DropZoneProps {
    onFileSelect: (fileOrPath: File | string) => void;
}

export function DropZone({ onFileSelect }: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const validateFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return false;
        }
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            if (validateFile(files[0])) {
                setFileName(files[0].name);
                setPreview(URL.createObjectURL(files[0]));
                onFileSelect(files[0]);
            }
        }
    }, [onFileSelect]);

    const handleClick = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Image',
                    extensions: ['png', 'jpg', 'jpeg', 'webp']
                }]
            });

            if (selected && typeof selected === 'string') {
                // For dialog selection, we get a path string
                // We can't easily get the file object or preview for local path without convertFileSrc
                // But for now let's just pass the path
                const name = selected.split(/[\\/]/).pop() || 'Selected Image';
                setFileName(name);
                // Use a placeholder or try to load it? 
                // For now, just show the name.
                // Actually, we can use convertFileSrc from tauri api but let's keep it simple.
                setPreview(null); // No preview for path yet unless we use convertFileSrc
                onFileSelect(selected);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to open file dialog');
        }
    };

    const clearFile = () => {
        setFileName(null);
        setPreview(null);
        setError(null);
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!fileName ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            'relative h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden group',
                            isDragging
                                ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/10'
                                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30',
                            error ? 'border-error bg-error/5' : ''
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={handleClick}
                    >
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                                isDragging ? "bg-primary text-white scale-110" : "bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-white",
                                error ? "bg-error text-white" : ""
                            )}>
                                {error ? <AlertCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                            </div>

                            <div className="text-center">
                                <p className="text-lg font-medium text-white mb-1">
                                    {error ? error : isDragging ? "Drop it like it's hot!" : "Click to browse or drag image"}
                                </p>
                                <p className="text-sm text-text-muted">
                                    Supports JPG, PNG, WebP (Max 10MB)
                                </p>
                            </div>
                        </div>

                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-2xl overflow-hidden border border-gray-700 bg-background shadow-2xl"
                    >
                        <div className="aspect-video w-full relative group bg-black/50 flex items-center justify-center">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-text-muted flex flex-col items-center">
                                    <FileImage className="w-12 h-12 mb-2" />
                                    <span>Preview not available for local files</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                                <button
                                    onClick={clearFile}
                                    className="p-3 rounded-full bg-error text-white hover:bg-red-600 transition-transform hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <div className="p-3 rounded-full bg-success text-white">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-surface border-t border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileImage className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-white truncate max-w-[200px]">{fileName}</p>
                                </div>
                            </div>
                            <button
                                onClick={clearFile}
                                className="text-text-muted hover:text-white text-sm font-medium"
                            >
                                Change Image
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
