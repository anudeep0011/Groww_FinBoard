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
    const [isAddFuncOpen, setIsAddFuncOpen] = useState(false); // Renamed to avoid confusion with internal popover
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

            <div className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-full shadow-2xl">
                <button
                    onClick={() => setIsAddFuncOpen(true)}
                    className={cn("flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20", isAddFuncOpen && "ring-2 ring-offset-1 ring-primary")}
                >
                    <Plus className={cn("w-4 h-4 transition-transform", isAddFuncOpen && "rotate-45")} />
                    <span className="font-medium text-sm">Add Widget</span>
                </button>

                <div className="w-px h-6 bg-border mx-1" />

                <button
                    onClick={toggleEditMode}
                    className={cn(
                        "p-2 rounded-full transition-colors hover:bg-accent/10 hover:text-accent",
                        isEditMode ? "text-accent bg-accent/10" : "text-muted-foreground"
                    )}
                    title={isEditMode ? "Save Layout" : "Edit Layout"}
                >
                    {isEditMode ? <Save className="w-5 h-5" /> : <LayoutTemplate className="w-5 h-5" />}
                </button>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-full transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Toggle Theme"
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>
            </div>

            {isSettingsOpen && (
                <GlobalSettingsModal onClose={() => setIsSettingsOpen(false)} />
            )}
        </div>
    );
}
