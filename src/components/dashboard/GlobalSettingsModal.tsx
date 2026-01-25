"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, Save, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalSettingsModalProps {
    onClose: () => void;
}

export function GlobalSettingsModal({ onClose }: GlobalSettingsModalProps) {
    const { dataSource, apiKey, setDataSource, setApiKey } = useDashboardStore();

    const [localSource, setLocalSource] = useState<"MOCK" | "FINNHUB">(dataSource);
    const [localKey, setLocalKey] = useState(apiKey);
    const [mounted, setMounted] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "TESTING" | "SUCCESS" | "ERROR">("IDLE");

    useEffect(() => {
        setMounted(true);
        setLocalSource(dataSource);
        setLocalKey(apiKey);
    }, [dataSource, apiKey]);

    if (!mounted) return null;

    const verifyKey = async () => {
        if (!localKey) return;
        setStatus("TESTING");
        try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${localKey}`);
            if (!res.ok) throw new Error("Invalid Key");
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setStatus("SUCCESS");
            setTimeout(() => setStatus("IDLE"), 3000);
        } catch (e) {
            setStatus("ERROR");
            setTimeout(() => setStatus("IDLE"), 3000);
        }
    };

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
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={localKey}
                                    onChange={(e) => setLocalKey(e.target.value)}
                                    placeholder="Enter your API key..."
                                    className="flex-1 h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={verifyKey}
                                    disabled={status === "TESTING" || !localKey}
                                    className={cn(
                                        "px-3 h-9 text-xs font-medium rounded-md border transition-colors whitespace-nowrap",
                                        status === "SUCCESS" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                            status === "ERROR" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                "bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground"
                                    )}
                                >
                                    {status === "TESTING" ? "..." :
                                        status === "SUCCESS" ? "Valid" :
                                            status === "ERROR" ? "Invalid" : "Verify"}
                                </button>
                            </div>
                            <div className="flex gap-2 p-2 bg-accent/10 border border-accent/20 rounded-md text-xs text-muted-foreground">
                                <AlertCircle className="w-4 h-4 text-accent shrink-0" />
                                <p>Get a free API Key from <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">finnhub.io</a>.</p>
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
