"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetConfig } from "@/types";

interface WidgetConfigModalProps {
    widgetId: string;
    onClose: () => void;
}

export function WidgetConfigModal({ widgetId, onClose }: WidgetConfigModalProps) {
    const { widgets, updateWidget } = useDashboardStore();
    const widget = widgets.find((w) => w.id === widgetId);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Chart/Stock specific
    const [symbol, setSymbol] = useState("");
    const [chartType, setChartType] = useState("AREA");

    // Custom API specific
    const [apiEndpoint, setApiEndpoint] = useState("");
    const [selectedFields, setSelectedFields] = useState("");

    // General & Formatting
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [formatType, setFormatType] = useState<'none' | 'number' | 'currency' | 'percent'>("none");
    const [formatDecimals, setFormatDecimals] = useState(2);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (widget) {
            setTitle(widget.title);
            setDescription(widget.description || "");

            // Props extraction
            setSymbol((widget.props?.symbol as string) || "AAPL");
            setChartType((widget.props?.chartType as string) || "AREA");

            // Custom API extraction
            setApiEndpoint(widget.apiEndpoint || "");
            setSelectedFields(Array.isArray(widget.props?.selectedFields) ? (widget.props.selectedFields as string[]).join(", ") : "");

            setRefreshInterval(widget.refreshInterval || 5);

            // Formatting extraction
            setFormatType(widget.formatting?.type || "none");
            setFormatDecimals(widget.formatting?.decimals ?? 2);
        }
    }, [widget]);

    if (!widget || !mounted) return null;

    const handleSave = () => {
        updateWidget(widgetId, {
            title,
            description,
            apiEndpoint: widget.type === "CUSTOM" ? apiEndpoint : undefined,
            refreshInterval,
            formatting: {
                type: formatType,
                decimals: formatDecimals
            },
            props: {
                ...widget.props,
                symbol,
                chartType,
                selectedFields: selectedFields.split(",").map(s => s.trim()).filter(Boolean)
            }
        });
        onClose();
    };

    // Use Portal to render outside of the widget's stacking context (overflow: hidden)
    // z-[9999] ensures it sits above mostly everything.
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                    <h3 className="font-semibold text-sm">Widget Settings</h3>
                    <button onClick={onClose} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-20 px-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            placeholder="Add a brief description..."
                        />
                    </div>

                    {widget.type === "CUSTOM" && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">API Endpoint</label>
                                <input
                                    type="text"
                                    value={apiEndpoint}
                                    onChange={(e) => setApiEndpoint(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="https://api.example.com/data"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Fields (comma separated)</label>
                                <input
                                    type="text"
                                    value={selectedFields}
                                    onChange={(e) => setSelectedFields(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="price, volume, change"
                                />
                            </div>
                        </>
                    )}

                    {widget.type === "CHART" && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Stock Symbol</label>
                                <select
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="AAPL">Apple (AAPL)</option>
                                    <option value="GOOGL">Google (GOOGL)</option>
                                    <option value="BTC">Bitcoin (BTC)</option>
                                    <option value="TSLA">Tesla (TSLA)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Chart Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["AREA", "BAR", "LINE"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setChartType(type)}
                                            className={cn(
                                                "px-3 py-2 rounded-md text-xs font-medium border transition-colors",
                                                chartType === type
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                                            )}
                                        >
                                            {type} Chart
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Refresh Rate (seconds)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Formatting</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={formatType}
                                onChange={(e) => setFormatType(e.target.value as any)}
                                className="h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="none">None</option>
                                <option value="number">Number</option>
                                <option value="currency">Currency</option>
                                <option value="percent">Percent</option>
                            </select>
                            {formatType !== 'none' && (
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={formatDecimals}
                                    onChange={(e) => setFormatDecimals(Number(e.target.value))}
                                    className="h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Decimals"
                                />
                            )}
                        </div>

                    </div>

                    <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-2">
                        <button onClick={onClose} className="px-3 py-2 text-xs font-medium hover:bg-muted rounded-md transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2">
                            <Save className="w-3.5 h-3.5" /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
