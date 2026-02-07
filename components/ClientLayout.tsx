'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import QuickNotes from './QuickNotes';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Load persisted state on mount
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  };
  const pathname = usePathname();
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
        // Force instant scroll to top, bypassing any smooth scroll CSS
        mainScrollRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center text-white/60 bg-black font-mono text-xs uppercase tracking-widest animate-pulse">Loading...</div>;
  }

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen text-foreground selection:bg-primary/20">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={handleSidebarCollapse} />
      <div 
        ref={mainScrollRef} 
        className={`flex-1 flex flex-col h-screen overflow-y-auto scrollbar-hide transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[220px]'}`}
      >
        <Header />
        <main className="relative flex-1">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "linear" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
      <QuickNotes />
      <Toaster position="top-right" theme="system" richColors closeButton />
    </div>
  );
}
