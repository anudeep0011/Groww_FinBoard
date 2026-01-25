"use client";

import React, { useRef } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Download, Upload, LayoutTemplate } from "lucide-react";
import { DashboardState } from "@/types";

export function DashboardHeader() {
    const { widgets, theme, dataSource, importDashboard } = useDashboardStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const config = {
            version: 1,
            timestamp: new Date().toISOString(),
            widgets,
            theme,
            dataSource,
            // Exclude apiKey for security
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `finboard-config-${new Date().toLocaleDateString().replace(/\//g, "-")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const config = JSON.parse(content);

                // Basic validation
                if (!config.widgets || !Array.isArray(config.widgets)) {
                    alert("Invalid configuration file format.");
                    return;
                }

                if (confirm("Importing will overwrite your current layout. Continue?")) {
                    importDashboard(config as Partial<DashboardState>);
                }
            } catch (err) {
                console.error("Import failed", err);
                alert("Failed to parse configuration file.");
            }
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsText(file);
    };

    return (
        <header className="px-6 py-4 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-40 shadow-sm">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-primary">
                            <path d="M3 3v18h18" />
                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">FinBoard</h1>
                </div>
                <p className="text-xs text-muted-foreground font-medium pl-1">Connect APIs and build custom dashboards</p>
            </div>

            {/* Templates Dropdown */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 rounded-md transition-colors border border-transparent hover:border-border/50">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Templates</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-100 p-1 z-50">
                    <button
                        onClick={() => {
                            if (confirm("Load 'Tech Watchlist' template? Current layout will be lost.")) {
                                importDashboard({
                                    widgets: [
                                        { id: "t1", type: "CHART", title: "Apple Inc.", layout: { i: "t1", x: 0, y: 0, w: 6, h: 4 }, props: { symbol: "AAPL", chartType: "AREA" } },
                                        { id: "t2", type: "CHART", title: "Microsoft Corp.", layout: { i: "t2", x: 6, y: 0, w: 6, h: 4 }, props: { symbol: "MSFT", chartType: "LINE" } },
                                        { id: "t3", type: "CHART", title: "Tesla Inc.", layout: { i: "t3", x: 0, y: 4, w: 4, h: 4 }, props: { symbol: "TSLA", chartType: "BAR" } },
                                        { id: "t4", type: "CHART", title: "NVIDIA Corp.", layout: { i: "t4", x: 4, y: 4, w: 4, h: 4 }, props: { symbol: "NVDA", chartType: "AREA" } },
                                        { id: "t5", type: "CHART", title: "Amazon", layout: { i: "t5", x: 8, y: 4, w: 4, h: 4 }, props: { symbol: "AMZN", chartType: "LINE" } }
                                    ]
                                });
                            }
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                    >
                        Tech Watchlist
                    </button>
                    <button
                        onClick={() => {
                            if (confirm("Load 'Crypto Overview' template? Current layout will be lost.")) {
                                importDashboard({
                                    widgets: [
                                        { id: "c1", type: "CHART", title: "Bitcoin", layout: { i: "c1", x: 0, y: 0, w: 8, h: 5 }, props: { symbol: "BTC", chartType: "AREA" } },
                                        { id: "c2", type: "CHART", title: "Ethereum", layout: { i: "c2", x: 8, y: 0, w: 4, h: 5 }, props: { symbol: "ETH", chartType: "LINE" } },
                                        { id: "c3", type: "CUSTOM", title: "Crypto Fear & Greed", layout: { i: "c3", x: 0, y: 5, w: 4, h: 3 }, apiEndpoint: "https://api.alternative.me/fng/", props: { selectedFields: ["data.0.value_classification", "data.0.value"], displayMode: "CARD" }, refreshInterval: 60 }
                                    ]
                                });
                            }
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                    >
                        Crypto Overview
                    </button>
                    <hr className="my-1 border-border/50" />
                    <button
                        onClick={() => {
                            if (confirm("Clear dashboard? This cannot be undone.")) {
                                importDashboard({ widgets: [] });
                            }
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <div className="h-4 w-px bg-border/50 mx-1"></div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />

            <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 rounded-md transition-colors border border-transparent hover:border-border/50"
                title="Export Config"
            >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
            </button>

            <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 rounded-md transition-colors border border-transparent hover:border-border/50"
                title="Import Config"
            >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import</span>
            </button>
        </header>
    );
}
