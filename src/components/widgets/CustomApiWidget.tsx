"use client";

import React from "react";
import useSWR from "swr";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getNestedValue } from "@/lib/jsonUtils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface CustomApiWidgetProps {
    apiUrl?: string;
    refreshInterval?: number;
    selectedFields?: string[];
    displayMode?: "CARD" | "TABLE" | "CHART";
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Rate limit exceeded (429).");
        }
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
};

export function CustomApiWidget({ apiUrl, refreshInterval = 30, selectedFields = [], displayMode = "CARD" }: CustomApiWidgetProps) {
    const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
        refreshInterval: refreshInterval * 1000,
        shouldRetryOnError: false,
    });

    if (!apiUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground text-center">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No API URL configured.</p>
            </div>
        );
    }

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-destructive text-center">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Failed to fetch data</p>
                <p className="text-xs opacity-70 mt-1 max-w-[200px] truncate">{error.message}</p>
                <button onClick={() => mutate()} className="mt-2 text-xs underline">Retry</button>
            </div>
        );
    }

    // Process Data
    const displayData = selectedFields.length > 0
        ? selectedFields.map(field => ({ label: field, value: getNestedValue(data, field) }))
        : [{ label: "Raw Data", value: JSON.stringify(data).slice(0, 100) + "..." }];


    // Render Different Modes
    if (displayMode === "TABLE") {
        return (
            <div className="flex flex-col h-full bg-background/20 relative">
                <div className="flex-1 overflow-auto pb-8">
                    <table className="w-full text-xs text-left">
                        <thead className="text-muted-foreground bg-muted/20">
                            <tr>
                                <th className="p-2 font-medium">Field</th>
                                <th className="p-2 font-medium text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {displayData.map((item) => (
                                <tr key={item.label}>
                                    <td className="p-2 font-mono text-muted-foreground">{item.label}</td>
                                    <td className="p-2 font-bold text-right text-foreground">{String(item.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 border-t border-white/5 bg-background/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                        <span>
                            Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1 opacity-70">
                            <RefreshCw className="w-3 h-3" /> {refreshInterval}s
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (displayMode === "CHART") {
        // Find first numeric field
        const chartItem = displayData.find(d => {
            const val = Number(d.value);
            return !isNaN(val) && d.value !== null && d.value !== "";
        });

        if (!chartItem) {
            return (
                <div className="flex flex-col h-full bg-background/20 items-center justify-center p-4 text-center">
                    <span className="text-3xl opacity-30 mb-2">📊</span>
                    <span className="text-xs text-muted-foreground">No numeric data to chart</span>
                </div>
            );
        }

        const chartVal = chartItem.value;
        const chartData = [
            { val: Number(chartVal) * 0.9 },
            { val: Number(chartVal) * 0.95 },
            { val: Number(chartVal) * 1.05 },
            { val: Number(chartVal) } // Current
        ];

        return (
            <div className="flex flex-col h-full bg-background/20 items-center justify-center p-4 relative">
                <div className="text-3xl font-bold mb-2">{chartVal}</div>
                <div className="text-xs text-muted-foreground mb-4">{chartItem.label}</div>
                <div className="w-full h-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <Area type="monotone" dataKey="val" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 border-t border-white/5 bg-background/40 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                        <span>
                            Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1 opacity-70">
                            <RefreshCw className="w-3 h-3" /> {refreshInterval}s
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Card Mode (Default)
    return (
        <div className="flex flex-col h-full bg-background/20 overflow-auto p-4 gap-3">
            {displayData.map((item) => (
                <div key={item.label} className="bg-card/50 p-3 rounded-lg border border-border/30 flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider truncate mb-1" title={item.label}>
                        {item.label}
                    </span>
                    <span className="text-xl font-bold tracking-tight text-foreground truncate" title={String(item.value)}>
                        {String(item.value)}
                    </span>
                </div>
            ))}
            <div className="text-[10px] text-muted-foreground mt-auto flex items-center gap-1 opacity-50 justify-between">
                <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> {refreshInterval}s
                </div>
                <button
                    onClick={() => mutate()}
                    disabled={isLoading}
                    className="p-1 rounded hover:bg-muted/50 transition-colors"
                    title="Refresh Now"
                >
                    <RefreshCw className={cn("w-3 h-3", isLoading ? "animate-spin" : "")} />
                </button>
            </div>
        </div>
    );
}
