
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    Layout, 
    Target, 
    Shield, 
    Zap, 
    BookOpen, 
    MoreHorizontal, 
    Plus, 
    Image as ImageIcon,
    Trash2,
    Move,
    RotateCw,
    Maximize2,
    ChevronDown,
    ChevronUp,
    ListChecks,
    Globe,
    Briefcase,
    Clock,
    Flame,
    Compass,
    Settings,
    FileText,
    Sparkles,
    GripVertical,
    CheckSquare,
    Type,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Minus,
    List,
    AlertCircle,
    Edit3,
    Code,
    Camera,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import StrategyMindMap from './StrategyMindMap';
import { toast, Toaster } from 'sonner';

// --- TYPES ---

export type BlockType = 'h1' | 'h2' | 'h3' | 'text' | 'todo' | 'callout' | 'divider' | 'image' | 'quote' | 'bullet' | 'code';

export interface Block {
    id: string;
    type: BlockType;
    content: string;
    checked?: boolean;
    metadata?: any;
}

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

interface StrategyData {
    _id?: string;
    name: string;
    isTemplate?: boolean;
    blocks: Block[];
    canvasElements: CanvasElement[];
}

// --- INITIAL TEMPLATES ---

const INSTITUTIONAL_CORE_BLUEPRINT: Block[] = [
    { id: '1', type: 'h1', content: 'Institutional Core Blueprint' },
    { id: '2', type: 'callout', content: 'CODIFYING THE EDGE: This blueprint defines the exact mechanical criteria for market interaction.' },
    
    { id: '3', type: 'h2', content: 'Core Parameters' },
    { id: '4', type: 'bullet', content: 'Market Focus: Forex, Indices, Crypto' },
    { id: '5', type: 'bullet', content: 'Instrument Focus: [e.g. EURUSD, NAS100, BTC]' },
    { id: '6', type: 'todo', content: 'Define HTF Bias Framework (Daily/Weekly)', checked: false },
    { id: '7', type: 'text', content: 'Execution TimeFrame: 5m / 15m' },
    { id: '8', type: 'text', content: 'Confirmation TimeFrame: 1m / 5m' },

    { id: '9', type: 'h2', content: 'Market Dynamics' },
    { id: '10', type: 'text', content: 'Bias Framework: [Describe your HTF structural logic]' },
    { id: '11', type: 'bullet', content: 'Best Sessions to Trade: London Open, New York Session' },
    { id: '12', type: 'callout', content: 'Key Market Conditions: High volatility, clear expansion phases, avoid high-impact news spikes.' },

    { id: '13', type: 'h2', content: 'Technical Setup (The Trigger)' },
    { id: '14', type: 'text', content: 'Setup Name: e.g. BOS + FVG Expansion' },
    { id: '15', type: 'text', content: 'Entry Signal: FVG Fill + LTF Market Structure Shift' },
    { id: '16', type: 'todo', content: 'Confluence 01: Order Block Alignment', checked: false },
    { id: '17', type: 'todo', content: 'Confluence 02: Fair Value Gap / Imbalance', checked: false },
    { id: '18', type: 'todo', content: 'Confluence 03: Liquidity Sweep / Inducement', checked: false },
    { id: '19', type: 'text', content: 'StopLoss Placement: Below/Above dealing range fractal' },
    { id: '20', type: 'text', content: 'Take Profit Management: Target liquidity pools or 2:1 fixed RR' },

    { id: '21', type: 'h2', content: 'Execution Protocol' },
    { id: '22', type: 'todo', content: 'Check HTF Bias Alignment', checked: false },
    { id: '23', type: 'todo', content: 'Check Price of Interest (POI) Reach', checked: false },
    { id: '24', type: 'todo', content: 'Is there Inducement present?', checked: false },
    { id: '25', type: 'text', content: 'Execution Style: Market / Limit / Stop' },
    { id: '26', type: 'callout', content: 'SL Management: Move to Breakeven at 1:1 RR. No exceptions.' },
    { id: '27', type: 'text', content: 'TP Management: Scale out Strategy (e.g. 50% at 2:1)' },

    { id: '28', type: 'h2', content: 'Risk Labs' },
    { id: '29', type: 'bullet', content: 'Risk Strategy: Max 1% risk per trade, max 3 trades per day' },
    { id: '30', type: 'text', content: 'General Risk: Daily Loss Limit (2%), Weekly Target (5%)' },
    { id: '31', type: 'bullet', content: 'Conditions to Avoid: High impact news (CPI/NFP), low volume Asian session' },

    { id: '32', type: 'h2', content: 'Additionals & Synthesis' },
    { id: '33', type: 'todo', content: 'Growth Goals: Master patience, improve execution speed', checked: false },
    { id: '34', type: 'code', content: '// Scenario Analysis\nIf (Market == Consolidating) { Do Not Trade }\nIf (HTF == Bullish && LTF == MSS) { Enter Long }' },
    { id: '35', type: 'text', content: 'Next Improvements: Refine SL on 1m chart' },
    { id: '36', type: 'text', content: 'Notes: Keep an eye on DXY correlations' },
    { id: '37', type: 'bullet', content: 'Resources: TradingView, Forexfactory' },
    { id: '38', type: 'bullet', content: 'Books: Trading in the Zone, ICT Core Content' },
    { id: '39', type: 'image', content: '', metadata: { caption: 'Reference Setup Schematic' } },
];


const BLANK_TEMPLATE: Block[] = [
    { id: '1', type: 'h1', content: 'Untitled System' },
    { id: '2', type: 'text', content: '' },
];

// --- HELPER COMPONENTS ---

const BlockIcon = ({ type }: { type: BlockType }) => {
    switch (type) {
        case 'h1': return <Heading1 size={16} />;
        case 'h2': return <Heading2 size={16} />;
        case 'h3': return <Heading3 size={16} />;
        case 'todo': return <CheckSquare size={16} />;
        case 'callout': return <AlertCircle size={16} />;
        case 'divider': return <Minus size={16} />;
        case 'quote': return <Quote size={16} />;
        case 'bullet': return <List size={16} />;
        case 'image': return <Camera size={16} />;
        case 'code': return <Code size={16} />;
        default: return <Type size={16} />;
    }
};

const AutoResizeTextarea = ({ value, onChange, placeholder, className, onKeyDown }: any) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '0px';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={`w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none overflow-hidden shadow-none ${className}`}
            rows={1}
        />
    );
};

// --- BLOCK COMPONENT ---

const EditorBlock = ({ block, updateBlock, removeBlock, addBlockAbove, isLast }: any) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            updateBlock(block.id, { content: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleTextChange = (v: string) => {
        if (v === "/") setIsMenuOpen(true);
        updateBlock(block.id, { content: v });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBlockAbove(block.id, 'text', true);
        } else if (e.key === 'Backspace' && !block.content) {
            removeBlock(block.id);
        }
    };

    const renderContent = () => {
        switch (block.type) {
            case 'h1':
                return <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-4xl font-black tracking-tight text-white mb-4" placeholder="Heading 1" />;
            case 'h2':
                return <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-2xl font-black tracking-tight text-white/90 mb-2" placeholder="Heading 2" />;
            case 'h3':
                return <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-xl font-bold tracking-tight text-white/80" placeholder="Heading 3" />;
            case 'todo':
                return (
                    <div className="flex items-start gap-3 group/todo w-full">
                        <button 
                            onClick={() => updateBlock(block.id, { checked: !block.checked })}
                            className={`mt-1.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${block.checked ? 'bg-sky-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white/20'}`}
                        >
                            {block.checked && <ListChecks size={14} strokeWidth={3} />}
                        </button>
                        <AutoResizeTextarea 
                            value={block.content} 
                            onChange={handleTextChange} 
                            onKeyDown={handleKeyDown} 
                            className={`text-[15px] font-medium leading-relaxed ${block.checked ? 'text-white/30 line-through' : 'text-white/80'}`} 
                            placeholder="To-do task..." 
                        />
                    </div>
                );
            case 'callout':
                return (
                    <div className="flex items-start gap-4 p-8 bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] w-full">
                        <div className="mt-1 p-2 bg-sky-500/10 text-sky-500 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-[15px] font-medium leading-relaxed text-white/80" placeholder="Important note..." />
                    </div>
                );
            case 'quote':
                return (
                    <div className="pl-6 border-l-4 border-sky-500/50 italic py-2">
                        <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-lg font-medium text-white/70" placeholder="Inspirational quote..." />
                    </div>
                );
            case 'bullet':
                return (
                    <div className="flex items-start gap-3 w-full">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                        <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-[15px] font-medium leading-relaxed text-white/80" placeholder="List item..." />
                    </div>
                );
            case 'divider':
                return <div className="h-[1px] bg-white/10 my-8 w-full" />;
            case 'image':
                return (
                    <div className="space-y-4 w-full group/image-block">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        {block.content ? (
                            <div 
                                className="group/img relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50 resize-x"
                                style={{ 
                                    width: block.metadata?.width || '100%',
                                    maxWidth: '100%',
                                    minWidth: '200px'
                                }}
                            >
                                <img 
                                    src={block.content} 
                                    alt="Strategy Asset" 
                                    className="w-full h-auto object-contain transition-transform duration-700 group-hover/img:scale-[1.01]"
                                    style={{ maxHeight: 'none' }}
                                />
                                
                                {/* Resize Handle */}
                                <div 
                                    className="absolute bottom-2 right-2 w-6 h-6 bg-sky-500/20 hover:bg-sky-500/40 border-2 border-sky-500/50 rounded-lg cursor-nwse-resize opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        const startX = e.clientX;
                                        const startWidth = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
                                        
                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                            const newWidth = startWidth + (moveEvent.clientX - startX);
                                            if (newWidth >= 200 && newWidth <= 1200) {
                                                updateBlock(block.id, { 
                                                    metadata: { 
                                                        ...block.metadata, 
                                                        width: `${newWidth}px` 
                                                    } 
                                                });
                                            }
                                        };
                                        
                                        const handleMouseUp = () => {
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                        };
                                        
                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                    }}
                                >
                                    <div className="w-1 h-1 bg-sky-500 rounded-full" />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/img:opacity-100 transition-all transform translate-y-2 group-hover/img:translate-y-0 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                             <ImageIcon size={16} className="text-white" />
                                         </div>
                                         <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Chart Intel Evidence</p>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <button 
                                             onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, width: '100%' } })} 
                                             className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all shadow-lg active:scale-95 text-[9px] font-black uppercase tracking-wider"
                                         >
                                             Reset Size
                                         </button>
                                         <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-sky-500 hover:bg-sky-400 rounded-xl text-black transition-all shadow-lg active:scale-95">
                                             <Edit3 size={16} />
                                         </button>
                                     </div>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-5 py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] hover:bg-sky-500/[0.03] hover:border-sky-500/30 transition-all text-white/30 hover:text-sky-400 group/upload"
                            >
                                <div className="p-5 bg-white/5 rounded-2xl group-hover/upload:bg-sky-500/10 group-hover/upload:scale-110 transition-all duration-500 border border-white/5 group-hover/upload:border-sky-500/20">
                                    <Camera size={32} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.25em] block mb-1">Architectural Evidence</span>
                                    <span className="text-[9px] text-white/20 uppercase tracking-widest">Inject visual chart confirmation</span>
                                </div>
                            </button>
                        )}
                        <AutoResizeTextarea 
                            value={block.metadata?.caption || ''} 
                            onChange={(v: string) => updateBlock(block.id, { metadata: { ...block.metadata, caption: v } })} 
                            className="text-[11px] font-bold text-center text-white/30 tracking-wide mt-2" 
                            placeholder="Add a structural caption to this asset..." 
                        />
                    </div>
                );
            case 'code':
                return (
                    <div className="group/code relative font-mono text-sm bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/50" />
                        <div className="flex items-center gap-3 mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                            <Code size={12} />
                            <span>Algorithmic Logic / PineScript</span>
                        </div>
                        <AutoResizeTextarea 
                            value={block.content} 
                            onChange={handleTextChange} 
                            onKeyDown={handleKeyDown} 
                            className="text-sky-400 font-mono text-[13px] leading-relaxed" 
                            placeholder="// Paste technical logic here..." 
                        />
                    </div>
                );
            default:
                return <AutoResizeTextarea value={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} className="text-[15px] font-medium leading-relaxed text-white/70" placeholder="Empty block. Type '/' for commands..." />;
        }
    };

    return (
        <Reorder.Item 
            value={block} 
            id={block.id}
            className="group relative flex items-start gap-2 mb-1"
        >
            <div className="opacity-0 group-hover:opacity-100 absolute -left-36 top-0 flex items-center gap-2.5 transition-all duration-300">
                <button 
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
                <div className="cursor-grab p-1.5 text-white/10 hover:text-white hover:bg-white/5 rounded-lg active:cursor-grabbing transition-colors">
                    <GripVertical size={16} />
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 text-white/10 hover:text-sky-500 hover:bg-sky-500/10 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute left-0 top-full mt-2 w-64 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] z-[100] p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-3 py-2 mb-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Transformation Labs</span>
                            </div>
                            {(['h1', 'h2', 'h3', 'text', 'todo', 'callout', 'bullet', 'quote', 'image', 'code', 'divider'] as BlockType[]).map(t => (
                                <button 
                                    key={t}
                                    onClick={() => {
                                        updateBlock(block.id, { type: t });
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-4 transition-all group/item"
                                >
                                    <div className="p-1.5 bg-white/5 rounded-lg group-hover/item:text-sky-400 transition-colors">
                                        <BlockIcon type={t} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="capitalize">{t === 'text' ? 'Paragraph' : t === 'todo' ? 'Checklist' : t === 'image' ? 'Evidence Image' : t === 'code' ? 'Algorithmic Logic' : t}</span>
                                        {t === 'image' && <span className="text-[7px] text-white/20 tracking-normal capitalize mt-0.5">Inject chart assets</span>}
                                        {t === 'code' && <span className="text-[7px] text-white/20 tracking-normal capitalize mt-0.5">Embed PineScript/Logic</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>
        </Reorder.Item>
    );
};

// --- MAIN PAGE ---

export default function NotionStrategyEditor({ strategyId, onBack, initialIsTemplate }: { strategyId?: string, onBack: () => void, initialIsTemplate?: boolean }) {
    const [data, setData] = useState<StrategyData>({
        name: "New Strategy",
        isTemplate: initialIsTemplate || false,
        blocks: [],
        canvasElements: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'editor' | 'map'>('editor');
    const [showTemplatePicker, setShowTemplatePicker] = useState(!strategyId);

    useEffect(() => {
        if (strategyId) {
            fetch(`/api/strategies?id=${strategyId}`)
                .then(res => res.json())
                .then(fetched => {
                    setData({
                        ...fetched,
                        blocks: fetched.blocks?.length ? fetched.blocks : BLANK_TEMPLATE
                    });
                    setShowTemplatePicker(false);
                });
        }
    }, [strategyId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('Saving strategy:', { method: data._id ? 'PUT' : 'POST', data });
            
            const res = await fetch('/api/strategies', {
                method: data._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            console.log('Response status:', res.status);
            const responseText = await res.text();
            console.log('Response body:', responseText);
            
            if (!res.ok) {
                throw new Error(`Failed to save strategy: ${res.status} - ${responseText}`);
            }
            
            const updated = JSON.parse(responseText);
            setData({
                ...updated,
                blocks: updated.blocks || data.blocks || [],
                canvasElements: updated.canvasElements || data.canvasElements || []
            });
            
            toast.success('Strategy Saved', {
                description: 'Your institutional playbook has been synced successfully.',
                duration: 3000,
            });
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Save Failed', {
                description: err instanceof Error ? err.message : 'Unable to sync your strategy. Please try again.',
                duration: 4000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const updateBlock = (id: string, updates: Partial<Block>) => {
        setData(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
    };

    const removeBlock = (id: string) => {
        setData(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== id)
        }));
    };

    const addBlockAt = (id: string, type: BlockType = 'text', after: boolean = true) => {
        setData(prev => {
            const index = prev.blocks.findIndex(b => b.id === id);
            const newBlock: Block = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                content: ''
            };
            const newBlocks = [...prev.blocks];
            newBlocks.splice(after ? index + 1 : index, 0, newBlock);
            return { ...prev, blocks: newBlocks };
        });
    };

    const selectTemplate = (template: Block[]) => {
        setData(prev => ({ ...prev, blocks: template }));
        setShowTemplatePicker(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-sky-500/30 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-3xl border-b border-white/10 px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <button onClick={onBack} className="p-3 hover:bg-white/[0.08] rounded-2xl text-white/80 hover:text-white transition-all border border-transparent hover:border-white/10">
                        <Maximize2 size={20} className="rotate-45" />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <input 
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="bg-transparent border-none p-0 text-3xl font-black placeholder:text-white/20 focus:ring-0 w-[400px] tracking-tight"
                        placeholder="Untitled Strategy"
                    />
                    <button 
                        onClick={() => setData({ ...data, isTemplate: !data.isTemplate })}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${data.isTemplate ? "bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
                        title={data.isTemplate ? "Stored as Blueprint" : "Mark as Blueprint"}
                    >
                        <Sparkles size={16} className={data.isTemplate ? "animate-pulse" : ""} />
                        {data.isTemplate ? "Institutional Blueprint" : "Strategy Mode"}
                    </button>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
                        <button 
                            onClick={() => setActiveSection('editor')}
                            className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeSection === 'editor' ? 'bg-white/10 text-white shadow-2xl' : 'text-white/70 hover:text-white/80'}`}
                        >
                            Blueprint
                        </button>
                        <button 
                            onClick={() => setActiveSection('map')}
                            className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeSection === 'map' ? 'bg-white/10 text-white shadow-2xl' : 'text-white/70 hover:text-white/80'}`}
                        >
                            Synthesis
                        </button>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all shadow-2xl shadow-sky-500/20 active:scale-95"
                    >
                        {isSaving ? 'Synching...' : 'Store System'}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-24 py-32">
                {showTemplatePicker ? (
                    <div className="max-w-3xl mx-auto space-y-12 py-20 text-center animate-in fade-in zoom-in duration-700">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter text-white">Select Architecture</h2>
                            <p className="text-white/40 text-lg font-medium">Choose a structural starting point for your trading system.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <button 
                                onClick={() => selectTemplate(INSTITUTIONAL_CORE_BLUEPRINT)}
                                className="group p-10 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] hover:border-sky-500 transition-all text-left space-y-6 shadow-2xl"
                            >
                                <div className="w-16 h-16 bg-sky-500/10 rounded-[1.5rem] flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                                    <Layout size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white group-hover:text-sky-500 transition-colors">Institutional Core Blueprint</h3>
                                    <p className="text-sm text-white/40 font-medium mt-2 leading-relaxed">Full framework including market bias, execution protocol, and risk labs.</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                    Initialize Framework <ChevronUp className="rotate-90" size={14} />
                                </div>
                            </button>
                            <button 
                                onClick={() => selectTemplate(BLANK_TEMPLATE)}
                                className="group p-10 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] hover:border-white/30 transition-all text-left space-y-6 shadow-2xl"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                                    <Plus size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white group-hover:text-white/80 transition-colors">Empty Canvas</h3>
                                    <p className="text-sm text-white/40 font-medium mt-2 leading-relaxed">Pure Notion-style freestyle editing. Build your playbook from scratch.</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                    Start Fresh <ChevronUp className="rotate-90" size={14} />
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeSection === 'editor' ? (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                <Reorder.Group 
                                    axis="y" 
                                    values={data.blocks} 
                                    onReorder={(newBlocks) => setData({ ...data, blocks: newBlocks })}
                                    className="space-y-0"
                                >
                                    {data.blocks.map((block, idx) => (
                                        <EditorBlock 
                                            key={block.id} 
                                            block={block} 
                                            updateBlock={updateBlock} 
                                            removeBlock={removeBlock}
                                            addBlockAbove={addBlockAt}
                                            isLast={idx === data.blocks.length - 1}
                                        />
                                    ))}
                                </Reorder.Group>
                                
                                <div className="mt-20 pt-20 border-t border-white/5 text-center">
                                    <button 
                                        onClick={() => addBlockAt(data.blocks[data.blocks.length-1]?.id, 'text', true)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                    >
                                        <Plus size={18} /> Append New Content Block
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                <StrategyMindMap blocks={data.blocks} />
                            </div>
                        )}
                    </>
                )}
            </main>
            <Toaster 
                position="bottom-right" 
                theme="dark"
                toastOptions={{
                    style: {
                        background: '#0A0A0A',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                    },
                }}
            />
        </div>
    );
}
