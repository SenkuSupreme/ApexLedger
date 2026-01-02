
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, Search, User, Zap, LayoutDashboard, Calculator, Calendar as CalendarIcon, Book, BookOpen, BarChart2, BarChart3, Layers, Goal, CheckSquare, Settings, LogOut, FileText, Activity, Eye, Timer, Microscope, TrendingUp, Newspaper, Target, StickyNote, Notebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });

    return (
        <div className="hidden xl:flex items-center gap-6 px-5 py-2 bg-foreground/[0.03] border border-border rounded-2xl">
            <div className="flex flex-col items-start border-r border-border pr-6">
                <span className="text-[10px] text-foreground/60 font-black uppercase leading-none mb-1.5 tracking-widest">Time</span>
                <span className="text-[11px] text-foreground/80 font-black uppercase tracking-wider">{currentTime.getHours() % 12 || 12}:{currentTime.getMinutes() < 10 ? `0${currentTime.getMinutes()}` : currentTime.getMinutes()} {currentTime.getHours() >= 12 ? 'PM' : 'AM'}</span>
            </div>
            <div className="flex flex-col items-start">
                <span className="text-[10px] text-foreground/60 font-black uppercase leading-none mb-1.5 tracking-widest">Date</span>
                <span className="text-[11px] text-foreground/80 font-black uppercase tracking-wider">{formattedDate}</span>
            </div>
        </div>
    );
}

import React from 'react';
import { toast } from 'sonner';

import { ThemeToggle } from './ThemeToggle';
import QuickLinks from './QuickLinks';

const Header = React.memo(function Header() {
    // @ts-ignore
    const { data: session } = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const SESSIONS = [
      { name: 'Sydney Session', start: 22, end: 7 }, 
      { name: 'Tokyo Session', start: 0, end: 9 },
      { name: 'London Session', start: 8, end: 16 },
      { name: 'New York Session', start: 13, end: 22 },
    ];

    useEffect(() => {
        // Load notifications from local storage or init defaults
        const stored = localStorage.getItem('apex_notifications');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Ensure unique IDs (fix for existing duplicates in storage)
                const unique = Array.from(new Map(parsed.map((n: any) => [n.id, n])).values());
                setNotifications(unique);
                setUnreadCount(unique.filter((n: any) => !n.read).length);
                if (unique.length !== parsed.length) {
                    localStorage.setItem('apex_notifications', JSON.stringify(unique));
                }
            } catch (e) {
                setNotifications([]);
            }
        } else {
            // Initial welcome notification
            const initial = [
                { id: `init-${Date.now()}`, title: 'System Status', message: 'Connected to server.', time: new Date().toISOString(), type: 'success', read: false }
            ];
            setNotifications(initial);
            setUnreadCount(1);
            localStorage.setItem('apex_notifications', JSON.stringify(initial));
        }

        // Check for session openings
        const checkSessions = () => {
             const now = new Date();
             const utcHour = now.getUTCHours();
             
             // Check for specific Overlaps
             const isLondonNY = utcHour >= 13 && utcHour < 16; // 1pm - 4pm UTC
             const isTokyoLondon = utcHour >= 8 && utcHour < 9; // 8am - 9am UTC (brief overlap)

             if (isLondonNY) {
                 addNotification({
                     title: 'London / NY Overlap',
                     message: 'High volume overlap session is active. Volatility expected.',
                     type: 'info'
                 });
             } else if (isTokyoLondon) {
                  addNotification({
                     title: 'Tokyo / London Overlap',
                     message: 'Session handover active.',
                     type: 'info'
                 });
             }

             // Check individual session starts
             SESSIONS.forEach(sess => {
                 if (utcHour === sess.start) {
                     addNotification({
                         title: `${sess.name}`,
                         message: `The ${sess.name} has officially started.`,
                         type: 'info'
                     });
                 }
             });
        };

        const interval = setInterval(checkSessions, 60000 * 60); // Check every hour
        checkSessions(); // Check immediately on mount mainly for active session status in a real app, simplified here
        
        return () => clearInterval(interval);

    }, []);
    
    const addNotification = (note: { title: string, message: string, type: string }) => {
        setNotifications(prev => {
            // Prevent duplicates for same title within last hour
            const exists = prev.find(n => n.title === note.title && (new Date().getTime() - new Date(n.time).getTime() < 3600000));
            if (exists) return prev;

            const newNote = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                ...note,
                time: new Date().toISOString(),
                read: false
            };
            const updated = [newNote, ...prev].slice(0, 10); // Keep last 10
            localStorage.setItem('apex_notifications', JSON.stringify(updated));
            setUnreadCount(updated.filter(n => !n.read).length);
            
            // Trigger toast
            toast(note.title, {
                description: note.message,
                icon: note.type === 'success' ? <Zap size={16} className="text-green-400" /> : <Bell size={16} className="text-blue-400" />,
                className: "bg-card border-border text-foreground rounded-2xl p-4 shadow-2xl",
            });

            return updated;
        });
    }

    const markAllRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
             localStorage.setItem('apex_notifications', JSON.stringify(updated));
             setUnreadCount(0);
             return updated;
        });
    };

    useEffect(() => {
        const handleCustomNotification = (e: any) => {
            if (e.detail) addNotification(e.detail);
        };
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        window.addEventListener('apex-notification', handleCustomNotification);
        document.addEventListener("keydown", down);
        
        // Social Pulse - Mocking/Simulating social activity for the demo
        const socialPulse = setInterval(() => {
             const shouldSimulate = Math.random() > 0.95; 
             if (shouldSimulate) {
                 const types = [
                     { title: 'New Like', message: 'Someone liked your recent trade analysis.', type: 'info' },
                     { title: 'New Comment', message: 'A trader commented on your strategy.', type: 'info' }
                 ];
                 const randomNote = types[Math.floor(Math.random() * types.length)];
                 addNotification(randomNote);
             }
        }, 30000);

        return () => {
            window.removeEventListener('apex-notification', handleCustomNotification);
            document.removeEventListener("keydown", down);
            clearInterval(socialPulse);
        };
    }, [session]);

    const runCommand = (command: () => void) => {
      setOpen(false)
      command()
    }

    // @ts-ignore
    const username = session?.user?.username || "Trader";

    return (
        <>
            <header className="sticky top-0 z-[30] w-full border-b border-border bg-background/60 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setOpen(true)}
                            className="hidden md:flex items-center gap-3 bg-foreground/[0.03] border border-border px-4 py-2 rounded-xl hover:bg-foreground/[0.06] transition-all text-left w-64 group"
                        >
                            <Search size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
                            <span className="text-[11px] font-medium text-muted-foreground/40 uppercase tracking-wider flex-1 group-hover:text-muted-foreground/60 transition-colors">Search...</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-foreground/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/40 opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>

                        <div className="hidden lg:block h-8 w-px bg-border mx-2" />
                        
                        <div className="hidden lg:block">
                            <QuickLinks />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Clock />
                        {/* <ThemeToggle /> */}

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative p-2 text-muted-foreground/60 hover:text-foreground transition-colors outline-none">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-background animate-pulse" />
                                )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 bg-card border border-border text-foreground p-2 shadow-2xl rounded-2xl mr-12">
                                <div className="flex items-center justify-between py-4 px-3">
                                    <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 p-0">Notifications</DropdownMenuLabel>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-[9px] text-blue-400 font-bold uppercase tracking-wider hover:text-blue-300 transition-colors">
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <DropdownMenuSeparator className="bg-border" />
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground/40 text-xs font-medium italic">No notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <DropdownMenuItem key={n.id} className={`focus:bg-foreground/5 rounded-xl p-4 cursor-pointer mb-1 group transition-all ${n.read ? 'opacity-50' : 'opacity-100'}`}>
                                            <div className="space-y-1.5 w-full">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold flex items-center gap-2 text-foreground/80 group-hover:text-foreground">
                                                        <Zap size={14} className={n.type === 'success' ? "text-green-400" : "text-yellow-400"} /> {n.title}
                                                    </p>
                                                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground/70 leading-relaxed group-hover:text-foreground/60 line-clamp-2">{n.message}</p>
                                                <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">
                                                    {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Profile */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <div className="flex items-center gap-3 pl-6 border-l border-border hover:opacity-80 transition-opacity cursor-pointer">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[13px] font-black text-foreground leading-none mb-1.5">{session?.user?.name}</p>
                                        <p className="text-[10px] text-muted-foreground/80 font-black uppercase leading-none tracking-[0.1em]">@{username}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-card to-background border border-border flex items-center justify-center text-sm font-bold shadow-lg shadow-background/40">
                                        {session?.user?.name?.[0] || 'U'}
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-card border border-border text-foreground p-2 shadow-2xl rounded-2xl mr-4">
                                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 py-3 px-3">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem onClick={() => router.push('/settings')} className="focus:bg-foreground/5 rounded-xl p-3 cursor-pointer group transition-all text-xs font-bold text-muted-foreground/80 focus:text-foreground">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Profile Settings</span>
                                </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="focus:bg-red-500/10 rounded-xl p-3 cursor-pointer group transition-all text-xs font-bold text-red-500 focus:text-red-500 mt-1">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Analytics">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/journal'))}>
                            <Book className="mr-2 h-4 w-4" />
                            <span>Journal</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/calendar'))}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Calendar</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Performance">
                        <CommandItem onSelect={() => runCommand(() => router.push('/bias'))}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Bias</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/sessions'))}>
                            <Timer className="mr-2 h-4 w-4" />
                            <span>Sessions</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/strategy'))}>
                            <Layers className="mr-2 h-4 w-4" />
                            <span>Strategy</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/market-environment'))}>
                            <Microscope className="mr-2 h-4 w-4" />
                            <span>Market Environment</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/execution-architecture'))}>
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Execution Architecture</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/signal-trigger'))}>
                            <Zap className="mr-2 h-4 w-4" />
                            <span>Signal Trigger</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/technical-confluence'))}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Technical Confluence</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Strategy">
                        <CommandItem onSelect={() => runCommand(() => router.push('/strategies'))}>
                            <Layers className="mr-2 h-4 w-4" />
                            <span>Strategies</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/checklists'))}>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            <span>Checklists</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/backtester'))}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span>Backtester</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Tools">
                       <CommandItem onSelect={() => runCommand(() => router.push('/chart'))}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Live Charts</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/news'))}>
                            <Newspaper className="mr-2 h-4 w-4" />
                            <span>News</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/research'))}>
                            <Microscope className="mr-2 h-4 w-4" />
                            <span>Research</span>
                        </CommandItem>
                       <CommandItem onSelect={() => runCommand(() => router.push('/calculator'))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Position Calculator</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Productivity">
                         <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            <span>Tasks</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/goals'))}>
                            <Target className="mr-2 h-4 w-4" />
                            <span>Goals</span>
                        </CommandItem>
                         <CommandItem onSelect={() => runCommand(() => router.push('/habits'))}>
                            <Activity className="mr-2 h-4 w-4" />
                            <span>Habits</span>
                        </CommandItem>
                         <CommandItem onSelect={() => runCommand(() => router.push('/activity-log'))}>
                            <StickyNote className="mr-2 h-4 w-4" />
                            <span>Activity Log</span>
                        </CommandItem>
                         <CommandItem onSelect={() => runCommand(() => router.push('/notebook'))}>
                            <Notebook className="mr-2 h-4 w-4" />
                            <span>Notebook</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
});

export default Header;
