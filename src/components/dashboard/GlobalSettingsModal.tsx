"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalSettingsModalProps {
    onClose: () => void;
}

export function GlobalSettingsModal({ onClose }: GlobalSettingsModalProps) {
    const { dataSource, apiKey, setDataSource, setApiKey } = useDashboardStore();

    const [localSource, setLocalSource] = useState<"MOCK" | "FINNHUB">(dataSource);
    const [localKey, setLocalKey] = useState(apiKey);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setLocalSource(dataSource);
        setLocalKey(apiKey);
    }, [dataSource, apiKey]);

    const handleSave = () => {
        setDataSource(localSource);
        setApiKey("FINNHUB", localKey);
        onClose();
        // Force reload to apply new data source widely if needed
        window.location.reload();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                    <h3 className="font-semibold text-sm">Dashboard Settings</h3>
                    <button onClick={onClose} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Data Source</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setLocalSource("MOCK")}
                                className={cn(
                                    "px-3 py-2 rounded-md text-xs font-medium border transition-colors",
                                    localSource === "MOCK"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                                )}
                            >
                                Mock Data
                            </button>
                            <button
                                onClick={() => setLocalSource("FINNHUB")}
                                className={cn(
                                    "px-3 py-2 rounded-md text-xs font-medium border transition-colors",
                                    localSource === "FINNHUB"
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                                )}
                            >
                                Finnhub API
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Theme Preference</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    document.documentElement.classList.remove('dark');
                                    useDashboardStore.getState().setTheme("light");
                                }}
                                className="px-3 py-2 rounded-md text-xs font-medium border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center gap-2"
                            >
                                <span className="w-3 h-3 rounded-full bg-yellow-400" /> Light
                            </button>
                            <button
                                onClick={() => {
                                    document.documentElement.classList.add('dark');
                                    useDashboardStore.getState().setTheme("dark");
                                }}
                                className="px-3 py-2 rounded-md text-xs font-medium border border-transparent bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center gap-2"
                            >
                                <span className="w-3 h-3 rounded-full bg-slate-400" /> Dark
                            </button>
                        </div>
                    </div>

                    {localSource === "FINNHUB" && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                            <label className="text-xs font-medium text-muted-foreground">Finnhub API Key</label>
                            <input
                                type="text"
                                placeholder="Paste your Finnhub Key here"
                                value={localKey}
                                onChange={(e) => setLocalKey(e.target.value)}
                                className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background focus:ring-1 focus:ring-primary outline-none"
                            />
                            <p className="text-[10px] text-muted-foreground opacity-70">
                                Leave empty to be prompted later. Key is stored locally.
                            </p>
                        </div>
                    )}

                    <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-2">
                        <button onClick={onClose} className="px-3 py-2 text-xs font-medium hover:bg-muted rounded-md transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2">
                            <Save className="w-3.5 h-3.5" /> Save & Reload
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
