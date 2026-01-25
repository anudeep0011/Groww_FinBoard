"use client";

import React from "react";
import { useStockData } from "@/hooks/useStockData";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    LineChart,
    Line
} from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartWidgetProps {
    symbol?: string;
    interval?: number;
    chartType?: "AREA" | "LINE" | "BAR";
}

export function ChartWidget({ symbol = "AAPL", chartType = "AREA", isPreview = false }: ChartWidgetProps & { isPreview?: boolean }) {
    const [range, setRange] = React.useState<"1D" | "1W" | "1M" | "1Y">("1M");
    const { stock, isLoading, isError, mutate } = useStockData(symbol, range, isPreview ? 0 : 15000); // Disable auto-refresh in preview to save API calls? Or keep it slow.

    // Calculate dynamic color based on live change
    const isPositive = stock ? stock.change >= 0 : true;
    const color = isPositive ? "var(--accent)" : "var(--destructive)";

    // Loading/Error States
    if (isLoading && !stock) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin w-6 h-6" />
            </div>
        );
    }

    if (isError || !stock) {
        return (
            <div className="flex h-full items-center justify-center flex-col text-destructive p-4 text-center">
                <span className="font-bold">Error</span>
                <span className="text-xs text-muted-foreground">Check API Key or Limits</span>
            </div>
        );
    }

    // PREVIEW MODE: Sparkline only
    if (isPreview) {
        return (
            <div className="h-full w-full relative bg-background/5">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stock.history}>
                        <defs>
                            <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={color}
                            fill={`url(#grad-${symbol})`}
                            strokeWidth={1.5}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="absolute top-2 left-3">
                    <div className="text-lg font-bold">{stock.currency === 'USD' ? '$' : '₹'}{stock.price.toFixed(2)}</div>
                    <span className={cn("text-xs font-medium", isPositive ? "text-accent" : "text-destructive")}>
                        {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </span>
                </div>
            </div>
        );
    }

    // EXPANDED MODE: Full Chart
    return (
        <div className="h-full flex flex-col p-6 bg-background">
            {/* Header / Controls */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-4xl font-bold tracking-tight text-foreground">{stock.currency === 'USD' ? '$' : '₹'}{stock.price.toFixed(2)}</h3>
                        <span className={cn("text-lg font-semibold px-2 py-0.5 rounded flex items-center gap-1", {
                            "text-accent bg-accent/10": isPositive,
                            "text-destructive bg-destructive/10": !isPositive
                        })}>
                            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </span>
                        <button
                            onClick={() => mutate()}
                            disabled={isLoading}
                            className="ml-2 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Refresh Data"
                        >
                            <Loader2 className={cn("w-4 h-4", isLoading ? "animate-spin" : "")} />
                        </button>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">
                        {symbol} • {range === '1D' ? 'Live Market' : 'Historical Data'}
                    </div>
                </div>

                {/* Range Switcher */}
                <div className="flex bg-muted/30 rounded-lg p-1 gap-1">
                    {(["1D", "1W", "1M", "1Y"] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-all",
                                range === r ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative border border-border/30 rounded-xl bg-card/20 p-2 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    {stock.history.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs flex-col">
                            <span className="opacity-50 text-3xl mb-2">📉</span>
                            No Data Available
                        </div>
                    ) : chartType === "BAR" ? (
                        <BarChart data={stock.history}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="time" hide={true} />
                            <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            />
                            <Bar dataKey="close" fill={color} radius={[2, 2, 0, 0]} />
                        </BarChart>
                    ) : chartType === "LINE" ? (
                        <LineChart data={stock.history}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="time" hide={true} />
                            <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Line type="monotone" dataKey="close" stroke={color} strokeWidth={2} dot={false} />
                        </LineChart>
                    ) : (
                        <AreaChart data={stock.history}>
                            <defs>
                                <linearGradient id="colorValueFull" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="time"
                                minTickGap={30}
                                tickFormatter={(val) => {
                                    // Simple formatter based on range
                                    if (range === '1D') return val.split(',')[1]?.trim().slice(0, 5) || val;
                                    return val.split(',')[0];
                                }}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                orientation="right"
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                dx={-5}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke={color}
                                fillOpacity={1}
                                fill="url(#colorValueFull)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>

                {/* Live Status Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Live Market</span>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Data provided by Finnhub API</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
}
