
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    ArrowLeft,
    ArrowRight,
    Terminal,
    Copy,
    BarChart2,
    Save,
    Activity,
    Command,
    Cpu,
    Workflow,
    Table as TableIcon,
    ChevronRight as ChevronRightIcon,
    Link2,
    ExternalLink,
    X
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { toast, Toaster } from 'sonner';

// --- TYPES ---

export type BlockType = 'h1' | 'h2' | 'h3' | 'text' | 'todo' | 'callout' | 'divider' | 'image' | 'quote' | 'bullet' | 'code' | 'table' | 'toggle' | 'number' | 'bookmark';

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
    const [activeStyles, setActiveStyles] = useState({ bold: false, italic: false, underline: false });

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setIsVisible(false);
                return;
            }

            // Check active styles
            setActiveStyles({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline')
            });

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

            const toolbarHeight = 60;
            const topPos = rect.top - toolbarHeight;
            
            // If there's no space above, show it below the selection
            const finalTop = topPos < 10 ? rect.bottom + 10 : topPos;

            setPosition({
                top: finalTop,
                left: Math.max(150, Math.min(rect.left + (rect.width / 2), window.innerWidth - 150))
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
                    <button 
                        onClick={() => format('bold')} 
                        className={`p-2 rounded-lg transition-colors ${activeStyles.bold ? 'bg-sky-500/20 text-sky-400' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                        title="Bold"
                    >
                        <span className="font-black font-sans">B</span>
                    </button>
                    <button 
                        onClick={() => format('italic')} 
                        className={`p-2 rounded-lg transition-colors ${activeStyles.italic ? 'bg-sky-500/20 text-sky-400' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                        title="Italic"
                    >
                        <span className="italic font-serif">I</span>
                    </button>
                    <button 
                        onClick={() => format('underline')} 
                        className={`p-2 rounded-lg transition-colors ${activeStyles.underline ? 'bg-sky-500/20 text-sky-400' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                        title="Underline"
                    >
                        <span className="underline font-serif underline-offset-4 decoration-white/30">U</span>
                    </button>
                </div>
                <div className="w-[1px] h-5 bg-white/10 mx-1" />
                <button onClick={() => format('undo')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Undo Action">
                    <Undo size={16} />
                </button>
                <div className="flex items-center gap-1 px-1">
                    <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                        <div className="relative group">
                            <button className="p-2 hover:bg-white/10 rounded-lg text-sky-400 transition-colors relative" title="Custom Text Color">
                               <Palette size={14} />
                               <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onInput={(e) => format('foreColor', (e.target as HTMLInputElement).value)} />
                            </button>
                        </div>
                        <div className="flex gap-1">
                            {['#ffffff', '#38bdf8', '#4ade80', '#fb7185', '#fbbf24'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => format('foreColor', color)}
                                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={`Text: ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="relative group">
                            <button className="p-2 hover:bg-white/10 rounded-lg text-amber-400 transition-colors relative" title="Custom Highlight">
                               <Highlighter size={14} />
                               <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => format('hiliteColor', e.target.value)} />
                            </button>
                        </div>
                        <div className="flex gap-1">
                            {['#0c4a6e', '#064e3b', '#7f1d1d', '#78350f', '#581c87'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => format('hiliteColor', color)}
                                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={`Highlight: ${color}`}
                                />
                            ))}
                        </div>
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

    const [prediction, setPrediction] = useState('');
    const predictionTimeout = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (predictionTimeout.current) clearTimeout(predictionTimeout.current);
        };
    }, []);

    const fetchPrediction = useCallback(async (text: string) => {
        if (text.trim().length < 5) return;
        try {
            const res = await fetch('/api/ai/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: text })
            });
            const data = await res.json();
            if (data.completion && document.activeElement === elementRef.current) {
                setPrediction(data.completion);
            }
        } catch (err) {
            console.error('Prediction error:', err);
        }
    }, []);

    const handleInput = (e: React.FormEvent<HTMLElement>) => {
        const newHtml = e.currentTarget.innerHTML;
        const text = e.currentTarget.textContent || '';
        
        if (newHtml !== html) {
            onChange(newHtml);
        }

        // Ensure the typing area stays visible and centered if it's near the bottom
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If the cursor is below 70% of the screen, scroll it to center
            if (rect.bottom > viewportHeight * 0.7) {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Clear existing prediction
        setPrediction('');
        if (predictionTimeout.current) clearTimeout(predictionTimeout.current);

        // Fetch new prediction after pause
        predictionTimeout.current = setTimeout(() => {
            fetchPrediction(text);
        }, 800);
    };

    const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Tab' && prediction) {
            e.preventDefault();
            e.stopPropagation();
            
            // Insert the prediction
            document.execCommand('insertText', false, prediction);
            setPrediction('');
            return;
        }
        if (onKeyDown) onKeyDown(e);
    };

    return (
        <Tag
            ref={(node: HTMLElement | null) => {
                elementRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
            }}
            className={`outline-none min-h-[1.5em] focus:empty:before:content-[attr(data-placeholder)] empty:before:text-white/20 px-1 transition-all duration-200 ${className} [&>b]:font-black [&>i]:italic [&>u]:underline [&>mark]:bg-amber-500/20 [&>mark]:text-amber-500 [&>mark]:px-2 [&>mark]:py-0.5 [&>mark]:mx-0.5 [&>mark]:rounded-[2px_10px_4px_8px/8px_3px_10px_2px] [&>mark]:[box-decoration-break:clone] [&_*[style*="background-color"]]:px-2 [&_*[style*="background-color"]]:py-0.5 [&_*[style*="background-color"]]:mx-0.5 [&_*[style*="background-color"]]:rounded-[2px_12px_3px_15px/15px_3px_12px_2px] [&_*[style*="background-color"]]:[box-decoration-break:clone] [&_*[style*="background-color"]]:[-webkit-box-decoration-break:clone] relative after:content-[attr(data-prediction)] after:text-white/20 after:pointer-events-none after:absolute after:pl-1`}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDownInternal}
            data-prediction={prediction}
            onPaste={(e: React.ClipboardEvent) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            }}
            onFocus={() => {
                if (props.onFocus) props.onFocus();
            }}
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
        case 'table': return <TableIcon size={14} strokeWidth={2.5} />;
        case 'toggle': return <ChevronRightIcon size={14} strokeWidth={3} />;
        case 'number': return <span className="text-[10px] font-black">1.</span>;
        case 'bookmark': return <Link2 size={14} strokeWidth={2.5} />;
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
            onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                // Remove formatting, force simple text, replace CRLF with LF
                const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                // Insert at cursor position or replace selection
                const target = e.target as HTMLTextAreaElement;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const newValue = value.substring(0, start) + cleanText + value.substring(end);
                 
                onChange(newValue);
                setTimeout(() => {
                    if (target) {
                        target.selectionStart = target.selectionEnd = start + cleanText.length;
                    }
                }, 0);
            }}
            {...props}
        />
    );
});
AutoResizeTextarea.displayName = "AutoResizeTextarea";

const EditorBlock = React.memo(({ block, updateBlock, removeBlock, addBlockAt, isLast, isFocused, onImageClick, onFocus, onRemoveWithFocus, blockIndex, allBlocks, triggerSave }: any) => {
    const dragControls = useDragControls();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, bottom: 0, left: 0, showAbove: false });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<any>(null);
    const menuButtonRef = useRef<HTMLDivElement>(null);
    const blockRef = useRef<HTMLLIElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isFocused && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end of content
            const range = document.createRange();
            const sel = window.getSelection();
            if (textareaRef.current.childNodes.length > 0) {
                range.selectNodeContents(textareaRef.current);
                range.collapse(false); // false = collapse to end
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }
    }, [isFocused]);

    // Update menu position when it opens - check viewport bounds
    useEffect(() => {
        if (isMenuOpen && blockRef.current) {
            const rect = blockRef.current.getBoundingClientRect();
            const minMenuHeight = 250; 
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom - 20;
            const spaceAbove = rect.top - 20;
            
            // Determine if menu should show above or below
            // Determine if menu should show above or below
            // If space below is tight (less than 500px), show above, provided there is space.
            const showAbove = spaceBelow < 500 && spaceAbove > spaceBelow;
            
            setMenuPosition({
                top: rect.top,
                bottom: rect.bottom,
                left: Math.max(20, Math.min(rect.left, window.innerWidth - 300)),
                showAbove
            });
        }
    }, [isMenuOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        if (isMenuOpen) {
            const handleClickOutside = (e: MouseEvent) => {
                if (
                    blockRef.current && !blockRef.current.contains(e.target as Node) &&
                    menuRef.current && !menuRef.current.contains(e.target as Node)
                ) {
                    setIsMenuOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const toastId = toast.loading('Uploading Intel Attachment...');
        
        try {
            // 1. Get Signature from our institutional gateway
            const sigRes = await fetch('/api/upload/signature');
            if (!sigRes.ok) throw new Error('Could not obtain upload signature');
            const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

            // 2. Perform direct neural upload to Cloudinary (Bypassing Vercel Origin)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);
            
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            
            if (!res.ok) throw new Error('Cloud storage rejection');
            
            const { secure_url } = await res.json();
            updateBlock(block.id, { content: secure_url });
            toast.success('Evidence Stored in Cloud (Direct Sync)', { id: toastId });
            
            if (triggerSave) {
                setTimeout(() => triggerSave(true), 100);
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Upload Failed. Using local fallback.', { id: toastId });
            
            // Fallback to base64 if upload fails (though not ideal)
            const reader = new FileReader();
            reader.onloadend = () => {
                updateBlock(block.id, { content: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTextChange = (v: string) => {
        const plainText = v.replace(/<[^>]*>/g, '').trim();
        if (plainText === "/") {
            setIsMenuOpen(true);
        } else if (!plainText.startsWith("/")) {
            setIsMenuOpen(false);
        }

        updateBlock(block.id, { content: v });
    };

    const calculateListNumber = (currentIndex: number) => {
        let count = 1;
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (allBlocks[i].type === 'number') {
                count++;
            } else {
                break;
            }
        }
        return count;
    };

    const SLASH_COMMANDS: Record<string, BlockType> = {
        '/h1': 'h1',
        '/h2': 'h2',
        '/h3': 'h3',
        '/text': 'text',
        '/todo': 'todo',
        '/check': 'todo',
        '/checklist': 'todo',
        '/bullet': 'bullet',
        '/list': 'bullet',
        '/callout': 'callout',
        '/quote': 'quote',
        '/code': 'code',
        '/div': 'divider',
        '/divider': 'divider',
        '/img': 'image',
        '/image': 'image',
        '/table': 'table',
        '/toggle': 'toggle',
        '/collapsible': 'toggle',
        '/number': 'number',
        '/numbered': 'number',
        '/bookmark': 'bookmark',
        '/link': 'bookmark'
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
             if (document.queryCommandState('bold')) document.execCommand('bold', false);
             if (document.queryCommandState('italic')) document.execCommand('italic', false);
             if (document.queryCommandState('underline')) document.execCommand('underline', false);
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const command = block.content.replace(/<[^>]*>/g, '').trim().toLowerCase();
            
            if (SLASH_COMMANDS[command]) {
                updateBlock(block.id, { type: SLASH_COMMANDS[command], content: '' });
                setIsMenuOpen(false);
                return;
            }

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && textareaRef.current) {
                const range = selection.getRangeAt(0);
                
                // Get the content before and after the cursor
                const preRange = range.cloneRange();
                preRange.selectNodeContents(textareaRef.current);
                preRange.setEnd(range.startContainer, range.startOffset);
                
                const postRange = range.cloneRange();
                postRange.selectNodeContents(textareaRef.current);
                postRange.setStart(range.startContainer, range.startOffset);
                
                const leftHtml = document.createElement('div');
                leftHtml.appendChild(preRange.cloneContents());
                
                const rightHtml = document.createElement('div');
                rightHtml.appendChild(postRange.cloneContents());

                // Update current block state and DOM
                const leftContent = leftHtml.innerHTML;
                if (textareaRef.current) {
                    textareaRef.current.innerHTML = leftContent;
                }
                updateBlock(block.id, { content: leftContent });
                
                // Add new block with the remaining content
                const newType = ['bullet', 'number', 'todo'].includes(block.type) ? block.type : 'text';
                addBlockAt(block.id, newType, true, rightHtml.innerHTML);
            } else {
                const newType = ['bullet', 'number', 'todo'].includes(block.type) ? block.type : 'text';
                addBlockAt(block.id, newType, true, '');
            }
        } else if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && textareaRef.current) {
                const range = selection.getRangeAt(0);
                
                // Check if we are at the very beginning of the block
                let isAtStart = range.startOffset === 0;
                if (isAtStart) {
                    let node = range.startContainer;
                    while (node && node !== textareaRef.current) {
                        if (node.previousSibling) {
                            isAtStart = false;
                            break;
                        }
                        node = node.parentNode!;
                    }
                }

                if (isAtStart && selection.isCollapsed) {
                    e.preventDefault();
                    if (blockIndex > 0) {
                        const prevBlock = allBlocks[blockIndex - 1];
                        const textLike = ['text', 'h1', 'h2', 'h3', 'bullet', 'number', 'todo', 'quote', 'callout'];
                        
                        if (textLike.includes(block.type) && textLike.includes(prevBlock.type)) {
                            updateBlock(prevBlock.id, { content: prevBlock.content + block.content });
                            onRemoveWithFocus(block.id, blockIndex - 1);
                        } else if (!block.content.replace(/<[^>]*>/g, '').trim()) {
                            onRemoveWithFocus(block.id, blockIndex - 1);
                        }
                    } else if (block.type !== 'text') {
                        updateBlock(block.id, { type: 'text' });
                    }
                }
            }
        } else if (e.key === 'ArrowUp') {
            // Navigate to previous block when at the beginning of content
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Check if cursor is at the start (offset 0 and at first node)
                if (range.startOffset === 0 && blockIndex > 0) {
                    const isAtStart = !range.startContainer.previousSibling || 
                        (range.startContainer === textareaRef.current && range.startOffset === 0);
                    if (isAtStart) {
                        e.preventDefault();
                        onFocus(null); // Trigger parent to focus previous
                        onRemoveWithFocus(null, blockIndex - 1); // Just focus, don't remove
                    }
                }
            }
        } else if (e.key === 'ArrowDown') {
            // Navigate to next block when at the end of content
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textLength = textareaRef.current?.textContent?.length || 0;
                // Check if at end of content
                if (range.endOffset >= textLength || 
                    (range.endContainer === textareaRef.current && 
                     range.endOffset === textareaRef.current.childNodes.length)) {
                    // Let parent handle focus to next block
                    // This is handled naturally by focus flow
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (block.type === 'code') {
                const target = textareaRef.current as any;
                if (target && typeof target.selectionStart === 'number') {
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const val = block.content;
                    const newVal = val.substring(0, start) + '    ' + val.substring(end);
                    handleTextChange(newVal);
                    setTimeout(() => {
                        target.setSelectionRange(start + 4, start + 4);
                    }, 0);
                }
            } else {
                document.execCommand('insertText', false, '    ');
            }
        }
    };

    const renderContent = () => {
        switch (block.type) {
            case 'h1':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-4xl md:text-6xl font-black tracking-tight text-white mb-8 mt-6" placeholder="Directive Header..." tagName="h1" />;
            case 'h2':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-3xl md:text-4xl font-black tracking-tight text-white/90 mb-6 mt-4" placeholder="Sub-System Detail..." tagName="h2" />;
            case 'h3':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-xl md:text-2xl font-bold tracking-tight text-white/80 mb-4 mt-2" placeholder="Component Logic..." tagName="h3" />;
            case 'todo':
                return (
                    <div className="flex items-start gap-4 group/todo w-full">
                        <button 
                            onClick={() => updateBlock(block.id, { checked: !block.checked })}
                            className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${block.checked ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white/30'}`}
                        >
                            {block.checked && <ListChecks size={14} strokeWidth={3} />}
                        </button>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className={`text-lg font-medium leading-relaxed ${block.checked ? 'text-white/40 line-through' : 'text-white/90'}`} placeholder="Verification step..." />
                    </div>
                );
            case 'callout':
                return (
                    <div className="flex items-center gap-6 p-8 md:p-12 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] w-full border border-sky-500/10 group/callout hover:bg-sky-500/[0.05] transition-all duration-500">
                        <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.15)] group-hover/callout:scale-110 transition-transform">
                            <AlertCircle size={24} />
                        </div>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-lg font-medium leading-relaxed text-white/90" placeholder="Operational mandate..." />
                    </div>
                );
            case 'number':
                return (
                    <div className="flex items-start gap-3 w-full">
                        <div className="mt-1.5 text-[11px] font-black text-sky-500/60 shrink-0 w-5 select-none">{calculateListNumber(blockIndex)}.</div>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-lg font-medium leading-relaxed text-white/90" placeholder="Step in series..." />
                    </div>
                );
            case 'toggle':
                const isOpen = block.metadata?.isOpen ?? false;
                return (
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 group/toggle-head">
                            <button 
                                onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, isOpen: !isOpen } })}
                                className={`p-1.5 hover:bg-white/10 rounded-lg transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} text-white/30 hover:text-white`}
                            >
                                <ChevronRightIcon size={14} />
                            </button>
                            <ContentBlock 
                                ref={textareaRef} 
                                html={block.content} 
                                onChange={handleTextChange} 
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        updateBlock(block.id, { metadata: { ...block.metadata, isOpen: true } });
                                        // Focus logic would ideally go here, but for now we open it
                                    } else {
                                        handleKeyDown(e);
                                    }
                                }} 
                                onFocus={() => onFocus(block.id)} 
                                className="text-lg font-bold text-white/90 flex-1" 
                                placeholder="Toggle Header..." 
                            />
                        </div>
                        {isOpen && (
                            <div className="pl-8 border-l border-white/5 space-y-2 ml-3">
                                <ContentBlock 
                                    html={block.metadata?.details || ''} 
                                    onChange={(v: string) => updateBlock(block.id, { metadata: { ...block.metadata, details: v } })} 
                                    className="text-[16px] leading-relaxed text-white/70 min-h-[1.5em]" 
                                    placeholder="Nested details..." 
                                />
                            </div>
                        )}
                    </div>
                );
            case 'quote':
                return (
                    <div className="pl-10 border-l-[6px] border-sky-500/40 italic py-6 mb-4 bg-sky-500/[0.03] backdrop-blur-md rounded-r-[2rem] relative overflow-hidden group/quote">
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] opacity-50 group-hover/quote:opacity-100 transition-opacity" />
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-xl font-medium text-white/90 leading-relaxed drop-shadow-sm" placeholder="Institutional wisdom..." />
                    </div>
                );
            case 'bullet':
                return (
                    <div className="flex items-start gap-3 w-full group/bullet">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.5)] group-hover/bullet:scale-125 transition-transform" />
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-lg font-medium leading-relaxed text-white/90" placeholder="Bullet point..." />
                    </div>
                );
            case 'code':
                return (
                    <div className="group/code relative font-mono text-sm bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 overflow-hidden border border-white/5">
                        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/50" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                                <Terminal size={12} />
                                <span>Algorithmic Logic / PineScript</span>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(block.content);
                                    toast.success('Strategy Logic Copied');
                                }}
                                className="opacity-0 group-hover/code:opacity-100 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-all shadow-xl"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                        <AutoResizeTextarea 
                            ref={textareaRef}
                            value={block.content} 
                            onChange={handleTextChange} 
                            onKeyDown={handleKeyDown} 
                            className="text-sky-400 font-mono text-[13px] leading-relaxed" 
                            placeholder="// Paste technical logic here..." 
                        />
                    </div>
                );
            case 'bookmark':
                return (
                    <div className="group/bookmark relative w-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-[2.5rem] p-8 md:p-12 flex items-center gap-8 group/link">
                        <div className="p-5 bg-sky-500/10 rounded-[2rem] text-sky-400 group-hover/link:scale-110 transition-transform">
                            <Link2 size={28} />
                        </div>
                        <div className="flex-1">
                            <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-lg font-bold text-white mb-2" placeholder="Paste URL or link title..." />
                            <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/50 group-hover:text-sky-400 transition-colors">Institutional Web Resource</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-full text-white/20 opacity-0 group-hover/bookmark:opacity-100 transition-opacity">
                            <ExternalLink size={16} />
                        </div>
                    </div>
                );
            case 'divider':
                return <div className="h-[1px] bg-white/[0.03] w-full my-6" />;
            case 'image':
                return (
                    <div className="space-y-4 w-full group/image-block relative z-0">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        {block.content ? (
                            <div 
                                className="group/img relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50"
                                style={{ 
                                    width: block.metadata?.width || '100%',
                                    maxWidth: '100%',
                                    minWidth: '200px',
                                    margin: '0 auto'
                                }}
                            >
                                <img 
                                    src={block.content} 
                                    alt="Attachment" 
                                    draggable="false"
                                    className="w-full h-auto object-contain transition-transform duration-700 group-hover/img:scale-[1.01] cursor-zoom-in select-none"
                                    style={{ maxHeight: 'none' }}
                                    onClick={() => onImageClick(block.content)}
                                />
                                
                                {/* Notion-style Edge Resize Handles */}
                                <div 
                                    className="absolute inset-y-0 right-0 w-2 hover:w-4 bg-sky-500/0 hover:bg-sky-500/20 cursor-ew-resize transition-all z-[60] flex items-center justify-center group/side-resizer"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        const startX = e.clientX;
                                        const startWidth = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
                                        const handleMouseMove = (mv: MouseEvent) => {
                                            const newWidth = startWidth + (mv.clientX - startX) * 2;
                                            if (newWidth >= 200 && newWidth <= 1200) {
                                                updateBlock(block.id, { metadata: { ...block.metadata, width: `${newWidth}px` } });
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
                                    <div className="w-1 h-12 bg-sky-500/30 rounded-full opacity-0 group-hover/side-resizer:opacity-100 transition-opacity" />
                                </div>

                                <div 
                                    className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-all transform translate-y-4 group-hover/img:translate-y-0 flex items-center justify-between pointer-events-none"
                                >
                                    <div className="flex items-center gap-4 pointer-events-auto">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white/70 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-white/10"
                                        >
                                            Modify Intel
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateBlock(block.id, { metadata: { ...block.metadata, width: '100%'} });
                                            }}
                                            className="px-6 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 backdrop-blur-md rounded-xl text-sky-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-sky-500/20"
                                        >
                                            Reset Grid
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeBlock(block.id);
                                            }}
                                            className="px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 backdrop-blur-md rounded-xl text-rose-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-rose-500/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onImageClick(block.content);
                                        }}
                                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/40 hover:text-white transition-all pointer-events-auto cursor-pointer border border-white/10 shadow-2xl"
                                    >
                                        <Maximize2 size={16} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-sky-500/40 hover:bg-sky-500/[0.02] transition-all cursor-pointer group/upload"
                            >
                                <div className="p-5 bg-white/5 rounded-[2rem] text-white/20 group-hover/upload:text-sky-400 group-hover/upload:bg-sky-500/10 transition-all ring-1 ring-white/10 group-hover/upload:ring-sky-500/20 translate-y-2 group-hover/upload:translate-y-0">
                                    <Camera size={28} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 group-hover/upload:text-white/60 transition-colors">Capture Intelligence Evidence</p>
                                    <p className="text-[9px] font-medium text-white/10 mt-1">Select valid chart asset or data visualization</p>
                                </div>
                            </div>
                        )}
                        <AutoResizeTextarea 
                            value={block.metadata?.caption || ''} 
                            onChange={(v: string) => updateBlock(block.id, { metadata: { ...block.metadata, caption: v } })} 
                            className="text-[11px] font-bold text-center text-white/30 tracking-wide mt-2" 
                            placeholder="Add a caption to this image..." 
                        />
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
            case 'table':
                const rows = block.metadata?.rows || 3;
                const cols = block.metadata?.cols || 3;
                const tableData = block.metadata?.data || Array(rows).fill(0).map(() => Array(cols).fill(''));

                return (
                    <div className="w-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group/table">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                                <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                                    <TableIcon size={16} />
                                </div>
                                <span>Architecture Data Matrix</span>
                            </div>
                            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 opacity-0 group-hover/table:opacity-100 transition-opacity gap-1">
                                <button 
                                    onClick={() => {
                                        const newData = tableData.map((r: any) => [...r, '']);
                                        updateBlock(block.id, { metadata: { ...block.metadata, cols: cols + 1, data: newData } });
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-sky-400 hover:text-sky-300 transition-all text-[9px] font-black uppercase tracking-wider px-3"
                                >
                                    + Col
                                </button>
                                <button 
                                    disabled={cols <= 1}
                                    onClick={() => {
                                        if (cols <= 1) return;
                                        const newData = tableData.map((r: any) => r.slice(0, -1));
                                        updateBlock(block.id, { metadata: { ...block.metadata, cols: cols - 1, data: newData } });
                                    }}
                                    className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400/60 hover:text-rose-400 transition-all text-[9px] font-black uppercase tracking-wider px-3 disabled:opacity-20"
                                >
                                    - Col
                                </button>
                                <div className="w-[1px] h-4 bg-white/10 self-center mx-1" />
                                <button 
                                    onClick={() => {
                                        const newData = [...tableData, Array(cols).fill('')];
                                        updateBlock(block.id, { metadata: { ...block.metadata, rows: rows + 1, data: newData } });
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-sky-400 hover:text-sky-300 transition-all text-[9px] font-black uppercase tracking-wider px-3"
                                >
                                    + Row
                                </button>
                                <button 
                                    disabled={rows <= 1}
                                    onClick={() => {
                                        if (rows <= 1) return;
                                        const newData = tableData.slice(0, -1);
                                        updateBlock(block.id, { metadata: { ...block.metadata, rows: rows - 1, data: newData } });
                                    }}
                                    className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400/60 hover:text-rose-400 transition-all text-[9px] font-black uppercase tracking-wider px-3 disabled:opacity-20"
                                >
                                    - Row
                                </button>
                            </div>
                         </div>
                         <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full border-collapse">
                                <tbody>
                                    {tableData.map((row: any, rIdx: number) => (
                                        <tr key={rIdx} className="group/row">
                                            {row.map((cell: string, cIdx: number) => (
                                                <td key={cIdx} className="border border-white/5 p-0 min-w-[120px]">
                                                    <ContentBlock 
                                                        html={cell}
                                                        onChange={(v: string) => {
                                                            const newData = [...tableData];
                                                            newData[rIdx][cIdx] = v;
                                                            updateBlock(block.id, { metadata: { ...block.metadata, data: newData } });
                                                        }}
                                                        onFocus={() => onFocus(block.id)}
                                                        className="p-4 text-xs font-medium text-white/70 focus:bg-white/[0.03] transition-colors"
                                                        placeholder="Data cell..."
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                );
            default:
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-[15px] font-medium leading-relaxed text-white/70" placeholder="Empty block. Type '/' for commands..." />;
        }
    };

    return (
        <Reorder.Item 
            ref={blockRef}
            value={block} 
            id={block.id}
            dragListener={false}
            dragControls={dragControls}
            layout="position"
            whileDrag={{ 
                scale: 1, // Keep scale at 1 to avoid shifting the cursor relative to the handle
                backgroundColor: 'rgba(255,255,255,0.05)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                zIndex: 999 // Critical: Higher z-index to stay on top
            }}
            transition={{ 
                type: "spring", 
                stiffness: 1200, // Faster snap
                damping: 80,
                mass: 0.1
            }}
            style={{ zIndex: isMenuOpen ? 1000 : 1, touchAction: 'none' }}
            className="group/block relative flex items-start gap-6 px-10 py-2 rounded-[2rem] hover:bg-white/[0.02] transition-colors duration-150 will-change-transform overflow-visible"
        >
            <div className="absolute left-[-80px] top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 lg:group-hover/block:opacity-100 transition-all duration-300 z-[100] translate-x-4 lg:group-hover/block:translate-x-0">
                <div 
                    onPointerDown={(e) => {
                        dragControls.start(e);
                    }}
                    className="p-2 hover:bg-sky-500/20 rounded-xl cursor-grab active:cursor-grabbing text-white/30 hover:text-sky-400 transition-all flex items-center justify-center shrink-0"
                    title="Drag to Move"
                >
                    <GripVertical size={16} strokeWidth={3} />
                </div>
                <button 
                    onClick={() => addBlockAt(block.id, 'text', false)}
                    className="p-2 hover:bg-white/10 rounded-xl text-white/20 hover:text-white transition-all flex items-center justify-center"
                    title="Add Block Above"
                >
                    <Plus size={16} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => removeBlock(block.id)}
                    className="p-2 hover:bg-rose-500/10 rounded-xl text-white/20 hover:text-rose-400 transition-all flex items-center justify-center"
                    title="Delete Block"
                >
                    <Trash2 size={16} strokeWidth={3} />
                </button>
            </div>
            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>
            
            {typeof window !== 'undefined' && isMenuOpen && createPortal(
                <motion.div 
                    ref={menuRef}
                    drag
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{ 
                        position: 'fixed',
                        top: menuPosition.showAbove ? `${menuPosition.top - 8}px` : `${menuPosition.bottom + 8}px`,
                        left: `${menuPosition.left}px`,
                        transform: menuPosition.showAbove ? 'translateY(-100%)' : 'none',
                        zIndex: 10000,
                        cursor: 'move',
                        maxHeight: menuPosition.showAbove ? `${menuPosition.top - 40}px` : `${window.innerHeight - menuPosition.bottom - 40}px`,
                    }}
                    className="w-72 bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in duration-200 flex flex-col"
                >
                    <div className="px-5 py-3 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                        <span>Architecture Blocks</span>
                        <Move size={10} className="opacity-50" />
                    </div>
                    <div className="overflow-y-auto scrollbar-hide py-2 flex-1 min-h-0">
                        {[
                            { type: 'text', icon: <Type size={14} />, label: 'Text', desc: 'Plain text architecture' },
                            { type: 'h1', icon: <Heading1 size={14} />, label: 'Heading 1', desc: 'Large system header' },
                            { type: 'h2', icon: <Heading2 size={14} />, label: 'Heading 2', desc: 'Medium section header' },
                            { type: 'h3', icon: <Heading3 size={14} />, label: 'Heading 3', desc: 'Small details header' },
                            { type: 'todo', icon: <CheckSquare size={14} />, label: 'To-do List', desc: 'Mechanical checklist' },
                            { type: 'bullet', icon: <List size={14} />, label: 'Bullet List', desc: 'Simple bullet flow' },
                            { type: 'number', icon: <span className="text-[10px] font-black">1.</span>, label: 'Numbered List', desc: 'Sequential logic steps' },
                            { type: 'toggle', icon: <ChevronRightIcon size={14} />, label: 'Collapsible Toggle', desc: 'Nested hidden details' },
                            { type: 'callout', icon: <AlertCircle size={14} />, label: 'Callout', desc: 'Emphasis / mandate' },
                            { type: 'quote', icon: <Quote size={14} />, label: 'Quote', desc: 'Trading wisdom' },
                            { type: 'divider', icon: <Minus size={14} />, label: 'Divider', desc: 'Visual separation' },
                            { type: 'image', icon: <ImageIcon size={14} />, label: 'Image', desc: 'Chart intel evidence' },
                            { type: 'table', icon: <TableIcon size={14} />, label: 'Table Matrix', desc: 'Structural data grid' },
                            { type: 'code', icon: <Terminal size={14} />, label: 'Code', desc: 'Algorithmic logic' },
                            { type: 'bookmark', icon: <Link2 size={14} />, label: 'Web Bookmark', desc: 'External resource link' },
                        ].map((cmd) => (
                            <button 
                                key={cmd.type}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateBlock(block.id, { type: cmd.type as BlockType, content: '' });
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group/item"
                            >
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover/item:text-sky-400 group-hover/item:bg-sky-400/10 transition-all">
                                    <BlockIcon type={cmd.type as BlockType} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white/90">{cmd.label}</span>
                                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{cmd.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>,
                document.body
            )}
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
    const [zoomScale, setZoomScale] = useState(1);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(!noteId);
    
    // Store latest data in ref for autosave
    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    // Undo system
    const [history, setHistory] = useState<Block[][]>([]);

    const pushToHistory = useCallback(() => {
        setData(prev => {
            setHistory(h => {
                const newHistory = [...h, JSON.parse(JSON.stringify(prev.blocks))];
                return newHistory.slice(-50); // Keep last 50 states
            });
            return prev;
        });
    }, []);

    const undo = useCallback(() => {
        if (history.length > 0) {
            const prevState = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setData(prev => ({ ...prev, blocks: prevState }));
            toast('Action Reversed', { icon: <ArrowLeft size={14} /> });
        } else {
            // Native browse undo as fallback
            document.execCommand('undo', false);
        }
    }, [history]);

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
                        isDetailed: true, // Force this to stay true in the Detailed Editor
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

    const handleSave = useCallback(async (isSilent: any = false) => {
        // Handle case where it's called from onClick (isSilent would be the React event)
        const silent = typeof isSilent === 'boolean' ? isSilent : false;

        if (isSaving) return;
        
        const toastId = 'save-note';
        if (!silent) {
            setIsSaving(true);
            toast.loading('Synchronizing note...', { id: toastId });
        }
        
        try {
            // Use ref to get latest data to avoid stale closures
            const currentData = dataRef.current;
            const url = currentData._id ? `/api/notes/${currentData._id}` : '/api/notes';
            const res = await fetch(url, {
                method: currentData._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentData)
            });
            
            if (!res.ok) throw new Error(`Failed to save note: ${res.status}`);
            
            const updated = await res.json();
            const note = updated.note || updated;
            
            // Avoid triggering another auto-save by checking if content actually changed
            setData(prev => ({
                ...note,
                isDetailed: true,
                blocks: note.blocks || prev.blocks || [],
            }));
            setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            
            if (!silent) {
                toast.success('Database Verified Sync', {
                    id: toastId,
                    description: 'Your detailed note has been successfully etched into the central database.',
                    duration: 3000,
                });
            }
        } catch (err) {
            console.error('Save error:', err);
            if (!silent) {
                toast.error('Sync Failed', {
                    id: toastId,
                    description: 'Unable to sync your note. Please try again.',
                    duration: 4000,
                });
            }
        } finally {
            if (!silent) setIsSaving(false);
        }
    }, [isSaving, data]);

    // Handle keyboard shortcuts (Ctrl+Z / Cmd+Z for undo, Ctrl+S for save)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave(false);
                return;
            }

            // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                // If focused on an editable element, let the browser handle text undo first
                const target = e.target as HTMLElement;
                const isEditable = target.isContentEditable || 
                                 target.tagName === 'INPUT' || 
                                 target.tagName === 'TEXTAREA';
                
                if (!isEditable) {
                    e.preventDefault();
                    undo();
                } else if (!document.queryCommandEnabled('undo')) {
                    // Fallback to our undo if browser has nothing to undo
                    e.preventDefault();
                    undo();
                }
                return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, undo]);

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data._id && !isSaving) {
                handleSave(true); // silent save
            }
        }, 5000); // Auto-save after 5s of inactivity

        return () => clearTimeout(timer);
    }, [data, handleSave, isSaving]);

    const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
        setData(prev => {
            const blockIndex = prev.blocks.findIndex(b => b.id === id);
            if (blockIndex === -1) return prev;
            
            const newBlocks = [...prev.blocks];
            const oldBlock = newBlocks[blockIndex];
            newBlocks[blockIndex] = { ...oldBlock, ...updates };

            let newTitle = prev.title;
            if (blockIndex === 0 && updates.content !== undefined) {
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
        pushToHistory();
        setData(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== id)
        }));
    }, [pushToHistory]);

    const removeBlockWithFocus = useCallback((id: string | null, focusIndex: number) => {
        if (id === null) {
            setData(prev => {
                if (prev.blocks[focusIndex]) {
                    setTimeout(() => {
                        setFocusedBlockId(prev.blocks[focusIndex].id);
                    }, 0);
                }
                return prev;
            });
            return;
        }
        
        pushToHistory();
        setData(prev => {
            const newBlocks = prev.blocks.filter(b => b.id !== id);
            if (newBlocks[focusIndex]) {
                setTimeout(() => {
                    setFocusedBlockId(newBlocks[focusIndex].id);
                }, 0);
            }
            return { ...prev, blocks: newBlocks };
        });
    }, [pushToHistory]);

    const addBlockAt = useCallback((id: string, type: BlockType = 'text', after: boolean = true, initialContent: string = '') => {
        pushToHistory();
        const newId = Math.random().toString(36).substr(2, 9);
        setData(prev => {
            const index = prev.blocks.findIndex(b => b.id === id);
            const newBlock: Block = { id: newId, type, content: initialContent };
            const newBlocks = [...prev.blocks];
            newBlocks.splice(after ? index + 1 : index, 0, newBlock);
            return { ...prev, blocks: newBlocks };
        });
        setTimeout(() => setFocusedBlockId(newId), 0);
    }, [pushToHistory]);

    // Add a new block at the end (for clicking on empty space)
    const addBlockAtEnd = useCallback(() => {
        const newId = Math.random().toString(36).substr(2, 9);
        setData(prev => ({
            ...prev,
            blocks: [...prev.blocks, { id: newId, type: 'text' as BlockType, content: '' }]
        }));
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
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                                        <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 italic">Detailed Intel Active</span>
                                    </div>
                                    {lastSavedTime && (
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest hidden md:block">
                                            Last Synchronized: {lastSavedTime}
                                        </span>
                                    )}
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
                        {isSaving ? 'Synchronizing...' : 'Database Verified Sync'}
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-12 md:px-24 lg:px-44 py-24">
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
                                    blockIndex={idx}
                                    updateBlock={updateBlock} 
                                    removeBlock={removeBlock}
                                    onRemoveWithFocus={removeBlockWithFocus}
                                    addBlockAt={addBlockAt}
                                    isLast={idx === data.blocks.length - 1}
                                    isFocused={focusedBlockId === block.id}
                                    onFocus={setFocusedBlockId}
                                    onImageClick={setActiveImage}
                                    triggerSave={handleSave}
                                    allBlocks={data.blocks}
                                />
                            ))}
                        </Reorder.Group>
                        
                        {/* Notion-like click-to-add empty space at bottom */}
                        <div 
                            onClick={addBlockAtEnd}
                            className="min-h-[300px] mt-4 cursor-text group relative"
                        >
                            <div className="absolute inset-0 flex items-start justify-start px-10 pt-8">
                                <div className="flex items-center gap-3 text-white/10 group-hover:text-white/30 transition-colors duration-300">
                                    <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Click to add a new block, or press Enter in any block
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {activeImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-4 md:p-12 overflow-hidden" 
                        onClick={() => {
                            setActiveImage(null);
                            setZoomScale(1);
                        }}
                    >
                        <motion.div 
                            className="absolute top-8 right-8 flex items-center gap-4 z-[210]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
                                <button 
                                    onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.5))}
                                    className="p-3 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                >
                                    <ChevronDown size={20} />
                                </button>
                                <div className="px-4 flex items-center justify-center min-w-[80px]">
                                    <span className="text-[10px] font-black font-mono text-sky-400">
                                        {Math.round(zoomScale * 100)}%
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setZoomScale(prev => Math.min(5, prev + 0.5))}
                                    className="p-3 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                >
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                            <button 
                                onClick={() => {
                                    setActiveImage(null);
                                    setZoomScale(1);
                                }}
                                className="p-4 bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 rounded-2xl text-white/40 hover:text-rose-500 transition-all shadow-2xl"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>

                        <motion.div
                            drag={zoomScale > 1}
                            dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
                            dragElastic={0.05}
                            dragMomentum={false}
                            style={{ scale: zoomScale }}
                            onClick={(e) => e.stopPropagation()}
                            onWheel={(e) => {
                                if (e.deltaY < 0) setZoomScale(prev => Math.min(5, prev + 0.1));
                                else setZoomScale(prev => Math.max(0.5, prev - 0.1));
                            }}
                            className="relative cursor-grab active:cursor-grabbing"
                        >
                            <img 
                                src={activeImage} 
                                alt="Attachment" 
                                draggable="false"
                                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/5 pointer-events-none select-none" 
                            />
                        </motion.div>

                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-xl">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">
                                Scroll to zoom • Drag to pan inside frame
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
