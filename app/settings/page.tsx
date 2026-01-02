"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { 
  User as UserIcon, 
  Camera, 
  Trash2, 
  ShieldCheck, 
  Save, 
  AlertTriangle,
  Loader2,
  Fingerprint,
  Mail,
  LogOut,
  ChevronRight,
  Globe,
  Lock,
  Cpu,
  Database,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      // @ts-ignore
      setUsername(session.user.username || "");
      // @ts-ignore
      setName(session.user.name || "");
      // @ts-ignore
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    const promise = fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name, image }),
    });

    try {
      const res = await promise;
      const data = await res.json();
      
      if (!res.ok) {
        if (data.message?.includes('Username is locked')) {
          toast.error(data.message);
          // @ts-ignore
          setUsername(session?.user?.username || "");
        } else {
          toast.error(data.message || 'Profile update failed');
        }
        return;
      }

      await update({ 
        username: data.username, 
        name: data.name, 
        image: data.image 
      });

      setUsername(data.username || "");
      setName(data.name || "");
      setImage(data.image || "");
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const uploadPromise = fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    toast.promise(uploadPromise, {
      loading: 'Uploading image...',
      success: 'Profile photo updated!',
      error: 'Upload failed.',
    });

    try {
      const res = await uploadPromise;
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImage(data.url);
      
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, image: data.url }),
      });
      await update({ image: data.url });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete account");
      }

      toast.success("Account deleted successfully.");
      setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, 1500);
    } catch (error: any) {
      setDeleteError(error.message);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8 bg-background">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-secondary/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 relative z-10 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Settings Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-muted-foreground">
               <Lock size={10} className="text-primary/50" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Secure Connection</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
            Settings
          </h1>
          <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Manage your personal profile, account security, and application preferences. Fine-tune your terminal for peak operational efficiency."
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="group relative flex items-center gap-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 px-8 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-wider transition-all border border-red-500/20 active:scale-95"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Navigation / Metadata sidebar */}
        <aside className="lg:w-1/4 space-y-8">
          <div className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest block px-2">Account Status</label>
              {[
                { icon: <ShieldCheck size={14} />, label: "Security", value: "Active", color: "emerald" },
                { icon: <Database size={14} />, label: "Data Sync", value: "Online", color: "blue" },
                { icon: <Globe size={14} />, label: "Region", value: "Global", color: "purple" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-border rounded-2xl group hover:bg-foreground/[0.04] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`text-${stat.color}-400 group-hover:text-${stat.color}-300 transition-colors`}>{stat.icon}</div>
                    <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-foreground/80">{stat.value}</span>
                </div>
              ))}
            </div>

            <nav className="space-y-2 pt-8 border-t border-border">
              <label className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest block px-2 mb-4">Preferences</label>
              <button className="w-full flex items-center justify-between p-5 bg-foreground text-background rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg group transition-all">
                <div className="flex items-center gap-4">
                  <UserIcon size={16} />
                  <span>Profile</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </button>
              <button 
                disabled
                className="w-full flex items-center justify-between p-5 bg-foreground/[0.02] border border-border rounded-2xl text-muted-foreground/30 font-bold text-xs uppercase tracking-wider group cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <ShieldCheck size={16} />
                  <span>Security</span>
                </div>
                <Lock size={12} className="opacity-40" />
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-12">
          {/* Identity Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-xl border border-border rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group"
          >
            {/* Mesh Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/[0.06] transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12 border-b border-border pb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">Profile Settings</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Your Information</h2>
                </div>
                <div className="p-4 bg-foreground/[0.03] border border-border rounded-2xl">
                   <UserIcon size={24} className="text-muted-foreground/40" />
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-16">
                {/* Avatar Controller */}
                <div className="flex flex-col items-center">
                  <div className="relative group/avatar">
                    <div className="w-48 h-48 rounded-[3.5rem] bg-gradient-to-br from-foreground/5 to-transparent border border-border p-1 flex items-center justify-center overflow-hidden shadow-2xl relative">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                      <div className="w-full h-full rounded-[3.3rem] bg-background overflow-hidden flex items-center justify-center relative">
                        {image ? (
                          <img src={image} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110 duration-700" />
                        ) : (
                          <UserIcon size={64} className="text-muted-foreground/20" />
                        )}
                        <AnimatePresence>
                          {loading && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                            >
                              <Loader2 className="animate-spin text-blue-400" size={32} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-4 bg-foreground text-background rounded-2xl shadow-xl transition-all hover:bg-primary hover:text-primary-foreground active:scale-95 z-20 border border-border"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Profile Photo</span>
                    <div className="h-0.5 w-8 bg-foreground/10 rounded-full" />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
                        <Fingerprint size={14} className="text-primary/70" />
                        Username
                      </label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-6 flex items-center text-muted-foreground/30 font-mono text-sm group-focus-within/input:text-primary transition-colors">@</div>
                        <input 
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                          className="w-full bg-foreground/[0.03] border border-border rounded-[2rem] px-12 py-5 text-foreground font-bold tracking-wide focus:bg-foreground/[0.05] focus:border-primary/20 transition-all outline-none text-lg placeholder:text-muted-foreground/20"
                          placeholder="username"
                        />
                      </div>
                    </div>
 
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
                        <UserIcon size={14} className="text-primary/70" />
                        Display Name
                      </label>
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-foreground/[0.03] border border-border rounded-[2rem] px-8 py-5 text-foreground font-bold tracking-wide focus:bg-foreground/[0.05] focus:border-primary/20 transition-all outline-none text-lg placeholder:text-muted-foreground/20"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-foreground/[0.02] border border-border rounded-[2rem] relative overflow-hidden group/mail">
                     <div className="absolute inset-0 bg-primary/[0.01] opacity-0 group-hover/mail:opacity-100 transition-opacity" />
                     <div className="flex items-center gap-3 text-xs font-bold text-foreground/80 uppercase tracking-wider mb-3">
                       <Mail size={14} className="text-primary/50" />
                       Email Address
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-lg font-medium text-foreground/80 select-none cursor-not-allowed">
                          {session?.user?.email}
                       </span>
                       <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified</span>
                       </div>
                     </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/60 font-medium max-w-sm leading-relaxed">
                  <Info size={16} className="text-muted-foreground/20 shrink-0" />
                  Username changes are updated across the platform immediately.
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-foreground text-background hover:bg-primary hover:text-primary-foreground px-10 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 disabled:opacity-50 overflow-hidden relative group/save"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span className="relative z-10">Save Changes</span>
                </button>
              </div>
            </div>
          </motion.section>

          {/* Danger Zone Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/[0.02] border border-red-500/10 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-lg"
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
             
             <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
               <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                     <AlertTriangle size={24} className="text-red-500" />
                   </div>
                   <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Delete Account</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Irreversible Action</span>
                    </div>
                   </div>
                 </div>
                 <p className="text-sm text-red-200/50 font-medium leading-relaxed max-w-xl px-2">
                   This action will permanently delete your account, trading journal, and all associated data. This cannot be undone.
                 </p>
               </div>
               
               <button 
                 onClick={() => setShowDeleteModal(true)}
                 className="w-full xl:w-auto flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-10 py-5 rounded-[2.5rem] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl active:scale-95 group/purge"
               >
                 <Trash2 size={18} className="transition-transform group-hover/purge:scale-110" />
                 Delete Account
               </button>
             </div>
          </motion.section>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-card border border-red-500/20 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(220,38,38,0.1)] max-w-lg w-full relative z-10 text-center overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                  <ShieldCheck size={32} className="text-red-500" />
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Confirm Deletion</h3>
                <p className="text-muted-foreground/80 text-sm mb-10 leading-relaxed font-medium">
                  Please enter your password to confirm permanently deleting your account.
                </p>

                <div className="space-y-8">
                  <input 
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-red-500/[0.03] border border-red-500/20 rounded-[2rem] px-8 py-5 text-foreground text-center font-bold outline-none focus:border-red-500/50 focus:bg-red-500/[0.05] placeholder:text-red-500/20 text-xl tracking-widest transition-all"
                    placeholder="PASSWORD"
                    autoFocus
                  />

                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-8 py-4 rounded-[2rem] bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword}
                      className="flex-1 px-8 py-4 rounded-[2rem] bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
