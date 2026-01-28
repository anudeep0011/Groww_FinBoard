"use client";

import React, { useMemo } from "react";
import { useStockData } from "@/hooks/useStockData";
import { Loader2, TrendingUp, TrendingDown, BarChart2, Activity, LineChart as LineIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinancialChart, ChartType } from "./FinancialChart";
import { Time } from "lightweight-charts";

interface ChartWidgetProps {
    symbol?: string;
    interval?: number;
    chartType?: ChartType;
}

export function ChartWidget({ symbol = "AAPL", chartType: initialChartType = "AREA", isPreview = false }: ChartWidgetProps & { isPreview?: boolean }) {
    const [range, setRange] = React.useState<"1D" | "1W" | "1M" | "1Y">("1M");
    const [activeChartType, setActiveChartType] = React.useState<ChartType>(initialChartType);
    // Local state for key input
    const [tempKey, setTempKey] = React.useState("");

    // Only fetch automatically if not in preview (or slow refresh)
    const { stock, isLoading, isError, mutate } = useStockData(symbol, range, isPreview ? 0 : 15000);

    // Calculate dynamic color based on live change
    const isPositive = stock ? stock.change >= 0 : true;
    const color = isPositive ? "#00A884" : "#E35D5D"; // Muted Green : Muted Red

    // Prepare Data for Lightweight Charts
    const { chartData, volumeData } = useMemo(() => {
        if (!stock || !stock.history) return { chartData: [], volumeData: [] };

        // Sort by time is critical for lightweight-charts
        const sortedHistory = [...stock.history].sort((a, b) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        const cData = sortedHistory.map(d => {
            const time = Math.floor(new Date(d.time).getTime() / 1000); // Unix Timestamp (seconds)
            return {
                time: time as Time, // Cast to Time type
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
                value: d.close, // For Line/Area
            };
        });

        // Unique timestamps are required. Filter duplicates if any.
        const uniqueData = cData.filter((item, index, self) =>
            index === self.findIndex((t) => t.time === item.time)
        );

        const vData = sortedHistory.map((d, i) => {
            const time = Math.floor(new Date(d.time).getTime() / 1000);
            const isUp = d.close >= d.open;
            return {
                time: time as Time,
                value: d.volume,
                color: isUp ? '#BDE8DC' : '#F0C1C1', // Volume Up (Soft Green) : Volume Down (Soft Red)
            };
        }).filter((item, index, self) =>
            index === self.findIndex((t) => t.time === item.time)
        );

        return { chartData: uniqueData, volumeData: vData };
    }, [stock]);

    // Loading/Error States
    if (isLoading && !stock) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground bg-card/10">
                <Loader2 className="animate-spin w-5 h-5" />
            </div>
        );
    }



    // Error State with "Enter Key" Prompt
    if (isError || !stock) {
        return (
            <div className="flex h-full items-center justify-center flex-col p-6 text-center bg-card/10 space-y-3">
                <div className="space-y-1">
                    <span className="font-bold text-sm text-destructive flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4" /> Connect Data
                    </span>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-tight mx-auto">
                        Real-time data requires your own Finnhub API Key.
                    </p>
                </div>

                {/* API Key Input Form */}
                <div className="w-full max-w-[200px] space-y-2">
                    <input
                        type="text"
                        placeholder="Paste Finnhub Key..."
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        className="w-full h-8 text-xs px-2 rounded-md border border-border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button
                        onClick={() => {
                            if (!tempKey) return;
                            import("@/store/useDashboardStore").then(({ useDashboardStore }) => {
                                useDashboardStore.getState().setDataSource("FINNHUB");
                                useDashboardStore.getState().setApiKey("FINNHUB", tempKey);
                                window.location.reload();
                            });
                        }}
                        disabled={!tempKey}
                        className="w-full py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors font-medium disabled:opacity-50"
                    >
                        Save & Connect
                    </button>

                    <a
                        href={`https://finnhub.io/dashboard`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors font-medium text-secondary-foreground gap-1"
                    >
                        Get Free Key <span className="opacity-70">↗</span>
                    </a>
                </div>
            </div>
        );
    }

    // PREVIEW MODE: Simplified Chart
    if (isPreview) {
        return (
            <div className="h-full w-full relative bg-background/5 overflow-hidden flex flex-col pointer-events-none select-none">
                <div className="absolute top-3 left-4 z-10">
                    <div className="text-lg font-bold tracking-tight">{stock.currency === 'USD' ? '$' : '₹'}{stock.price.toFixed(2)}</div>
                    <span className={cn("text-xs font-medium", isPositive ? "text-accent" : "text-destructive")}>
                        {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </span>
                </div>
                <div className="flex-1 opacity-80">
                    {/* Use Area chart for preview, no volume */}
                    <FinancialChart
                        data={chartData}
                        chartType="AREA"
                        colors={{
                            lineColor: color,
                            areaTopColor: isPositive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                            areaBottomColor: "transparent"
                        }}
                    />
                </div>
            </div>
        );
    }

    // EXPANDED MODE: Full Trading Interface
    return (
        <div className="h-full flex flex-col p-4 bg-background backdrop-blur-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-foreground tracking-tight">
                                {Number(stock.price).toLocaleString('en-US', { style: 'currency', currency: stock.currency })}
                            </h3>
                            <button onClick={() => mutate()} title="Refresh" className="p-1 hover:bg-muted rounded-full">
                                <span className={cn("flex h-2 w-2 relative", isLoading ? "opacity-100" : "opacity-0 transition-opacity duration-1000")}>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-0.5">
                            <span className={cn("font-medium flex items-center gap-1", isPositive ? "text-accent" : "text-destructive")}>
                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </span>
                            <span className="text-muted-foreground text-xs">• {range}</span>
                        </div>
                    </div>
                </div>

                {/* Controls Group */}
                <div className="flex items-center gap-2">
                    {/* Range Switcher */}
                    <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/40">
                        {(["1D", "1W", "1M", "1Y"] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={cn(
                                    "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all",
                                    range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Chart Type Switcher */}
                    <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/40">
                        <button
                            onClick={() => setActiveChartType("CANDLE")}
                            className={cn("p-1.5 rounded-md transition-all", activeChartType === "CANDLE" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Candles"
                        >
                            <BarChart2 className="w-3.5 h-3.5 rotate-90" />
                        </button>
                        <button
                            onClick={() => setActiveChartType("AREA")}
                            className={cn("p-1.5 rounded-md transition-all", activeChartType === "AREA" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Area"
                        >
                            <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setActiveChartType("LINE")}
                            className={cn("p-1.5 rounded-md transition-all", activeChartType === "LINE" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Line"
                        >
                            <LineIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0 border border-border/40 rounded-lg overflow-hidden relative shadow-inner bg-card/20">
                {chartData.length > 0 ? (
                    <FinancialChart
                        data={chartData}
                        volume={volumeData}
                        chartType={activeChartType}
                        colors={{
                            backgroundColor: "transparent",
                            textColor: "#8E9C97", // Muted Text
                            lineColor: "#2E8B75", // Line Chart Teak
                            upColor: "#00A884",   // Candle Up
                            downColor: "#E35D5D", // Candle Down
                            areaTopColor: isPositive ? "rgba(0, 168, 132, 0.25)" : "rgba(227, 93, 93, 0.25)",
                            areaBottomColor: "rgba(0, 0, 0, 0)"
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <Activity className="w-10 h-10 mb-2" />
                        <span className="text-xs">Waiting for data...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
