
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    ChevronLeft,
    ChevronRight,
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
    Hash,
    Palette,
    Highlighter,
    Undo,
    Eraser,
    Pipette,
    BarChart2,
    ArrowLeft,
    ArrowRight,
    Save,
    Activity,
    Terminal,
    Command,
    Cpu,
    Workflow
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
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

export interface CanvasElement {
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

export interface NoteData {
    _id?: string;
    title: string;
    isDetailed?: boolean;
    blocks: Block[];
    canvasElements?: CanvasElement[];
    category?: string;
}

// --- INITIAL TEMPLATES ---

const BLANK_TEMPLATE: Block[] = [
    { id: '1', type: 'h1', content: 'Untitled Note' },
    { id: '2', type: 'text', content: 'Start typing your detailed notes here...' },
];

const MARKET_OBSERVATION_TEMPLATE: Block[] = [
    { id: '1', type: 'h1', content: 'Market Observation' },
    { id: '2', type: 'callout', content: '<b>OBJECTIVE:</b> Documenting price behavior and structural shifts for future review.' },
    { id: '3', type: 'h2', content: 'HTF Context' },
    { id: '4', type: 'text', content: 'Historical price action at this level...' },
    { id: '5', type: 'h2', content: 'LTF Behavior' },
    { id: '6', type: 'bullet', content: 'Price swept liquidity at...' },
    { id: '7', type: 'bullet', content: 'Strong displacement identified at...' },
    { id: '8', type: 'divider', content: '' },
    { id: '9', type: 'image', content: '' },
];

const TRADING_LESSON_TEMPLATE: Block[] = [
    { id: '1', type: 'h1', content: 'Trading Lesson' },
    { id: '2', type: 'callout', content: '<b>CORE LESSON:</b> What did this experience teach me about the markets or myself?' },
    { id: '3', type: 'h2', content: 'The Scenario' },
    { id: '4', type: 'text', content: 'Describe what happened...' },
    { id: '5', type: 'h2', content: 'Why it Happened' },
    { id: '6', type: 'text', content: 'Analyze the mechanics and emotions behind the event.' },
    { id: '7', type: 'h2', content: 'Corrective Action' },
    { id: '8', type: 'todo', content: 'Implement new rule: ...', checked: false },
    { id: '9', type: 'todo', content: 'Update checklist with: ...', checked: false },
];

// --- RICH TEXT COMPONENT ---
const FloatingToolbar = () => {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
                setIsVisible(false);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            let parent = range.commonAncestorContainer.parentElement;
            while (parent) {
                if (parent.getAttribute('contenteditable') === 'true') break;
                parent = parent.parentElement;
            }
            if (!parent) {
                setIsVisible(false);
                return;
            }

            setPosition({
                top: rect.top - 60,
                left: rect.left + (rect.width / 2)
            });
            setIsVisible(true);
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    const format = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    if (!isVisible || !position) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ 
                    position: 'fixed', 
                    top: position.top, 
                    left: position.left,
                    transform: 'translateX(-50%)',
                    zIndex: 9999
                }}
                className="flex items-center gap-1 p-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.7)]"
                onMouseDown={(e) => e.preventDefault()}
            >
                <div className="flex items-center gap-0.5">
                    <button onClick={() => format('bold')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Bold">
                        <span className="font-black font-sans">B</span>
                    </button>
                    <button onClick={() => format('italic')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Italic">
                        <span className="italic font-serif">I</span>
                    </button>
                    <button onClick={() => format('underline')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Underline">
                        <span className="underline font-serif underline-offset-4 decoration-white/30">U</span>
                    </button>
                </div>
                <div className="w-[1px] h-5 bg-white/10 mx-1" />
                <button onClick={() => format('undo')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Undo Action">
                    <Undo size={16} />
                </button>
                <div className="w-[1px] h-5 bg-white/10 mx-1" />
                <div className="flex items-center gap-1">
                    <div className="relative group">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-sky-400 transition-colors relative" title="Text Color Picker">
                           <Palette size={16} />
                           <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onInput={(e) => format('foreColor', (e.target as HTMLInputElement).value)} />
                        </button>
                    </div>
                    <div className="relative group">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-amber-400 transition-colors relative" title="Highlight Color Picker">
                           <Highlighter size={16} />
                           <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => format('hiliteColor', e.target.value)} />
                        </button>
                    </div>
                </div>
                <div className="w-[1px] h-5 bg-white/10 mx-1" />
                <button onClick={() => format('removeFormat')} className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-white/40 transition-colors" title="Clear Formatting">
                    <Eraser size={16} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

const ContentBlock = React.forwardRef(({ html, tagName: Tag = 'div', className, onChange, onKeyDown, placeholder, ...props }: any, ref) => {
    const elementRef = useRef<HTMLElement | null>(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current && elementRef.current) {
            elementRef.current.innerHTML = html || '';
            isMounted.current = true;
        }
    }, []);

    useEffect(() => {
        if (elementRef.current && elementRef.current.innerHTML !== html) {
             if (document.activeElement !== elementRef.current) {
                 elementRef.current.innerHTML = html || '';
             }
        }
    }, [html]);

    const handleInput = (e: React.FormEvent<HTMLElement>) => {
        const newHtml = e.currentTarget.innerHTML;
        if (newHtml !== html) {
            onChange(newHtml);
        }
    };

    return (
        <Tag
            ref={(node: HTMLElement | null) => {
                elementRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
            }}
            className={`outline-none min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-white/20 px-1 transition-all duration-200 ${className} [&>b]:text-sky-400 [&>b]:font-black [&>i]:text-purple-400 [&>u]:decoration-sky-500 [&>mark]:bg-amber-500/20 [&>mark]:text-amber-500 [&>mark]:px-1 [&>mark]:rounded-md`}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={onKeyDown}
            data-placeholder={placeholder}
            {...props}
        />
    );
});
ContentBlock.displayName = "ContentBlock";

const BlockIcon = ({ type }: { type: BlockType }) => {
    switch (type) {
        case 'h1': return <Heading1 size={14} strokeWidth={3} />;
        case 'h2': return <Heading2 size={14} strokeWidth={3} />;
        case 'h3': return <Heading3 size={14} strokeWidth={3} />;
        case 'todo': return <CheckSquare size={14} strokeWidth={2.5} />;
        case 'callout': return <AlertCircle size={14} strokeWidth={2.5} />;
        case 'divider': return <Minus size={14} strokeWidth={3} />;
        case 'quote': return <Quote size={14} strokeWidth={2.5} />;
        case 'bullet': return <List size={14} strokeWidth={2.5} />;
        case 'image': return <ImageIcon size={14} strokeWidth={2.5} />;
        case 'code': return <Terminal size={14} strokeWidth={2.5} />;
        default: return <Type size={14} strokeWidth={2.5} />;
    }
};

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, any>(({ value, onChange, placeholder, className, onKeyDown, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const target = (ref as React.MutableRefObject<HTMLTextAreaElement | null>)?.current || internalRef.current;
        if (target) {
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
        }
    }, [value, ref]);

    return (
        <textarea
            ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={`w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 resize-none overflow-hidden shadow-none ${className}`}
            rows={1}
            {...props}
        />
    );
});
AutoResizeTextarea.displayName = "AutoResizeTextarea";

const EditorBlock = React.memo(({ block, updateBlock, removeBlock, addBlockAbove, isLast, isFocused, onImageClick, onFocus }: any) => {
    const dragControls = useDragControls();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isFocused && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isFocused]);

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
        if (v === "/" || v === " /") {
            setIsMenuOpen(true);
        }
        updateBlock(block.id, { content: v });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBlockAbove(block.id, 'text', true);
        } else if (e.key === 'Backspace' && !block.content) {
            e.preventDefault();
            removeBlock(block.id);
        }
    };

    const renderContent = () => {
        switch (block.type) {
            case 'h1':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-5xl font-black tracking-tight text-white mb-10 mt-6" placeholder="Note Title... Type '/' for commands" tagName="h1" />;
            case 'h2':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-3xl font-black tracking-tight text-white/90 mb-6 mt-4" placeholder="Section Header... Type '/' for commands" tagName="h2" />;
            case 'h3':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-xl font-bold tracking-tight text-white/80 mb-4" placeholder="Sub-header... Type '/' for commands" tagName="h3" />;
            case 'todo':
                return (
                    <div className="flex items-start gap-3 group/todo w-full">
                        <button 
                            onClick={() => updateBlock(block.id, { checked: !block.checked })}
                            className={`mt-1.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${block.checked ? 'bg-sky-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white/20'}`}
                        >
                            {block.checked && <ListChecks size={14} strokeWidth={3} />}
                        </button>
                        <ContentBlock 
                            ref={textareaRef}
                            html={block.content} 
                            onChange={handleTextChange} 
                            onKeyDown={handleKeyDown} 
                            onFocus={() => onFocus(block.id)}
                            className={`text-[15px] font-medium leading-relaxed ${block.checked ? 'text-white/30 line-through' : 'text-white/80'}`} 
                            placeholder="To-do... Type '/' for commands" 
                        />
                    </div>
                );
            case 'callout':
                return (
                    <div className="flex items-start gap-6 p-10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] w-full border border-sky-500/5 group/callout hover:bg-sky-500/[0.03] transition-all duration-500">
                        <div className="mt-1 p-3 bg-sky-500/10 text-sky-500 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                            <AlertCircle size={24} />
                        </div>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-base font-medium leading-relaxed text-white/80" placeholder="Important insight... Type '/' for commands" />
                    </div>
                );
            case 'quote':
                return (
                    <div className="pl-10 border-l-[6px] border-sky-500/30 italic py-4 mb-2">
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-xl font-medium text-white/60 leading-relaxed" placeholder="Insightful quote... Type '/' for commands" />
                    </div>
                );
            case 'bullet':
                return (
                    <div className="flex items-start gap-3 w-full">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-[15px] font-medium leading-relaxed text-white/80" placeholder="Bullet point... Type '/' for commands" />
                    </div>
                );
            case 'divider':
                return <div className="h-[2px] bg-white/[0.03] w-full my-12" />;
            case 'image':
                return (
                    <div className="space-y-4 w-full group/image-block">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        {block.content ? (
                            <div 
                                className="group/img relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50 resize-x"
                                style={{ width: block.metadata?.width || '100%', maxWidth: '100%', minWidth: '200px' }}
                            >
                                <img 
                                    src={block.content} 
                                    alt="Note Attachment" 
                                    className="w-full h-auto object-contain transition-transform duration-700 group-hover/img:scale-[1.01] cursor-zoom-in"
                                    onClick={() => onImageClick(block.content)}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/img:opacity-100 transition-all transform translate-y-2 group-hover/img:translate-y-0 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                                             <ImageIcon size={16} className="text-white" />
                                         </div>
                                         <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Attached Image</p>
                                     </div>
                                     <div className="flex items-center gap-2">
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
                                    <ImageIcon size={32} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.25em] block mb-1">Add Image</span>
                                    <span className="text-[9px] text-white/20 uppercase tracking-widest">Attach visual data to your note</span>
                                </div>
                            </button>
                        )}
                    </div>
                );
            case 'code':
                return (
                    <div className="group/code relative font-mono text-sm bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/50" />
                        <div className="flex items-center gap-3 mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                            <Terminal size={12} />
                            <span>Code / Logic</span>
                        </div>
                        <AutoResizeTextarea 
                            value={block.content} 
                            onChange={handleTextChange} 
                            onKeyDown={handleKeyDown} 
                            className="text-sky-400 font-mono text-[13px] leading-relaxed" 
                            placeholder="// Paste code or logic here..." 
                        />
                    </div>
                );
            default:
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-[15px] font-medium leading-relaxed text-white/70" placeholder="Empty block. Type '/' for commands..." />;
        }
    };

    return (
        <Reorder.Item 
            value={block} 
            id={block.id}
            dragListener={false}
            dragControls={dragControls}
            layout="position"
            whileDrag={{ zIndex: 100 }}
            className="group relative flex items-start gap-6 px-10 py-4 rounded-[2.5rem] hover:bg-white/[0.01] transition-colors duration-150 will-change-transform"
        >
            <div className="opacity-0 group-hover:opacity-100 absolute -left-4 -top-6 flex flex-row items-center gap-1 z-30 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 bg-[#0F0F0F] p-1 rounded-xl border border-white/5 shadow-2xl pointer-events-auto">
                <button onClick={() => addBlockAbove(block.id, 'text', true)} className="p-1.5 text-white/40 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all" title="Add block below">
                    <Plus size={14} />
                </button>
                <div onPointerDown={(e) => dragControls.start(e)} className="cursor-grab p-1.5 text-white/40 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg active:cursor-grabbing transition-all border-x border-white/5 px-2" title="Drag to reorder">
                    <GripVertical size={14} />
                </div>
                <button onClick={() => removeBlock(block.id)} className="p-1.5 text-white/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete block">
                    <Trash2 size={14} />
                </button>
                {isMenuOpen && (
                    <div className="absolute left-full ml-4 top-0 w-64 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] z-[100] p-2 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="px-3 py-2 mb-1 border-b border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 italic">Block Selection</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto scrollbar-hide py-1">
                            {(['h1', 'h2', 'h3', 'text', 'todo', 'callout', 'bullet', 'quote', 'image', 'code', 'divider'] as BlockType[]).map(t => (
                                <button 
                                    key={t}
                                    onClick={() => {
                                        updateBlock(block.id, { type: t, content: block.content === '/' || block.content === ' /' ? '' : block.content });
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-4 transition-all group/item"
                                >
                                    <div className="p-1.5 bg-white/5 rounded-lg group-hover/item:text-sky-400 group-hover/item:bg-sky-500/10 transition-all">
                                        <BlockIcon type={t} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="capitalize">{t === 'text' ? 'Paragraph' : t === 'todo' ? 'Checklist' : t === 'image' ? 'Image Attachment' : t === 'bullet' ? 'Unordered List' : t}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>
        </Reorder.Item>
    );
});
EditorBlock.displayName = 'EditorBlock';

export default function NotionNoteEditor({ noteId, onBack }: { noteId?: string, onBack: () => void }) {
    const [data, setData] = useState<NoteData>({
        title: "New Detailed Note",
        isDetailed: true,
        blocks: BLANK_TEMPLATE,
        canvasElements: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(!noteId);

    useEffect(() => {
        if (noteId) {
            fetch(`/api/notes/${noteId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Note not found');
                    return res.json();
                })
                .then(fetched => {
                    const note = fetched.note || fetched;
                    setData({
                        ...note,
                        blocks: note.blocks?.length ? note.blocks : BLANK_TEMPLATE
                    });
                    setShowTemplatePicker(false);
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                    toast.error('Failed to load note');
                    onBack();
                });
        }
    }, [noteId]);

    const handleSave = useCallback(async () => {
        if (isSaving) return;
        
        const toastId = 'save-note';
        setIsSaving(true);
        toast.loading('Synchronizing note...', { id: toastId });
        
        try {
            const url = data._id ? `/api/notes/${data._id}` : '/api/notes';
            const res = await fetch(url, {
                method: data._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!res.ok) throw new Error(`Failed to save note: ${res.status}`);
            
            const updated = await res.json();
            const note = updated.note || updated;
            setData({
                ...note,
                blocks: note.blocks || data.blocks || [],
            });
            
            toast.success('Note Stored', {
                id: toastId,
                description: 'Your detailed note has been synced successfully.',
                duration: 3000,
            });
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Sync Failed', {
                id: toastId,
                description: 'Unable to sync your note. Please try again.',
                duration: 4000,
            });
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, data]);

    const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
        setData(prev => {
            const newBlocks = prev.blocks.map(b => b.id === id ? { ...b, ...updates } : b);
            let newTitle = prev.title;
            if (prev.blocks[0]?.id === id && updates.content !== undefined) {
                newTitle = updates.content.replace(/<[^>]*>/g, '') || "NEW NOTE";
            }
            return {
                ...prev,
                blocks: newBlocks,
                title: newTitle
            };
        });
    }, []);

    const removeBlock = useCallback((id: string) => {
        setData(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== id)
        }));
    }, []);

    const addBlockAt = useCallback((id: string, type: BlockType = 'text', after: boolean = true) => {
        const newId = Math.random().toString(36).substr(2, 9);
        setData(prev => {
            const index = prev.blocks.findIndex(b => b.id === id);
            const newBlock: Block = { id: newId, type, content: '' };
            const newBlocks = [...prev.blocks];
            newBlocks.splice(after ? index + 1 : index, 0, newBlock);
            return { ...prev, blocks: newBlocks };
        });
        setFocusedBlockId(newId);
    }, []);

    const selectTemplate = (template: Block[]) => {
        const title = template[0]?.type === 'h1' ? template[0].content.replace(/<[^>]*>/g, '') : data.title;
        setData(prev => ({ 
            ...prev, 
            blocks: template,
            title: title
        }));
        setShowTemplatePicker(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
            <FloatingToolbar />
            <header className="bg-[#050505]/40 border-b border-white/5 px-12 h-32 flex items-center justify-between w-full shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-6 md:gap-8">
                    <button onClick={onBack} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group shadow-lg">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-12 w-px bg-white/5" />
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                                <div className="w-1 h-1 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 italic">Detailed Intel Active</span>
                            </div>
                        </div>
                        <input 
                            value={data.title}
                            onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-transparent border-none p-0 text-4xl font-black italic uppercase tracking-tighter text-white/50 cursor-text focus:ring-0 w-full max-w-[600px] leading-tight truncate outline-none"
                            placeholder="NOTE IDENTIFIER"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-8 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_10px_40px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_50px_rgba(14,165,233,0.5)] active:scale-95 flex items-center gap-3 group"
                    >
                        <Save size={16} className={isSaving ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
                        {isSaving ? 'Syncing...' : 'Storage Protocol'}
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-24">
                {showTemplatePicker ? (
                    <div className="max-w-3xl mx-auto space-y-12 py-20 text-center animate-in fade-in zoom-in duration-700">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">Select Note Architecture</h2>
                            <p className="text-muted-foreground/40 text-lg font-medium">Choose a structural starting point for your detailed notes.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => selectTemplate(BLANK_TEMPLATE)} className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-white/20 hover:bg-zinc-800/50 transition-all text-left flex flex-col justify-between rounded-3xl min-h-[250px] shadow-2xl">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 group-hover:scale-110 transition-transform border border-white/10"><Plus size={24} /></div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-black text-white/90">Blank Slate</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Pure freestyle architecture. Build from scratch.</p>
                                </div>
                            </button>
                            <button onClick={() => selectTemplate(MARKET_OBSERVATION_TEMPLATE)} className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[250px] shadow-2xl">
                                <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform border border-sky-500/20"><Activity size={24} /></div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-sky-400">Market Observation</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Document price action behavior and structural shifts.</p>
                                </div>
                            </button>
                            <button onClick={() => selectTemplate(TRADING_LESSON_TEMPLATE)} className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[250px] shadow-2xl">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform border border-purple-500/20"><BookOpen size={24} /></div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-purple-400">Trading Lesson</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Record key takeaways and psychological breakthroughs.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <Reorder.Group 
                            axis="y" 
                            values={data.blocks} 
                            onReorder={(newBlocks) => setData(prev => ({ ...prev, blocks: newBlocks }))}
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
                                    isFocused={focusedBlockId === block.id}
                                    onFocus={setFocusedBlockId}
                                    onImageClick={setActiveImage}
                                />
                            ))}
                        </Reorder.Group>
                        <div className="mt-20 pt-20 border-t border-border text-center">
                            <button 
                                onClick={() => addBlockAt(data.blocks[data.blocks.length-1]?.id, 'text', true)}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-foreground/5 hover:bg-foreground/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-all"
                            >
                                <Plus size={18} /> Append New Content Block
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Toaster position="bottom-right" theme="dark" />
            <AnimatePresence>
                {activeImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 md:p-12" onClick={() => setActiveImage(null)}>
                        <img src={activeImage} alt="Attachment" className="max-w-full max-h-full object-contain rounded-3xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
