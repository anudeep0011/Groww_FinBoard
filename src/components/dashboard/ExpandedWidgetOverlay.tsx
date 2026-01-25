"use client";

import React, { useMemo } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { WIDGET_REGISTRY } from "../widgets/WidgetRegistry";
import { Minimize2, Activity, BarChart2, CandlestickChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ExpandedWidgetOverlay() {
    const { widgets, expandedWidgetId, toggleWidgetExpansion } = useDashboardStore();

    const widget = useMemo(() =>
        widgets.find(w => w.id === expandedWidgetId),
        [widgets, expandedWidgetId]
    );

    const WidgetComponent = widget ? (WIDGET_REGISTRY[widget.type] || null) : null;

    if (!expandedWidgetId || !widget) return null;

    return (
        <AnimatePresence>
            {expandedWidgetId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex flex-col pt-16 px-6 pb-6 bg-background/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                        className="flex-1 flex flex-col bg-card border border-border/50 shadow-2xl rounded-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-muted/10 border-b border-border/40 shrink-0">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">{widget.title}</h2>
                                {widget.refreshInterval && (
                                    <span className="text-xs px-2 py-0.5 bg-muted/20 rounded text-muted-foreground border border-border/50">
                                        Auto-refresh: {widget.refreshInterval}s
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Chart Type Toggles (Visible for CHART widgets) */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(widget.type === "CHART" || (widget as any).props?.symbol) && (
                                    <div className="flex bg-secondary/40 border border-border/40 rounded-lg p-1 gap-1 mr-4 shadow-sm">
                                        <button
                                            onClick={() => useDashboardStore.getState().updateWidget(widget.id, { props: { ...widget.props, chartType: "AREA" } })}
                                            className={cn("p-1.5 rounded-md hover:bg-background hover:text-accent transition-all", (!widget.props?.chartType || widget.props?.chartType === "AREA") && "bg-background text-accent shadow-sm")}
                                            title="Line / Area Chart"
                                        >
                                            <Activity className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => useDashboardStore.getState().updateWidget(widget.id, { props: { ...widget.props, chartType: "BAR" } })}
                                            className={cn("p-1.5 rounded-md hover:bg-background hover:text-accent transition-colors", widget.props?.chartType === "BAR" && "bg-background text-accent shadow-sm")}
                                            title="Bar Chart"
                                        >
                                            <BarChart2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => useDashboardStore.getState().updateWidget(widget.id, { props: { ...widget.props, chartType: "CANDLE" } })}
                                            className={cn("p-1.5 rounded-md hover:bg-background hover:text-accent transition-colors", widget.props?.chartType === "CANDLE" && "bg-background text-accent shadow-sm")}
                                            title="Candlestick Chart"
                                        >
                                            <CandlestickChart className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => toggleWidgetExpansion(null)} // Close it
                                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all flex items-center gap-2 group"
                                >
                                    <span className="text-sm font-medium group-hover:underline decoration-destructive/50 underline-offset-4">Minimize</span>
                                    <Minimize2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-0 relative bg-background/40">
                            {WidgetComponent ? (
                                <WidgetComponent
                                    {...widget.props}
                                    apiUrl={widget.apiEndpoint}
                                    refreshInterval={widget.refreshInterval}
                                    isPreview={false}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Unknown Widget Type
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
