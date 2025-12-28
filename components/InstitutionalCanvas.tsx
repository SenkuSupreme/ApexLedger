'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Pencil, Square, Circle, ArrowRight, Type, Eraser, Hand, Image as ImageIcon, Download, Upload, Trash2 } from 'lucide-react';

// Dynamic import to prevent SSR issues
const Excalidraw = dynamic(
    async () => (await import('@excalidraw/excalidraw')).Excalidraw,
    { ssr: false }
);

interface CanvasElement {
    id: string;
    type: 'image' | 'note';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
}

interface Props {
    elements: CanvasElement[];
    onElementsChange: (elements: CanvasElement[]) => void;
}

export default function InstitutionalCanvas({ elements, onElementsChange }: Props) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    // Load saved elements when component mounts
    useEffect(() => {
        if (excalidrawAPI && elements.length > 0) {
            // Convert our elements to Excalidraw format if needed
            // For now, we'll let Excalidraw manage its own state
        }
    }, [excalidrawAPI, elements]);

    return (
        <div className="w-full h-[85vh] bg-[#030303] rounded-[4rem] border border-white/5 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
            {/* Header Overlay */}
            <div className="absolute top-8 left-8 z-[100] pointer-events-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-500 rounded-2xl shadow-[0_0_40px_rgba(14,165,233,0.4)]">
                        <Pencil size={24} className="text-black" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Strategy Canvas</h2>
                        <p className="text-[9px] font-black text-sky-500/50 uppercase tracking-[0.4em]">Visual Architecture Lab</p>
                    </div>
                </div>
            </div>

            {/* Excalidraw Canvas */}
            <div className="w-full h-full rounded-[4rem] overflow-hidden">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    theme="dark"
                    initialData={{
                        appState: {
                            viewBackgroundColor: '#030303',
                            currentItemStrokeColor: '#0ea5e9',
                            currentItemBackgroundColor: 'transparent',
                            currentItemFillStyle: 'solid',
                            currentItemStrokeWidth: 2,
                            currentItemRoughness: 0,
                            currentItemOpacity: 100,
                            currentItemFontFamily: 1,
                            currentItemFontSize: 20,
                            currentItemTextAlign: 'left',
                            currentItemStrokeStyle: 'solid',
                            currentItemRoundness: 'round',
                        },
                    }}
                    UIOptions={{
                        canvasActions: {
                            changeViewBackgroundColor: true,
                            clearCanvas: true,
                            export: { saveFileToDisk: true },
                            loadScene: true,
                            saveToActiveFile: true,
                            toggleTheme: false,
                        },
                    }}
                />
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute bottom-8 right-8 z-[100] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
                <button 
                    className="p-3 hover:bg-white/10 rounded-xl text-white/60 hover:text-sky-400 transition-all"
                    title="Download Canvas"
                    onClick={() => {
                        if (excalidrawAPI) {
                            const elements = excalidrawAPI.getSceneElements();
                            const blob = new Blob([JSON.stringify(elements)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'strategy-canvas.json';
                            a.click();
                        }
                    }}
                >
                    <Download size={18} />
                </button>
                <div className="h-8 w-[1px] bg-white/10" />
                <button 
                    className="p-3 hover:bg-white/10 rounded-xl text-white/60 hover:text-rose-400 transition-all"
                    title="Clear Canvas"
                    onClick={() => {
                        if (excalidrawAPI && confirm('Clear entire canvas?')) {
                            excalidrawAPI.resetScene();
                        }
                    }}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
