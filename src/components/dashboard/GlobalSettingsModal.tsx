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
        setApiKey(localKey);
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

                    {localSource === "FINNHUB" && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                            <label className="text-xs font-medium text-muted-foreground">Finnhub API Key</label>
                            <div className="p-3 bg-muted/30 border border-border rounded-md text-xs text-muted-foreground">
                                <p className="mb-1">
                                    Using API key from environment variables.
                                </p>
                                <code className="block bg-black/10 dark:bg-white/10 p-1 rounded font-mono text-[10px]">
                                    NEXT_PUBLIC_FINNHUB_API_KEY
                                </code>
                                <p className="mt-2 opacity-70">
                                    To change, update your <span className="font-mono">.env.local</span> file.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 text-xs font-medium hover:bg-muted rounded-md transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2">
                        <Save className="w-3.5 h-3.5" /> Save & Reload
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
