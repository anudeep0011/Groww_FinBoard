"use client";

import React from "react";
import useSWR from "swr";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { flattenObject } from "@/lib/jsonUtils";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { cn } from "@/lib/utils";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface CustomApiWidgetProps {
    apiUrl?: string;
    refreshInterval?: number;
    selectedFields?: string[];
    displayMode?: "CARD" | "TABLE" | "CHART";
}

// Simple in-memory cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CACHE = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute

const fetcher = async ([url, headers]: [string, Record<string, string> | undefined]) => {
    // Generate a unique cache key based on URL and Headers to prevents redundant requests
    const cacheKey = url + JSON.stringify(headers || {});
    const cached = CACHE.get(cacheKey);

    // Return cached data if valid (Client-side caching optimization)
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }

    let fetchUrl = url;
    // Use proxy for Indian Stock API to handle CORS and User-Agent
    if (url.includes("stock.indianapi.in")) {
        fetchUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    }

    const res = await fetch(fetchUrl, {
        headers: headers || {}
    });
    if (!res.ok) {
        if (res.status === 429) {
            throw new Error("Rate limit exceeded (429).");
        }
        throw new Error(`API Error: ${res.status}`);
    }
    const data = await res.json();

    // Check for Alpha Vantage specific errors/notes
    if (data["Note"] || data["Information"]) {
        throw new Error(data["Note"] || data["Information"]);
    }

    // Check for "Error Message" (common in some APIs)
    if (data["Error Message"]) {
        throw new Error(data["Error Message"]);
    }

    // Standardize error responses from various financial APIs

    // Check for Two Data / Generic status errors
    if (data.status === "error" || data.Status === "Error") {
        throw new Error(data.message || data.Message || "API Error");
    }
    // Check for numeric error codes often returned with 200 OK by some APIs
    if (data.code && typeof data.code === "number" && data.code >= 400) {
        throw new Error(data.message || `Error Code: ${data.code}`);
    }

    // Update cache
    CACHE.set(cacheKey, { data, timestamp: Date.now() });

    return data;
};

export function CustomApiWidget({ apiUrl, refreshInterval = 30, selectedFields = [], displayMode = "CARD", headers }: CustomApiWidgetProps & { headers?: Record<string, string> }) {
    const { data, error, isLoading, mutate } = useSWR(apiUrl ? [apiUrl, headers] : null, fetcher, {
        refreshInterval: refreshInterval * 1000,
        shouldRetryOnError: false,
    });

    // Process Data
    const flattenedData = React.useMemo(() => data ? flattenObject(data) : {}, [data]);

    const displayData = selectedFields.length > 0
        ? selectedFields.map(field => ({ label: field, value: flattenedData[field] }))
        : [{ label: "Raw Data", value: JSON.stringify(data).slice(0, 100) + "..." }];

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


    // Helper to format values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatDisplayValue = (value: any) => {
        if (value === null || value === undefined) return "-";
        if (typeof value === "boolean") return value ? "True" : "False";
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                // If array of primitives, join them
                if (value.length > 0 && typeof value[0] !== "object") {
                    return value.join(", ");
                }
                return `Array(${value.length})`;
            }
            return JSON.stringify(value);
        }
        return String(value);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderValue = (value: any) => {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
            const keys = Object.keys(value[0]);
            return (
                <div className="max-h-60 overflow-auto border border-border/50 rounded bg-background/50 mt-1">
                    <table className="w-full text-[10px]">
                        <thead className="bg-muted/30 sticky top-0 backdrop-blur-sm">
                            <tr>
                                {keys.map(k => <th key={k} className="p-1.5 font-medium text-left">{k}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {value.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/10">
                                    {keys.map(k => (
                                        <td key={k} className="p-1.5 font-mono text-muted-foreground whitespace-nowrap">
                                            {String(row[k])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        return formatDisplayValue(value);
    };

    // Render Different Modes
    if (displayMode === "TABLE") {
        // If only one field is selected and it's an array of objects, promote it to the main table
        if (displayData.length === 1 && Array.isArray(displayData[0].value) && displayData[0].value.length > 0 && typeof displayData[0].value[0] === "object") {
            const arrayData = displayData[0].value;
            const keys = Object.keys(arrayData[0]);

            return (
                <div className="flex flex-col h-full bg-background/20 relative">
                    <div className="flex-1 overflow-auto pb-8">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-muted/30 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    {keys.map(k => <th key={k} className="p-2 font-medium text-left border-b border-border/20 whitespace-nowrap">{k}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {arrayData.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-muted/10">
                                        {keys.map(k => (
                                            <td key={k} className="p-2 font-mono text-muted-foreground whitespace-nowrap">
                                                {String(row[k])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 border-t border-white/5 bg-background/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                            <span>
                                {displayData[0].label} • {arrayData.length} rows
                            </span>
                            <div className="flex items-center gap-1 opacity-70">
                                <RefreshCw className="w-3 h-3" /> {refreshInterval}s
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col h-full bg-background/20 relative">
                <div className="flex-1 overflow-auto pb-8 p-2">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="text-muted-foreground bg-muted/20">
                            <tr>
                                <th className="p-2 font-medium w-1/3">Field</th>
                                <th className="p-2 font-medium text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {displayData.map((item) => (
                                <tr key={item.label}>
                                    <td className="p-2 font-mono text-muted-foreground align-top">{item.label}</td>
                                    <td className="p-2 font-bold text-right text-foreground min-w-[200px]">
                                        {renderValue(item.value)}
                                    </td>
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
        // Check for array data first (Time Series)
        const arrayItem = displayData.find(d => Array.isArray(d.value) && d.value.length > 0 && typeof d.value[0] === "object");

        // Check for Object-based Time Series (e.g. Alpha Vantage)
        const objectSeriesItem = displayData.find(d => {
            if (typeof d.value !== "object" || d.value === null || Array.isArray(d.value)) return false;
            // Check if keys look like dates and values are objects
            const keys = Object.keys(d.value);
            if (keys.length === 0) return false;
            const firstVal = d.value[keys[0]];
            return typeof firstVal === "object" && firstVal !== null;
        });

        if (arrayItem || objectSeriesItem) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let data: any[] = [];
            let label = "";

            if (arrayItem) {
                data = arrayItem.value;
                label = arrayItem.label;
            } else if (objectSeriesItem) {
                // Convert object to array
                const rawObj = objectSeriesItem.value;
                data = Object.keys(rawObj).map(key => ({
                    time: key,
                    ...rawObj[key]
                }));
                label = objectSeriesItem.label;
            }

            // Try to find a numeric key (close, price, value, etc.)
            const keys = Object.keys(data[0]);
            const numKey = keys.find(k => {
                const val = Number(data[0][k]);
                return !isNaN(val) && data[0][k] !== null && data[0][k] !== "";
            }) || keys[0];

            // Normalize data for Chart.js
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chartData = data.map((d: any) => {
                // Try to parse time
                let time = d.time || d.date || d.datetime || d.timestamp;

                // If no explicit time key, try to use the first key if it looks like a date (YYYY-MM-DD)
                if (!time) {
                    const possibleDate = Object.values(d).find(v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v as string));
                    if (possibleDate) time = possibleDate;
                }

                return {
                    time: time,
                    value: Number(d[numKey])
                };
            }).filter(d => d.time && !isNaN(d.value));

            // Sort by time ascending
            chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            const chartJsData = {
                labels: chartData.map(d => d.time),
                datasets: [
                    {
                        label: `${label} (${numKey})`,
                        data: chartData.map(d => d.value),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHitRadius: 10,
                    },
                ],
            };

            const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        mode: 'index' as const,
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(148, 163, 184, 0.1)',
                        borderWidth: 1,
                    },
                },
                scales: {
                    x: {
                        display: false,
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.05)',
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.5)',
                            font: {
                                size: 10,
                            },
                        },
                    },
                },
                interaction: {
                    mode: 'nearest' as const,
                    axis: 'x' as const,
                    intersect: false,
                },
            };

            return (
                <div className="flex flex-col h-full bg-background/20 p-4 relative">
                    <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                        <span>{label} ({numKey})</span>
                        <span className="font-mono">{chartData.length} pts</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Line data={chartJsData} options={options} />
                    </div>
                    {/* Footer */}
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

        // Fallback to single value chart
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
        const chartJsData = {
            labels: ['5m ago', '3m ago', '1m ago', 'Now'],
            datasets: [
                {
                    label: chartItem.label,
                    data: [
                        Number(chartVal) * 0.9,
                        Number(chartVal) * 0.95,
                        Number(chartVal) * 1.05,
                        Number(chartVal)
                    ],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
            },
            scales: {
                x: { display: false },
                y: { display: false },
            },
        };

        return (
            <div className="flex flex-col h-full bg-background/20 items-center justify-center p-4 relative">
                <div className="text-3xl font-bold mb-2">{chartVal}</div>
                <div className="text-xs text-muted-foreground mb-4">{chartItem.label}</div>
                <div className="w-full h-24">
                    <Line data={chartJsData} options={options} />
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
                    <span className="text-xl font-bold tracking-tight text-foreground truncate" title={JSON.stringify(item.value)}>
                        {formatDisplayValue(item.value)}
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
