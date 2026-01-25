"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface CardWidgetProps {
    variant?: "PORTFOLIO" | "WATCHLIST" | "GAINERS";
    isPreview?: boolean;
}

export function CardWidget({ variant = "PORTFOLIO", isPreview = false }: CardWidgetProps) {

    if (variant === "WATCHLIST") {
        const watchlist = [
            { symbol: "NVDA", price: 540.10, change: 3.4 },
            { symbol: "MSFT", price: 370.45, change: 0.85 },
            { symbol: "AMD", price: 145.20, change: -1.2 },
            { symbol: "TSLA", price: 215.30, change: -2.1 },
        ];

        // In preview, show only top 1 or 2 items depending on space, or just 1. User asked for single row initially.
        const displayList = isPreview ? watchlist.slice(0, 1) : watchlist;

        return (
            <div className="flex flex-col h-full bg-background/20 relative">
                <div className="p-4 flex flex-col h-full pb-8">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">My Watchlist</div>
                    <div className="flex-1 flex flex-col gap-2 overflow-auto">
                        {displayList.map(item => (
                            <div key={item.symbol} className="flex items-center justify-between p-2 bg-card/40 rounded-lg border border-border/30">
                                <span className="font-bold text-sm">{item.symbol}</span>
                                <div className="text-right">
                                    <div className="text-sm font-mono">${item.price.toFixed(2)}</div>
                                    <div className={cn("text-xs flex items-center justify-end", item.change >= 0 ? "text-accent" : "text-destructive")}>
                                        {item.change > 0 ? "+" : ""}{item.change}%
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isPreview && watchlist.length > 1 && (
                            <div className="text-[10px] text-muted-foreground text-center pt-1">+ {watchlist.length - 1} more</div>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-card border-t border-border/10">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                        <span className="ml-auto">
                            Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    if (variant === "GAINERS") {
        const gainers = [
            { symbol: "NVDA", name: "NVIDIA", change: 3.4 },
            { symbol: "META", name: "Meta", change: 2.1 },
            { symbol: "NFLX", name: "Netflix", change: 1.8 },
        ];
        const displayList = isPreview ? gainers.slice(0, 1) : gainers;

        return (
            <div className="flex flex-col h-full bg-background/20 relative">
                <div className="p-4 flex flex-col h-full pb-8">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Top Gainers</div>
                    <div className="flex-1 flex flex-col gap-2">
                        {displayList.map((item, i) => (
                            <div key={item.symbol} className="flex items-center gap-3 p-2 border-b border-border/20 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate">{item.symbol}</div>
                                    <div className="text-xs text-muted-foreground truncate">{item.name}</div>
                                </div>
                                <div className="text-accent font-semibold text-sm">
                                    +{item.change}%
                                </div>
                            </div>
                        ))}
                        {isPreview && gainers.length > 1 && (
                            <div className="text-[10px] text-muted-foreground text-center pt-1">+ {gainers.length - 1} more</div>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-card border-t border-border/10">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                        <span className="ml-auto">
                            Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // Default: PORTFOLIO
    const data = {
        label: "Portfolio Value",
        value: "45,231.89",
        change: "+2,340.50",
        percent: "+5.4%",
        isPositive: true
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background/20 relative">
            <div className="mb-6 flex flex-col items-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3 ring-1 ring-primary/20">
                    <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    {data.label}
                </div>
                <div className="text-4xl font-bold tracking-tight mb-2">
                    ${data.value}
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20", data.isPositive ? "text-accent" : "text-destructive")}>
                    {data.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {data.percent}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-card border-t border-border/10">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                    <span className="ml-auto">
                        Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
