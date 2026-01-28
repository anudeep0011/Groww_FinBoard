"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, User, Shield, Key, Database, AlertTriangle, KeyRound, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProfile, updatePassword, deleteUser } from "firebase/auth";

interface UserConfigCardProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "profile" | "settings"; // Optional initial focus
}

type TabId = "general" | "security" | "api" | "data";

export function UserConfigCard({ isOpen, onClose, initialTab = "profile" }: UserConfigCardProps) {
    const { user } = useAuth();
    const { apiKeys, setApiKey, importDashboard, addWidget, setEditingWidgetId, widgets } = useDashboardStore();

    // Portal mounting state
    const [mounted, setMounted] = useState(false);

    // Map initialTab to specific internal tabs
    const [activeTab, setActiveTab] = useState<TabId>(initialTab === "settings" ? "api" : "general");

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab === "settings" ? "api" : "general");
        }
    }, [isOpen, initialTab]);

    // Profile Form State
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);



    if (!isOpen || !mounted) return null;

    // --- Actions ---

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            if (user) {
                await updateProfile(user, { displayName: displayName });
                setMessage({ type: 'success', text: "Profile updated successfully" });
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            setMessage({ type: 'error', text: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" });
            return;
        }
        setIsLoading(true);
        setMessage(null);
        try {
            if (user) {
                await updatePassword(user, newPassword);
                setMessage({ type: 'success', text: "Password changed successfully" });
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            setMessage({ type: 'error', text: "Error (Requires recent login): " + msg });
        } finally {
            setIsLoading(false);
        }
    };

    const SidebarItem = ({ id, label, icon: Icon, colorClass }: { id: TabId, label: string, icon: LucideIcon, colorClass?: string }) => (
        <button
            onClick={() => { setActiveTab(id); setMessage(null); }}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                activeTab === id && colorClass
            )}
        >
            <Icon className={cn("w-4 h-4", activeTab === id ? "opacity-100" : "opacity-70")} />
            {label}
        </button>
    );

    // Render via Portal to escape parent stacking contexts (e.g., sticky headers with filters)
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Main Card Container */}
            <div className="bg-card w-full max-w-2xl h-[500px] border border-border rounded-xl shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-200 relative">

                {/* Close Button Mobile Overlay (Optional, though we have one inside) */}

                {/* Sidebar */}
                <div className="w-56 bg-muted/20 border-r border-border p-4 flex flex-col justify-between hidden md:flex">
                    <div className="space-y-6">
                        <div className="px-2">
                            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                Account
                            </h2>
                        </div>

                        <div className="space-y-1">
                            <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profile</p>
                            <SidebarItem id="general" label="General" icon={User} />
                            <SidebarItem id="security" label="Security" icon={Shield} />
                        </div>

                        <div className="space-y-1">
                            <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Settings</p>
                            <SidebarItem id="api" label="API Keys" icon={Key} />
                            <SidebarItem id="data" label="Data" icon={Database} />
                        </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground px-3 opacity-50">
                        FinBoard v1.0.0
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50">
                        <h3 className="font-semibold text-foreground">
                            {activeTab === "general" && "Profile Details"}
                            {activeTab === "security" && "Security Settings"}
                            {activeTab === "api" && "API Configuration"}
                            {activeTab === "data" && "Data Management"}
                        </h3>
                        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {message && (
                            <div className={cn(
                                "mb-6 p-3 rounded-lg text-xs font-medium flex items-center gap-2",
                                message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                            )}>
                                {message.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}

                        {activeTab === "general" && (
                            <div className="max-w-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{user?.displayName || "User"}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="max-w-sm space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Change Password</h4>
                                        <p className="text-[10px] text-muted-foreground mb-3">Ensure your account is using a long, random password to stay secure.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !newPassword}
                                            className="px-3 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>

                                <hr className="border-border/50" />

                                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                                    <h4 className="text-sm font-medium text-destructive mb-1">Delete Account</h4>
                                    <p className="text-[10px] text-muted-foreground mb-3">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <button
                                        onClick={async () => {
                                            if (confirm("Are you SURE you want to delete your account? This cannot be undone.")) {
                                                if (user) {
                                                    try {
                                                        await deleteUser(user);
                                                        onClose();
                                                    } catch (e: unknown) {
                                                        const msg = e instanceof Error ? e.message : String(e);
                                                        setMessage({ type: 'error', text: "Start delete failed: " + msg });
                                                    }
                                                }
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:bg-destructive/90 transition-colors"
                                    >
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "api" && (
                            <div className="max-w-md space-y-6 animate-in slide-in-from-bottom-2 duration-300 relative">

                                <p className="text-sm text-muted-foreground">
                                    Configure API keys for external data providers. You can also add custom keys to use in widgets via <code>{`{{KEY_NAME}}`}</code>.
                                </p>

                                {/* Pre-defined Providers */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Standard Providers</h4>

                                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium">Finnhub</h3>
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Real-time</span>
                                        </div>
                                        <input
                                            type="password"
                                            value={apiKeys.FINNHUB || ""}
                                            onChange={(e) => setApiKey("FINNHUB", e.target.value)}
                                            placeholder="Enter Finnhub API Key"
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                        <div className="mt-2 text-[10px] text-muted-foreground">
                                            Get a free key at <a href="https://finnhub.io/" target="_blank" rel="noreferrer" className="text-primary hover:underline">finnhub.io</a>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50 opacity-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium">Alpha Vantage</h3>
                                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Historical</span>
                                        </div>
                                        <input
                                            type="password"
                                            value={apiKeys.ALPHA_VANTAGE || ""}
                                            onChange={(e) => setApiKey("ALPHA_VANTAGE", e.target.value)}
                                            placeholder="Enter Alpha Vantage API Key"
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>

                                {/* Widget APIs Section */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Widget APIs</h4>
                                        <div className="text-[10px] text-muted-foreground italic">
                                            Manage via Widgets
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {widgets.filter(w => w.type === "CUSTOM").map((widget) => (
                                            <div key={widget.id} className="bg-muted/30 p-3 rounded-lg border border-border/50 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                                                <div className="overflow-hidden mr-3">
                                                    <h5 className="text-sm font-medium truncate">{widget.title}</h5>
                                                    <p className="text-[10px] text-muted-foreground font-mono truncate opacity-70" title={widget.apiEndpoint}>
                                                        {widget.apiEndpoint}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (setEditingWidgetId) setEditingWidgetId(widget.id);
                                                        onClose();
                                                    }}
                                                    className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-2.5 py-1.5 rounded-md transition-all font-medium whitespace-nowrap opacity-0 group-hover:opacity-100"
                                                >
                                                    Edit API
                                                </button>
                                            </div>
                                        ))}

                                        {widgets.filter(w => w.type === "CUSTOM").length === 0 && (
                                            <div className="text-xs text-muted-foreground text-center py-4 italic border border-dashed border-border/50 rounded-lg">
                                                No custom API widgets added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "data" && (
                            <div className="max-w-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                    <h4 className="text-sm font-medium mb-1">Reset Dashboard</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Clear all widgets and restore the default state.
                                    </p>
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to completely reset your dashboard?")) {
                                                importDashboard({ widgets: [] });
                                                onClose();
                                            }
                                        }}
                                        className="w-full px-3 py-2 bg-background border border-border text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Reset All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >,
        document.body
    );
}

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
