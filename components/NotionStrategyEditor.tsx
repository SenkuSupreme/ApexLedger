
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
    BarChart2,
    ArrowLeft,
    ArrowRight,
    Save,
    Activity,
    Terminal,
    Command,
    Cpu,
    Workflow,
    Table as TableIcon,
    ChevronRight as ChevronRightIcon,
    X,
    Link2,
    Copy,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import StrategyMindMap from './StrategyMindMap';
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
    { id: '2', type: 'callout', content: '<b>CODIFYING THE EDGE:</b> This blueprint defines the exact mechanical criteria for market interaction. Consistency is the only metric that matters.' },
    
    { id: '3', type: 'h2', content: '1. Theoretical Framework: Market Efficiency' },
    { id: '4', type: 'text', content: 'Market participants are divided into <b>Informed</b> (Banks, Sovereigns) and <b>Uninformed</b> (Retail). We wait for the Informed to commit before entering.' },
    { id: '5', type: 'bullet', content: '<b>Market Focus:</b> Major Crosses (<b>EURUSD, GBPUSD</b>), Global Indices (<b>NAS100</b>)' },
    { id: '5-b', type: 'bullet', content: '<b>Correlation Matrix:</b> Track DXY (Dollar Index) to confirm directional strength in majors.' },
    { id: 'h2-risk', type: 'h2', content: '2. Risk Architecture' },
    { id: '6-risk', type: 'bullet', content: '<b>Fixed Exposure:</b> 1% per setup. No exceptions.' },
    { id: '7-risk', type: 'bullet', content: '<b>Daily Limit:</b> 2 Losses = Terminal shut down. Walk away.' },
    { id: '8-risk', type: 'bullet', content: '<b>Max Drawdown:</b> 5% total account equity before strategy review.' },
    { id: '8-b', type: 'bullet', content: '<b>Position Sizing:</b> Use mechanical calculation based on stop loss distance (pips/points).' },

    { id: '9', type: 'h2', content: '3. Technical Confluence Matrix' },
    { id: '10', type: 'text', content: 'Price doesn\'t move randomly—it seeks <b>Efficiency</b>. Look for imbalances.' },
    { id: '11', type: 'bullet', content: '<b>HTF Context:</b> Daily candle rejection or expansion direction.' },
    { id: '12', type: 'bullet', content: '<b>Mid-TF Structure:</b> 15m/1h Market Structure Shift (MSS).' },
    { id: '13', type: 'bullet', content: '<b>LTF Selection:</b> 1m/5m FVG Entry with Displacement.' },
    { id: '14', type: 'callout', content: '<b>Rule:</b> No setup exists without a clear <b>Draw on Liquidity (DOL)</b>. If you don\'t know where the exit is, don\'t take the entry.' },

    { id: '15', type: 'h2', content: '4. The Execution Protocol' },
    { id: '16', type: 'text', content: '<b>Setup Alpha: The Displacement Model</b>' },
    { id: '17', type: 'todo', content: 'Step 1: Wait for a sweep of a previous session High/Low.', checked: false },
    { id: '18', type: 'todo', content: 'Step 2: Observe aggressive displacement (large candles) back into range.', checked: false },
    { id: '19', type: 'todo', content: 'Step 3: Enter at the 50% equilibrium of the Fair Value Gap.', checked: false },
    { id: '20', type: 'todo', content: 'Step 4: Stop loss placed logically behind the displacement origin.', checked: false },
    
    { id: '21', type: 'h2', content: '5. Institutional Psychology' },
    { id: '22', type: 'callout', content: '<b>FOMO CHECK:</b> Emotional volatility is the killer of edge. Trade the chart, not your pnl.' },
    { id: '23', type: 'text', content: 'A missed trade is $0 loss. A forced trade is a potential % loss. Choose wisely.' },
];


// --- RICH TEXT COMPONENT ---
// --- FLOATING TOOLBAR COMPONENT ---
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
            
            // Ensure selection is inside a content-editable
            let parent = range.commonAncestorContainer.parentElement;
            while (parent) {
                if (parent.getAttribute('contenteditable') === 'true') break;
                parent = parent.parentElement;
            }
            if (!parent) {
                setIsVisible(false);
                return;
            }

            // Calculate position relative to viewport, handling scroll is automatic with getBoundingClientRect
            // We adding a slight offset to center it above
            setPosition({
                top: rect.top - 60, // 60px above selection
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
                onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
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
                
                {/* Undo / Actions */}
                <button onClick={() => format('undo')} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Undo Action">
                    <Undo size={16} />
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1" />

                {/* Color Pickers */}
                <div className="flex items-center gap-1">
                    {/* Text Color */}
                    <div className="relative group">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-sky-400 transition-colors relative" title="Text Color Picker" aria-label="Text Color Picker">
                           <Palette size={16} />
                           <input
                                type="color"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onInput={(e) => format('foreColor', (e.target as HTMLInputElement).value)}
                                title="Choose Text Color"
                           />
                        </button>
                    </div>

                    {/* Highlight Color */}
                    <div className="relative group">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-amber-400 transition-colors relative" title="Highlight Color Picker">
                           <Highlighter size={16} />
                           <input 
                                type="color" 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                                onChange={(e) => format('hiliteColor', e.target.value)}
                                title="Choose Highlight Color"
                           />
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

// --- RICH TEXT COMPONENT ---
const ContentBlock = React.forwardRef(({ html, tagName: Tag = 'div', className, onChange, onKeyDown, placeholder, ...props }: any, ref) => {
    const elementRef = useRef<HTMLElement | null>(null);
    const isMounted = useRef(false);

    // Initial content set via side-effect to avoid React re-rendering issues with contentEditable
    useEffect(() => {
        if (!isMounted.current && elementRef.current) {
            elementRef.current.innerHTML = html || '';
            isMounted.current = true;
        }
    }, []);

    // Sync content if it changes externally (not when focused)
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
            className={`outline-none min-h-[1.5em] focus:empty:before:content-[attr(data-placeholder)] empty:before:text-white/20 px-1 transition-all duration-200 ${className} [&>b]:font-black [&>i]:italic [&>u]:underline [&>mark]:bg-amber-500/20 [&>mark]:text-amber-500 [&>mark]:px-1 [&>mark]:rounded-md relative after:content-[attr(data-prediction)] after:text-white/20 after:pointer-events-none after:absolute after:pl-1`}
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

const BLANK_TEMPLATE: Block[] = [
    { id: '1', type: 'h1', content: 'Untitled System' },
    { id: '2', type: 'text', content: '' },
];

const ICT_STRATEGY: Block[] = [
    { id: 'ict-1', type: 'h1', content: 'ICT Concepts Master Blueprint' },
    { id: 'ict-2', type: 'callout', content: '<b>ALGORITHMIC LOGIC:</b> The market is not moved by buyers and sellers, but by an algorithm seeking liquidity and rebalancing price. We trade the <b>Displacement</b>.' },
    
    { id: 'ict-3', type: 'h2', content: '1. Time Theory: The Power of 3 (AMD)' },
    { id: 'ict-4', type: 'text', content: 'Every candle/day/week follows the <b>Accumulation, Manipulation, Distribution</b> model.' },
    { id: 'ict-5', type: 'bullet', content: '<b>Accumulation:</b> Price stays in a range, building buy/sell side liquidity.' },
    { id: 'ict-6', type: 'bullet', content: '<b>Manipulation:</b> A fake move (Judas Swing) to sweep liquidity and trap retail.' },
    { id: 'ict-7', type: 'bullet', content: '<b>Distribution:</b> The actual intended expansion leg of the move.' },

    { id: 'ict-7-b', type: 'h2', content: '2. The Draw on Liquidity (DOL)' },
    { id: 'ict-8', type: 'text', content: 'Identify where the market is going next using HTF Bias.' },
    { id: 'ict-9', type: 'bullet', content: '<b>Internal Liquidity:</b> Fair Value Gaps (FVG) and Volume Imbalances.' },
    { id: 'ict-10', type: 'bullet', content: '<b>External Liquidity:</b> Old Session Highs/Lows, Daily Highs/Lows.' },

    { id: 'ict-11', type: 'h2', content: '3. Precision Setup: The MMXM Market Maker Model' },
    { id: 'ict-12', type: 'todo', content: 'Identify HTF DOL (Where are we going?)', checked: false },
    { id: 'ict-13', type: 'todo', content: 'Wait for LTF Liquidity Sweep in Killzone (London/NY Open)', checked: false },
    { id: 'ict-14', type: 'todo', content: 'Confirm Market Structure Shift (MSS) with Displacement.', checked: false },
    { id: 'ict-15', type: 'todo', content: 'Set limit order at Fair Value Gap (FVG) or Inversion FVG.', checked: false },
    
    { id: 'ict-16', type: 'h2', content: '4. Execution & Risk' },
    { id: 'ict-17', type: 'code', content: 'IF (In Killzone) AND (MSS Confirmed):\n   ENTRY = FVG Equilibrium\n   STOP = Pivot High/Low of Move\n   TARGET = Opposing Major Liquidity Pool' },
    { id: 'ict-18', type: 'callout', content: '<b>THE SILVER BULLET:</b> Look for the first 1m/5m FVG between 10 AM-11 AM NY. This is the algorithm\'s high-probability retrace.' },
];

const SMC_STRATEGY: Block[] = [
    { id: 'smc-1', type: 'h1', content: 'Smart Money Structure Logic' },
    { id: 'smc-2', type: 'callout', content: '<b>INSTITUTIONAL FOOTPRINT:</b> We follow the large-scale orderflow of Central Banks. We do not gamble on patterns; we follow structure.' },
    
    { id: 'smc-3', type: 'h2', content: '1. Advanced Structure Mapping' },
    { id: 'smc-4', type: 'text', content: 'Identify the current trading range (Strong High to Weak Low).' },
    { id: 'smc-5', type: 'bullet', content: '<b>BOS (Break of Structure):</b> Body close beyond previous structural point. Confirms trend.' },
    { id: 'smc-6', type: 'bullet', content: '<b>CHoCH (Change of Character):</b> First break of internal structure signaling reversal.' },
    { id: 'smc-7', type: 'bullet', content: '<b>Inducement (IDM):</b> The first internal pullback after a BOS. <mark>CRITICAL STEP</mark>.' },

    { id: 'smc-8', type: 'h2', content: '2. POI Selection' },
    { id: 'smc-9', type: 'text', content: 'Select zones within the Discount (Buy) or Premium (Sell) regions.' },
    { id: 'smc-10', type: 'bullet', content: '<b>Decisional OB:</b> The extreme block before the Inducement.' },
    { id: 'smc-11', type: 'bullet', content: '<b>Extreme OB:</b> The absolute origin of the structural leg.' },

    { id: 'smc-12', type: 'h2', content: '3. Liquidity Dynamics' },
    { id: 'smc-12-b', type: 'text', content: 'Price moves from Liquidity to Liquidity. If you don\'t see the liquidity, you ARE the liquidity.' },
    { id: 'smc-12-c', type: 'bullet', content: '<b>BSL (Buy Side Liquidity):</b> Above old highs. Banks sell to buyers here.' },
    { id: 'smc-12-d', type: 'bullet', content: '<b>SSL (Sell Side Liquidity):</b> Below old lows. Banks buy from sellers here.' },
    { id: 'smc-12-e', type: 'bullet', content: '<b>EQH/EQL:</b> Equal Highs/Lows. High probability magnets for price.' },

    { id: 'smc-13', type: 'h2', content: '4. Entry Protocol: Confirmation' },
    { id: 'smc-14', type: 'todo', content: 'Price taps into HTF POI (OB/FVG)', checked: false },
    { id: 'smc-15', type: 'todo', content: 'Wait for LTF CHoCH inside the POI', checked: false },
    { id: 'smc-16', type: 'todo', content: 'Enter on the LTF Return to Impulse (RTI)', checked: false },
    { id: 'smc-17', type: 'code', content: '// Management\nRisk = 0.5% - 1%\nTP = Target the Weak structural high/low' },
];

const ORB_STRATEGY: Block[] = [
    { id: 'orb-1', type: 'h1', content: 'Opening Range Breakout (ORB)' },
    { id: 'orb-2', type: 'callout', content: '<b>SESSION MOMENTUM:</b> We exploit the initial surge of capital at the exchange open. Volatility is our friend, if controlled.' },
    
    { id: 'orb-3', type: 'h2', content: '1. Setup Parameters: The M30 Window' },
    { id: 'orb-4', type: 'text', content: 'Analyze the first 30 minutes of the NY Session (9:30 AM - 10:00 AM NY).' },
    { id: 'orb-5', type: 'bullet', content: 'Mark the <b>absolute High and Low</b> of this range.' },
    { id: 'orb-6', type: 'h2', content: '2. The 3 Breakout Scenarios' },
    { id: 'orb-7', type: 'text', content: '<b>Scenario A: Trend Breakout</b> - Price closes outside range and expands. Enter on M5 retest of the range boundary.' },
    { id: 'orb-8', type: 'text', content: '<b>Scenario B: The Reversal Fade</b> - Price breaks, fails to expand, and closes back inside. Target opposite side of range.' },
    { id: 'orb-9', type: 'text', content: '<b>Scenario C: The Gap Fill</b> - If price gapped up/down, wait for ORB to signal a fill back to yesterday\'s close.' },
    { id: 'orb-10', type: 'h2', content: '3. Execution Logic' },
    { id: 'orb-11', type: 'todo', content: 'ENTRY = Buy/Sell stop 2 pips above/below ORB extremes.', checked: false },
    { id: 'orb-12', type: 'todo', content: 'STOP = Mid-point of the opening range.', checked: false },
    { id: 'orb-13', type: 'todo', content: 'TARGET = 2.0x the range width (Standard Extension).', checked: false },
];

const CRT_STRATEGY: Block[] = [
    { id: 'crt-1', type: 'h1', content: 'Candle Range Theory (CRT)' },
    { id: 'crt-2', type: 'callout', content: '<b>PRECISION:</b> Every single candle tells a story. We trade the internal range of the previous candle.' },
    { id: 'crt-3', type: 'h2', content: '1. Wick Engineering' },
    { id: 'crt-4', type: 'text', content: 'Analyze the previous H1/H4 candle\'s wick-to-body ratio.' },
    { id: 'crt-5', type: 'bullet', content: '<b>Wick Fill:</b> High probability of price returning to test the 50% level of a large wick.' },
    { id: 'crt-6', type: 'h2', content: '2. The Power of Open' },
    { id: 'crt-7', type: 'text', content: 'Entry should ideally occur as price crosses the opening price of the current candle after manipulation.' },
    { id: 'crt-8', type: 'todo', content: 'Identify HTF Bias.', checked: false },
    { id: 'crt-9', type: 'todo', content: 'Wait for 50% Wick Fill on M15.', checked: false },
    { id: 'crt-10', type: 'todo', content: 'Enter with SL at candle extreme.', checked: false },
];

const WYCKOFF_BLUEPRINT: Block[] = [
    { id: 'wyckoff-1', type: 'h1', content: 'Wyckoff Logic: The Composite Man' },
    { id: 'wyckoff-2', type: 'callout', content: '<b>MARKET PHASES:</b> The market moves in four distinct cycles: Accumulation, Markup, Distribution, Markdown.' },
    { id: 'wyckoff-3', type: 'h2', content: '1. Accumulation Schematics' },
    { id: 'wyckoff-4', type: 'text', content: 'The process by which large operators absorb supply.' },
    { id: 'wyckoff-5', type: 'bullet', content: '<b>PS (Preliminary Support):</b> Initial stop of down move.' },
    { id: 'wyckoff-6', type: 'bullet', content: '<b>SC (Selling Climax):</b> Sharp sell-off on high volume.' },
    { id: 'wyckoff-7', type: 'bullet', content: '<b>Spring:</b> A shakeout below support to grab final liquidity. <mark>THE ENTRY TRIGGER</mark>.' },
    { id: 'wyckoff-8', type: 'h2', content: '2. Distribution Schematics' },
    { id: 'wyckoff-9', type: 'text', content: 'The process of large operators offloading positions to the public.' },
    { id: 'wyckoff-10', type: 'bullet', content: '<b>UTAD (Upthrust After Distribution):</b> The final trap above range resistance.' },
    { id: 'wyckoff-11', type: 'todo', content: 'Identify the Trading Range (TR).', checked: false },
    { id: 'wyckoff-12', type: 'todo', content: 'Wait for the Spring or UTAD.', checked: false },
];

const VOLUME_PROFILE_STRATEGY: Block[] = [
    { id: 'vp-1', type: 'h1', content: 'Volume Profile: The Auction Theory' },
    { id: 'vp-2', type: 'callout', content: '<b>WHERE IS THE VALUE?</b> Price is the search for value. Volume identifies where market participants agree and disagree.' },
    { id: 'vp-3', type: 'h2', content: '1. Profile Anatomy' },
    { id: 'vp-4', type: 'bullet', content: '<b>POC (Point of Control):</b> The level with the highest volume. Acts as a magnet.' },
    { id: 'vp-5', type: 'bullet', content: '<b>VA (Value Area):</b> Where 70% of volume occurred.' },
    { id: 'vp-6', type: 'bullet', content: '<b>HVN (High Volume Node):</b> Areas of acceptance. Hard to break.' },
    { id: 'vp-7', type: 'bullet', content: '<b>LVN (Low Volume Node):</b> Areas of rejection. Price moves through here fast.' },
    { id: 'vp-8', type: 'h2', content: '2. The Value Area Play' },
    { id: 'vp-9', type: 'text', content: 'If price opens outside VA and enters it, target the opposite side (80% Rule).' },
    { id: 'vp-10', type: 'todo', content: 'Mark Daily POC and VA.', checked: false },
    { id: 'vp-11', type: 'todo', content: 'Look for rejection at VAH or VAL.', checked: false },
];

const PRICE_ACTION_SCALPING: Block[] = [
    { id: 'pa-1', type: 'h1', content: 'Price Action Scalping' },
    { id: 'pa-2', type: 'callout', content: '<b>PURE MOMENTUM:</b> We strip away indicators to focus on clean candle geometry and narrative flow.' },
    { id: 'pa-3', type: 'h2', content: '1. High Probability Candlesticks' },
    { id: 'pa-4', type: 'bullet', content: '<b>The Pin Bar:</b> A clear sign of rejection and price flip.' },
    { id: 'pa-5', type: 'bullet', content: '<b>The Engulfing:</b> Complete takeover of previous momentum.' },
    { id: 'pa-6', type: 'bullet', content: '<b>The Inside Bar:</b> Volatility compression before a breakout.' },
    { id: 'pa-7', type: 'h2', content: '2. The Scalping Workflow' },
    { id: 'pa-8', type: 'text', content: 'Focus on 1m/5m charts for precision entries in trending markets.' },
    { id: 'pa-9', type: 'todo', content: 'Identify H1 trend.', checked: false },
    { id: 'pa-10', type: 'todo', content: 'Wait for M5 pullback to EMA (20/50).', checked: false },
    { id: 'pa-11', type: 'todo', content: 'Enter on confirming PA candle.', checked: false },
];

const MACRO_SENTIMENT_BLUEPRINT: Block[] = [
    { id: 'macro-1', type: 'h1', content: 'Macro Sentiment Analysis' },
    { id: 'macro-2', type: 'callout', content: '<b>FUNDAMENTAL NARRATIVE:</b> Market direction is driven by interest rate differencials and central bank policy.' },
    { id: 'macro-3', type: 'h2', content: '1. Economic Indicator Tracking' },
    { id: 'macro-4', type: 'bullet', content: '<b>CPI (Inflation):</b> Higher CPI = Potential Rate Hike = Strong Currency.' },
    { id: 'macro-5', type: 'bullet', content: '<b>NFP (Employment):</b> Strong labor market = Resilient Economy.' },
    { id: 'macro-6', type: 'bullet', content: '<b>FOMC/ECB Meetings:</b> The source of structural market shifts.' },
    { id: 'macro-7', type: 'h2', content: '2. Risk-On vs Risk-Off' },
    { id: 'macro-8', type: 'text', content: 'Identify the global appetite for risk (S&P 500, Yields, VIX).' },
    { id: 'macro-9', type: 'todo', content: 'Check the Economic Calendar for high-impact news.', checked: false },
    { id: 'macro-10', type: 'todo', content: 'Analyze the yield curve (10Y-2Y).', checked: false },
];

const TRADING_PLAN_BLUEPRINT: Block[] = [
    { id: 'plan-1', type: 'h1', content: 'Institutional Trading Plan' },
    { id: 'plan-2', type: 'callout', content: '<b>BUSINESS MODEL:</b> Trading is a game of probabilities. This plan is your standard operating procedure.' },
    { id: 'plan-3', type: 'h2', content: '1. Routine & Preparation' },
    { id: 'plan-4', type: 'todo', content: 'Pre-market analysis (HTF Bias, News check).', checked: false },
    { id: 'plan-5', type: 'todo', content: 'Identify 2 high-probability setups.', checked: false },
    { id: 'plan-6', type: 'h2', content: '2. Rules of Engagement' },
    { id: 'plan-7', type: 'bullet', content: 'Never trade without a stop loss.' },
    { id: 'plan-8', type: 'bullet', content: 'Max 2 trades per session.' },
    { id: 'plan-9', type: 'bullet', content: 'Break-even after 1:1 RR.' },
    { id: 'plan-10', type: 'h2', content: '3. Journaling & Review' },
    { id: 'plan-11', type: 'text', content: 'Every trade must be logged with screenshots and emotional state notes.' },
];

const SESSION_NARRATIVE_BLUEPRINT: Block[] = [
    { id: 'session-1', type: 'h1', content: 'Session Narrative & Timing' },
    { id: 'session-2', type: 'callout', content: '<b>TIME IS PRICE:</b> When a setup occurs is just as important as where it occurs.' },
    { id: 'session-3', type: 'h2', content: '1. The Tokyo Session (Asian Range)' },
    { id: 'session-4', type: 'text', content: 'Usually a low-volatility accumulation phase. We mark the high and low.' },
    { id: 'session-5', type: 'h2', content: '2. The London Injection' },
    { id: 'session-6', type: 'text', content: 'Often creates the initial manipulation or the low/high of the day.' },
    { id: 'session-7', type: 'h2', content: '3. The NY Reversal/Expansion' },
    { id: 'session-8', type: 'text', content: 'Higher volume injection from US participants. Watch for continuation of London or a complete flip.' },
];

const PSYCHOLOGY_MASTER_BLUEPRINT: Block[] = [
    { id: 'psy-1', type: 'h1', content: 'Psychological Edge: The Zen Trader' },
    { id: 'psy-2', type: 'callout', content: '<b>MINDSET:</b> You don\'t trade the market; you trade your beliefs about the market.' },
    { id: 'psy-3', type: 'h2', content: '1. The 3 Pillars of Discipline' },
    { id: 'psy-4', type: 'bullet', content: '<b>Patience:</b> Waiting for the setup to come to you.' },
    { id: 'psy-5', type: 'bullet', content: '<b>Objectivity:</b> Seeing what price is doing, not what you want it to do.' },
    { id: 'psy-6', type: 'bullet', content: '<b>Detachment:</b> Treating every trade as a single data point in a series of 1000.' },
    { id: 'psy-7', type: 'h2', content: '2. Performance Hacks' },
    { id: 'psy-8', type: 'todo', content: 'Daily Meditation before session.', checked: false },
    { id: 'psy-9', type: 'todo', content: 'Physical movement to reset after a loss.', checked: false },
];

// --- HELPER COMPONENTS ---

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
                // We need to wait a tick for the react state to update the value and re-render
                // before we can set the cursor position. 
                // However, since this is a controlled component, the parent 'onChange' will update 'value'
                // and once that flows back down, we'd ideally set the selection.
                // A simpler approximation for now: just trigger the change. 
                // Advanced implementation would require layouts effect to restore cursor.
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

// --- BLOCK COMPONENT ---

const EditorBlock = React.memo(({ block, updateBlock, removeBlock, isLast, isFocused, onImageClick, onFocus, onRemoveWithFocus, blockIndex, addBlockAt, allBlocks, triggerSave }: any) => {
    const dragControls = useDragControls();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, bottom: 0, left: 0, showAbove: false });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<any>(null);
    const blockRef = useRef<HTMLLIElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Auto-focus effect
    useEffect(() => {
        if (isFocused && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(textareaRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [isFocused]);

    // Intelligent menu positioning
    useEffect(() => {
        if (isMenuOpen && blockRef.current) {
            const rect = blockRef.current.getBoundingClientRect();
            const menuHeight = 350; // Expected max menu height
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            
            // Determine if menu should show above or below
            const showAbove = spaceBelow < menuHeight;
            
            setMenuPosition({
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
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

        const toastId = toast.loading('Uploading Strategy Asset...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const { url } = await res.json();
            updateBlock(block.id, { content: url });
            toast.success('Strategy Intel Stored', { id: toastId });

            // Critical: Force an immediate database commit for cloud assets
            if (triggerSave) {
                setTimeout(() => triggerSave(true), 100);
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Upload Failed. Falling back to local.', { id: toastId });
            
            // Fallback to base64
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
        
        // Fix for persistent formatting on space
        if (v.endsWith('&nbsp;') || v.endsWith(' ')) {
             if (document.queryCommandState('bold')) document.execCommand('bold', false);
             if (document.queryCommandState('italic')) document.execCommand('italic', false);
             if (document.queryCommandState('underline')) document.execCommand('underline', false);
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
        } else if (e.key === ' ') {
            // Handle space at the end of a bold span to "leak" out
            const selection = window.getSelection();
            if (selection && selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                if (document.queryCommandState('bold') || document.queryCommandState('italic')) {
                    // This is a complex case, standard browser behavior is usually preferred
                    // but we can try to force a check if we're at the very end of a formatted node.
                }
            }
        } else if (e.key === 'ArrowUp') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (range.startOffset === 0 && blockIndex > 0) {
                    const isAtStart = !range.startContainer.previousSibling || (range.startContainer === textareaRef.current && range.startOffset === 0);
                    if (isAtStart) {
                        e.preventDefault();
                        onRemoveWithFocus(null, blockIndex - 1);
                    }
                }
            }
        } else if (e.key === 'ArrowDown') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const isAtEnd = true; // Simplified check
                if (isAtEnd) {
                    onRemoveWithFocus(null, blockIndex + 1);
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
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-5xl font-black tracking-tight text-white mb-6 mt-4" placeholder="Blueprint Phase... Type '/' for commands" tagName="h1" />;
            case 'h2':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-3xl font-black tracking-tight text-white/90 mb-4 mt-2" placeholder="Functional Core... Type '/' for commands" tagName="h2" />;
            case 'h3':
                return <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-xl font-bold tracking-tight text-white/80 mb-2" placeholder="Deep Logic... Type '/' for commands" tagName="h3" />;
            case 'todo':
                return (
                    <div className="flex items-start gap-3 group/todo w-full">
                        <button 
                            onClick={() => updateBlock(block.id, { checked: !block.checked })}
                            className={`mt-1.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${block.checked ? 'bg-sky-500 text-black shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-white/10 hover:bg-white/20 text-white/30'}`}
                        >
                            {block.checked && <ListChecks size={14} strokeWidth={3} />}
                        </button>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className={`text-[15px] font-medium leading-relaxed ${block.checked ? 'text-white/40 line-through' : 'text-white/90'}`} placeholder="Verification step..." />
                    </div>
                );
            case 'callout':
                return (
                    <div className="flex items-center gap-6 p-8 md:p-12 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] w-full border border-sky-500/10 group/callout hover:bg-sky-500/[0.05] transition-all duration-500">
                        <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.15)] group-hover/callout:scale-110 transition-transform">
                            <AlertCircle size={24} />
                        </div>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-base font-medium leading-relaxed text-white/90" placeholder="Operational mandate..." />
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
                    <div className="flex items-start gap-3 w-full">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-[15px] font-medium leading-relaxed text-white/90" placeholder="Protocol detail..." />
                    </div>
                );
            case 'number':
                return (
                    <div className="flex items-start gap-3 w-full">
                        <div className="mt-1.5 text-[11px] font-black text-sky-500/60 shrink-0 w-5 select-none">{calculateListNumber(blockIndex)}.</div>
                        <ContentBlock ref={textareaRef} html={block.content} onChange={handleTextChange} onKeyDown={handleKeyDown} onFocus={() => onFocus(block.id)} className="text-[15px] font-medium leading-relaxed text-white/90" placeholder="Step in series..." />
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
                                className="text-[15px] font-bold text-white/90 flex-1" 
                                placeholder="Toggle Header..." 
                            />
                        </div>
                        {isOpen && (
                            <div className="pl-8 border-l border-white/5 space-y-2 ml-3">
                                <ContentBlock 
                                    html={block.metadata?.details || ''} 
                                    onChange={(v: string) => updateBlock(block.id, { metadata: { ...block.metadata, details: v } })} 
                                    className="text-[14px] leading-relaxed text-white/70 min-h-[1.5em]" 
                                    placeholder="Nested details..." 
                                />
                            </div>
                        )}
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
                            placeholder="Add a structural caption to this asset..." 
                        />
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
                scale: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                zIndex: 999 
            }}
            transition={{ 
                type: "spring", 
                stiffness: 1200, 
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

            <div className="flex-1 w-full relative">
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
                        left: `${Math.min(menuPosition.left, window.innerWidth - 300)}px`,
                        transform: menuPosition.showAbove ? 'translateY(-100%)' : 'none',
                        zIndex: 10000,
                        cursor: 'move'
                    }}
                    className="w-72 bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in duration-200"
                >
                    <div className="px-5 py-3 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <span>Strategy Components</span>
                        <Move size={10} className="opacity-50" />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
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
                {renderContent()}
            </div>
        </Reorder.Item>
    );
});

EditorBlock.displayName = 'EditorBlock';

// --- MAIN PAGE ---

export default function NotionStrategyEditor({ strategyId, onBack, initialIsTemplate }: { strategyId?: string, onBack: () => void, initialIsTemplate?: boolean }) {
    const [data, setData] = useState<StrategyData>({
        name: "New Strategy",
        isTemplate: initialIsTemplate || false,
        blocks: [],
        canvasElements: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [zoomScale, setZoomScale] = useState(1);
    const [activeSection, setActiveSection] = useState<'editor' | 'map'>('editor');
    const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(!strategyId);

    // Undo system
    const [history, setHistory] = useState<Block[][]>([]);

    const pushToHistory = useCallback(() => {
        setData(prev => {
            setHistory(h => {
                const newHistory = [...h, JSON.parse(JSON.stringify(prev.blocks))];
                return newHistory.slice(-50); 
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
            document.execCommand('undo', false);
        }
    }, [history]);

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

    const handleSave = useCallback(async (isSilent: any = false) => {
        const silent = typeof isSilent === 'boolean' ? isSilent : false;
        if (isSaving) return;
        
        const toastId = 'save-strategy';
        if (!silent) {
            setIsSaving(true);
            toast.loading('Synchronizing strategy...', { id: toastId });
        }
        
        try {
            const res = await fetch('/api/strategies', {
                method: data._id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!res.ok) {
                const responseText = await res.text();
                throw new Error(`Failed to save strategy: ${res.status} - ${responseText}`);
            }
            
            const updated = await res.json();
            setData(prev => ({
                ...updated,
                blocks: updated.blocks || prev.blocks || [],
                canvasElements: updated.canvasElements || prev.canvasElements || []
            }));
            setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            
            if (!silent) {
                toast.success('Database Verified Sync', {
                    id: toastId,
                    description: 'Your playback protocols have been successfully etched into the central database.',
                    duration: 3000,
                });
            }
        } catch (err) {
            console.error('Save error:', err);
            if (!silent) {
                toast.error('Sync Failed', {
                    id: toastId,
                    description: 'Unable to synchronize your protocols. Architecture has been cached locally.',
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
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave(false);
                return;
            }

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
                handleSave(true);
            }
        }, 5000); // Auto-save after 5s of inactivity (matched to Note Editor)

        return () => clearTimeout(timer);
    }, [data, handleSave, isSaving]);

    const generateChecklist = useCallback(async (manualBlocks?: Block[], manualName?: string) => {
        if (isGeneratingChecklist) return;
        
        const toastId = 'generate-checklist';
        setIsGeneratingChecklist(true);
        toast.loading('Synthesizing institutional checklist...', { id: toastId });
        
        try {
            const blocksToUse = manualBlocks || data.blocks;
            const nameToUse = manualName || data.name;

            const content = blocksToUse
                .map(b => b.content.replace(/<[^>]*>/g, ''))
                .filter(c => c.trim().length > 0)
                .join('\n');
            
            if (!content) throw new Error('No content to analyze');

            // 1. Get AI analysis
            const aiRes = await fetch('/api/ai/generate-checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    strategyName: nameToUse,
                    content 
                })
            });
            
            if (!aiRes.ok) throw new Error('Failed to generate checklist layout');
            const { checklist } = await aiRes.json();
            
            // 2. Create formal checklist record
            const createRes = await fetch('/api/checklists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${nameToUse} Protocol`,
                    strategy: nameToUse,
                    description: `AI-Synthesized checklist derived from "${nameToUse}" strategy blueprint.`,
                    items: checklist.map((item: string, i: number) => ({
                        id: `ai-${Date.now()}-${i}`,
                        text: item,
                        completed: false
                    })),
                    isActive: true
                })
            });

            if (!createRes.ok) throw new Error('Failed to propagate to checklist engine');
            
            toast.success('Protocol Synthesized', {
                id: toastId,
                description: 'Neural checklist has been added to your Checklist page.',
                duration: 4000,
            });
            
        } catch (err) {
            console.error('Checklist propagation error:', err);
            toast.error('Synthesis Failed', {
                id: toastId,
                description: err instanceof Error ? err.message : 'Unable to mechanicalize strategy. Please try again.',
                duration: 4000,
            });
        } finally {
            setIsGeneratingChecklist(false);
        }
    }, [isGeneratingChecklist, data]);

    const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
        setData(prev => {
            const newBlocks = prev.blocks.map(b => b.id === id ? { ...b, ...updates } : b);
            
            // Auto-sync title if first block updated
            let newName = prev.name;
            if (prev.blocks[0]?.id === id && updates.content !== undefined) {
                // Strip HTML tags for the plain text title
                newName = updates.content.replace(/<[^>]*>/g, '').toUpperCase() || "NEW STRATEGY";
            }

            return {
                ...prev,
                blocks: newBlocks,
                name: newName
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
            const index = prev.blocks.findIndex(b => b.id === id);
            const newBlocks = prev.blocks.filter(b => b.id !== id);
            
            // Set focus to the target index in the remaining blocks
            setTimeout(() => {
                const targetBlock = newBlocks[focusIndex];
                if (targetBlock) {
                    setFocusedBlockId(targetBlock.id);
                } else if (newBlocks.length > 0) {
                    setFocusedBlockId(newBlocks[newBlocks.length - 1].id);
                }
            }, 0);
            
            return {
                ...prev,
                blocks: newBlocks
            };
        });
    }, []);

    const addBlockAt = useCallback((idOrIndex: string | number, type: BlockType = 'text', after: boolean = true, initialContent: string = '') => {
        pushToHistory();
        const newId = Math.random().toString(36).substr(2, 9);
        setData(prev => {
            let index: number;
            if (typeof idOrIndex === 'string') {
                index = prev.blocks.findIndex(b => b.id === idOrIndex);
                if (after) index += 1;
            } else {
                index = idOrIndex;
            }

            const newBlock: Block = {
                id: newId,
                type,
                content: initialContent
            };
            const newBlocks = [...prev.blocks];
            newBlocks.splice(index, 0, newBlock);
            return { ...prev, blocks: newBlocks };
        });
        setTimeout(() => setFocusedBlockId(newId), 0);
    }, [pushToHistory]);

    const selectTemplate = (template: Block[]) => {
        const name = template[0]?.type === 'h1' ? template[0].content.replace(/<[^>]*>/g, '').toUpperCase() : data.name;
        setData(prev => ({ 
            ...prev, 
            blocks: template,
            name: name
        }));
        setShowTemplatePicker(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
            <FloatingToolbar />
            {/* Header */}
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
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 italic">Neural Sync Active</span>
                                    </div>
                                    {lastSavedTime && (
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest hidden md:block">
                                            Last Synchronized: {lastSavedTime}
                                        </span>
                                    )}
                                </div>
                        <input 
                            value={data.name}
                            readOnly
                            className="bg-transparent border-none p-0 text-4xl font-black italic uppercase tracking-tighter text-white/50 cursor-default focus:ring-0 w-full max-w-[450px] leading-tight truncate"
                            placeholder="PROTOCOL IDENTIFIER"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                        <button 
                            onClick={() => setActiveSection('editor')}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeSection === 'editor' ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <Workflow size={14} strokeWidth={activeSection === 'editor' ? 3 : 2} />
                            Blueprint
                        </button>
                        <button 
                            onClick={() => setActiveSection('map')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeSection === 'map' ? 'bg-sky-500 text-black shadow-xl scale-[1.02]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <Activity size={14} strokeWidth={activeSection === 'map' ? 3 : 2} />
                            Neural Map
                        </button>
                        <button 
                            onClick={() => generateChecklist()}
                            disabled={isGeneratingChecklist}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 disabled:opacity-50`}
                        >
                            <Sparkles size={14} className={isGeneratingChecklist ? "animate-spin" : ""} />
                            {isGeneratingChecklist ? 'Synthesizing...' : 'Synthesize Checklist'}
                        </button>
                    </div>

                    <div className="h-10 w-px bg-white/5 mx-2" />

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

            <main className="max-w-[1400px] mx-auto px-12 md:px-24 lg:px-44 py-24 space-y-24">
                {showTemplatePicker ? (
                    <div className="max-w-3xl mx-auto space-y-12 py-20 text-center animate-in fade-in zoom-in duration-700">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter text-foreground">Select Architecture</h2>
                            <p className="text-muted-foreground/40 text-lg font-medium">Choose a structural starting point for your trading system.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {/* Empty Canvas */}
                            <button 
                                onClick={() => selectTemplate(BLANK_TEMPLATE)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-white/20 hover:bg-zinc-800/50 transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Plus size={100} />
                                </div>
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 group-hover:scale-110 transition-transform relative z-10 border border-white/10">
                                    <Plus size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-white transition-colors">Empty Canvas</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Pure freestyle architecture. Build your institutional playbook from a clean slate.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white/40 transition-all">
                                    Initialize <ChevronUp className="rotate-90" size={12} />
                                </div>
                            </button>

                            {/* Institutional Master */}
                            <button 
                                onClick={() => selectTemplate(INSTITUTIONAL_CORE_BLUEPRINT)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform relative z-10 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                                    <Shield size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-sky-400 transition-colors">Master Blueprint</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">The high-precision institutional framework for professional market interaction.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-sky-500/40 group-hover:text-sky-400 transition-all">
                                    Deploy Core <ChevronUp className="rotate-90" size={12} />
                                </div>
                            </button>

                            {/* ICT */}
                            <button 
                                onClick={() => selectTemplate(ICT_STRATEGY)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform relative z-10 border border-purple-500/20">
                                    <Zap size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-purple-400 transition-colors">ICT Architecture</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Time-based algorithmic models focusing on Killzones and DOL theory.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-purple-500/40 group-hover:text-purple-400 transition-all">
                                    Deploy Logic <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* SMC */}
                            <button 
                                onClick={() => selectTemplate(SMC_STRATEGY)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform relative z-10 border border-emerald-500/20">
                                    <Target size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-emerald-400 transition-colors">SMC Structure</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Smart Money footprint tracking via BOS, CHoCH, and Inducement cycles.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500/40 group-hover:text-emerald-400 transition-all">
                                    Deploy Structure <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* ORB */}
                            <button 
                                onClick={() => selectTemplate(ORB_STRATEGY)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-500/20">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-blue-400 transition-colors">Opening Range</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Volatility-based breakout models focusing on session volatility spikes.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-blue-500/40 group-hover:text-blue-400 transition-all">
                                    Deploy Momentum <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* CRT */}
                            <button 
                                onClick={() => selectTemplate(CRT_STRATEGY)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform relative z-10 border border-rose-500/20">
                                    <Flame size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-rose-400 transition-colors">Range Theory</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Granular OHLC internal range analysis and wick-fill mechanical models.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-rose-500/40 group-hover:text-rose-400 transition-all">
                                    Deploy CRT <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* Wyckoff */}
                            <button 
                                onClick={() => selectTemplate(WYCKOFF_BLUEPRINT)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform relative z-10 border border-amber-500/20">
                                    <RotateCw size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-amber-400 transition-colors">Wyckoff Logic</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Composite Man theory focusing on Accumulation and Distribution springs.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-amber-500/40 group-hover:text-amber-400 transition-all">
                                    Deploy Wyckoff <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* Volume Profile */}
                            <button 
                                onClick={() => selectTemplate(VOLUME_PROFILE_STRATEGY)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-sky-400/30 hover:bg-sky-400/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-sky-400/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform relative z-10 border border-sky-400/20">
                                    <BarChart2 size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-sky-400 transition-colors">Volume Profile</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Auction Market Theory analysis via POC and Value Area shifts.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-sky-400/40 group-hover:text-sky-400 transition-all">
                                    Deploy Auction <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* Price Action */}
                            <button 
                                onClick={() => selectTemplate(PRICE_ACTION_SCALPING)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform relative z-10 border border-orange-500/20">
                                    <Zap size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-orange-400 transition-colors">Scalping Pro</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">High-frequency price action geometric models for precision entries.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-orange-500/40 group-hover:text-orange-400 transition-all">
                                    Deploy Scalper <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* Macro Sentiment */}
                            <button 
                                onClick={() => selectTemplate(MACRO_SENTIMENT_BLUEPRINT)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform relative z-10 border border-indigo-500/20">
                                    <Globe size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-indigo-400 transition-colors">Macro Sentiment</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Intermarket analysis and fundamental narrative-driven structural models.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-indigo-500/40 group-hover:text-indigo-400 transition-all">
                                    Deploy Macro <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* Trading Plan */}
                            <button 
                                onClick={() => selectTemplate(TRADING_PLAN_BLUEPRINT)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-zinc-500/30 hover:bg-zinc-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-zinc-500/10 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform relative z-10 border border-zinc-500/20">
                                    <FileText size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-zinc-200 transition-colors">Plan Architecture</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Complete standard operating procedure for consistent trade execution.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500/40 group-hover:text-zinc-200 transition-all">
                                    Deploy SOP <ChevronRight size={12} />
                                </div>
                            </button>

                            {/* Session Narrative */}
                            <button 
                                onClick={() => selectTemplate(SESSION_NARRATIVE_BLUEPRINT)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform relative z-10 border border-cyan-500/20">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-cyan-400 transition-colors">Session Timing</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Time-based logic for high-probability execution windows.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-cyan-500/40 group-hover:text-cyan-400 transition-all">
                                    Deploy Timing <ChevronUp className="rotate-90" size={12} />
                                </div>
                            </button>

                            {/* Psychology */}
                            <button 
                                onClick={() => selectTemplate(PSYCHOLOGY_MASTER_BLUEPRINT)}
                                className="group p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/[0.03] transition-all text-left flex flex-col justify-between rounded-3xl min-h-[300px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform relative z-10 border border-pink-500/20">
                                    <Compass size={24} />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <h3 className="text-lg font-black text-white/90 group-hover:text-pink-400 transition-colors">Psychology Master</h3>
                                    <p className="text-xs text-white/30 font-medium leading-relaxed">Mindset architecture for peak performance and emotional control.</p>
                                </div>
                                <div className="relative z-10 pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-pink-500/40 group-hover:text-pink-400 transition-all">
                                    Deploy Mindset <ChevronUp className="rotate-90" size={12} />
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
                                    onReorder={(newBlocks) => setData(prev => ({ ...prev, blocks: newBlocks }))}
                                    className="space-y-0 pb-32 relative"
                                >
                                    {data.blocks.map((block, idx) => (
                                        <EditorBlock 
                                            key={block.id} 
                                            block={block} 
                                            updateBlock={updateBlock} 
                                            removeBlock={removeBlock}
                                            addBlockAt={addBlockAt}
                                            isLast={idx === data.blocks.length - 1}
                                            isFocused={focusedBlockId === block.id}
                                            onFocus={setFocusedBlockId}
                                            onImageClick={setActiveImage}
                                            onRemoveWithFocus={removeBlockWithFocus}
                                            blockIndex={idx}
                                            allBlocks={data.blocks}
                                            triggerSave={handleSave}
                                        />
                                    ))}

                                    {/* Notion-like Click-to-add Area */}
                                    <div 
                                        className="w-full h-[400px] cursor-text group/add mt-4"
                                        onClick={() => addBlockAt(data.blocks.length)}
                                    >
                                        <div className="opacity-0 group-hover/add:opacity-100 transition-opacity pl-24 pointer-events-none">
                                            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic">
                                                Click to expand the blueprint architecture...
                                            </span>
                                        </div>
                                    </div>
                                </Reorder.Group>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                                <StrategyMindMap blocks={data.blocks} />
                            </div>
                        )}
                    </>
                )}
            </main>
            
            {/* Image Lightbox Overlay */}
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
                                alt="Strategy Artifact" 
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
