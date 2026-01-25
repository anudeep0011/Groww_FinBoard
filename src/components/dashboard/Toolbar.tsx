"use client";

import React, { useEffect, useState } from "react";
import { Plus, LayoutTemplate, Moon, Sun, Save, BarChart3, List, CreditCard, Settings } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";
import { GlobalSettingsModal } from "./GlobalSettingsModal";

import { AddWidgetModal } from "./AddWidgetModal";

export function Toolbar() {
    const { isEditMode, toggleEditMode, theme, setTheme } = useDashboardStore();
    const [mounted, setMounted] = useState(false);
    const [isAddFuncOpen, setIsAddFuncOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">

            {isAddFuncOpen && (
                <AddWidgetModal onClose={() => setIsAddFuncOpen(false)} />
            )}

            <div className="flex items-center gap-2 p-1.5 bg-card/80 backdrop-blur-md border border-border/50 rounded-full shadow-2xl">
                <button
                    onClick={() => setIsAddFuncOpen(true)}
                    className={cn("flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20", isAddFuncOpen && "ring-2 ring-offset-1 ring-primary")}
                >
                    <Plus className={cn("w-4 h-4 transition-transform", isAddFuncOpen && "rotate-45")} />
                    <span className="font-medium text-sm">Add Widget</span>
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={cn(
                            "p-2 rounded-full transition-colors hover:bg-muted text-muted-foreground hover:text-foreground",
                            isMenuOpen && "bg-muted text-foreground"
                        )}
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <>
                            {/* Backdrop to close */}
                            <div className="fixed inset-0 z-0" onClick={() => setIsMenuOpen(false)} />

                            {/* Popover Menu */}
                            <div className="absolute bottom-full right-0 mb-3 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-10 p-1">
                                <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-70">
                                    Dashboard
                                </div>

                                <button
                                    onClick={() => {
                                        toggleEditMode();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-between hover:bg-muted hover:text-foreground text-muted-foreground"
                                >
                                    <div className="flex items-center gap-2">
                                        <LayoutTemplate className="w-3.5 h-3.5" />
                                        <span>Edit Layout</span>
                                    </div>
                                    <div className={cn("w-8 h-4 rounded-full relative transition-colors", isEditMode ? "bg-primary" : "bg-muted-foreground/30")}>
                                        <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", isEditMode ? "left-4.5" : "left-0.5")} style={{ left: isEditMode ? 'calc(100% - 14px)' : '2px' }} />
                                    </div>
                                </button>

                                <button
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-between hover:bg-muted hover:text-foreground text-muted-foreground"
                                >
                                    <div className="flex items-center gap-2">
                                        {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                                        <span>Dark Mode</span>
                                    </div>
                                    <div className={cn("w-8 h-4 rounded-full relative transition-colors", theme === 'dark' ? "bg-primary" : "bg-muted-foreground/30")}>
                                        <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all")} style={{ left: theme === 'dark' ? 'calc(100% - 14px)' : '2px' }} />
                                    </div>
                                </button>


                            </div>
                        </>
                    )}
                </div>
            </div>

            {isSettingsOpen && (
                <GlobalSettingsModal onClose={() => setIsSettingsOpen(false)} />
            )}
        </div>
    );
}
