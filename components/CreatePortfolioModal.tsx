
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, CreditCard, Target, ArrowUpCircle, ArrowDownCircle, Info, Layout, Wallet } from 'lucide-react';

interface CreatePortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (portfolio: any) => void;
}

export default function CreatePortfolioModal({ isOpen, onClose, onSuccess }: CreatePortfolioModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        accountType: 'Live',
        initialBalance: '',
        currentBalance: '',
        goal: '',
        deposits: '',
        withdrawals: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/portfolios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                onSuccess(data);
                onClose();
            } else {
                const err = await res.json();
                setError(err.message || 'Failed to create portfolio');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Use a Portal to ensure the modal sits on top of everything
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-background border border-border rounded-3xl w-full max-w-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <div className="p-8 border-b border-border flex justify-between items-center bg-foreground/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
                            <Plus className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Initialize Portfolio</h2>
                            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1 italic">V1.0 Account Deployment</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-all text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-10">
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl font-mono animate-in slide-in-from-top-2">
                            <Info size={14} />
                            <span>SYSTEM ERROR: {error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Section 1: Identity */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Layout size={14} className="text-muted-foreground" />
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Deployment Identity</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1">Portfolio Identifier</label>
                                    <input 
                                        required
                                        className="w-full bg-foreground/[0.02] border border-border rounded-xl px-5 py-4 text-foreground focus:border-primary/40 focus:bg-foreground/[0.04] outline-none transition-all placeholder:text-muted-foreground/30"
                                        placeholder="e.g. ALPHA_FUND_01"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1">Classification</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-foreground/[0.02] border border-border rounded-xl px-5 py-4 text-foreground focus:border-primary/40 outline-none appearance-none cursor-pointer"
                                            value={formData.accountType}
                                            onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                                        >
                                            <option value="Live">Live Market Account</option>
                                            <option value="Evaluation">Prop Firm Evaluation</option>
                                            <option value="Funded">Funded Prop Account</option>
                                            <option value="Backtest">Historical Backtest</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                            <Plus size={14} className="rotate-45" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1">Brief Description</label>
                                    <textarea 
                                        className="w-full bg-foreground/[0.02] border border-border rounded-xl px-5 py-4 text-foreground focus:border-primary/40 outline-none resize-none h-28 placeholder:text-muted-foreground/30"
                                        placeholder="Operational parameters or strategy notes..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Financials */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet size={14} className="text-muted-foreground" />
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Financial Parameters</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1">
                                            Initial Capital
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" size={14} />
                                            <input 
                                                type="number"
                                                className="w-full bg-foreground/[0.02] border border-border rounded-xl pl-12 pr-5 py-4 text-foreground focus:border-primary/40 outline-none"
                                                placeholder="0.00"
                                                value={formData.initialBalance}
                                                onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1">
                                            Current Equity
                                        </label>
                                        <div className="relative">
                                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" size={14} />
                                            <input 
                                                type="number"
                                                className="w-full bg-foreground/[0.02] border border-border rounded-xl pl-12 pr-5 py-4 text-foreground focus:border-primary/40 outline-none"
                                                placeholder="0.00"
                                                value={formData.currentBalance}
                                                onChange={(e) => setFormData({...formData, currentBalance: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1">
                                        Account Objective / Goal
                                    </label>
                                    <div className="relative group">
                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" size={16} />
                                        <input 
                                            type="number"
                                            className="w-full bg-primary/[0.02] border border-primary/10 rounded-xl pl-12 pr-5 py-4 text-foreground focus:border-primary/40 outline-none font-bold text-lg"
                                            placeholder="50,000.00"
                                            value={formData.goal}
                                            onChange={(e) => setFormData({...formData, goal: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1 text-emerald-500/70">
                                            Total Deposits
                                        </label>
                                        <div className="relative">
                                            <ArrowUpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/30" size={14} />
                                            <input 
                                                type="number"
                                                className="w-full bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl pl-12 pr-5 py-4 text-foreground focus:border-emerald-500/30 outline-none"
                                                placeholder="0.00"
                                                value={formData.deposits}
                                                onChange={(e) => setFormData({...formData, deposits: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-mono mb-2 px-1 text-red-500/70">
                                            Total Withdraws
                                        </label>
                                        <div className="relative">
                                            <ArrowDownCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/30" size={14} />
                                            <input 
                                                type="number"
                                                className="w-full bg-red-500/[0.02] border border-red-500/10 rounded-xl pl-12 pr-5 py-4 text-foreground focus:border-red-500/30 outline-none"
                                                placeholder="0.00"
                                                value={formData.withdrawals}
                                                onChange={(e) => setFormData({...formData, withdrawals: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground font-bold py-5 rounded-2xl transition-all border border-border text-sm uppercase tracking-widest"
                        >
                            Abort
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black py-5 rounded-2xl transition-all shadow-2xl shadow-foreground/5 disabled:opacity-50 text-sm uppercase tracking-[0.2em]"
                        >
                            {loading ? 'INITIALIZING...' : 'DEPLOY PORTFOLIO'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
