"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, Save, AlertCircle, Plus, Trash2, Code, Check, RefreshCw } from "lucide-react";
import { substituteVariables } from "@/lib/utils";


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
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [isFetchingFields, setIsFetchingFields] = useState(false);
    const { apiKeys } = useDashboardStore(); // access keys for preview

    // Generic Headers State
    const [customHeaders, setCustomHeaders] = useState<{ key: string, value: string }[]>([]);

    // General & Formatting
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [formatType, setFormatType] = useState<'none' | 'number' | 'currency' | 'percent'>("none");
    const [formatDecimals, setFormatDecimals] = useState(2);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (widget) {
            setTitle(widget.title);
            setDescription(widget.description || "");

            // Props extraction
            setSymbol((widget.props?.symbol as string) || "");
            setChartType((widget.props?.chartType as string) || "AREA");

            // Custom API extraction
            const endpoint = widget.apiEndpoint || "";
            setApiEndpoint(endpoint);
            setSelectedFields(Array.isArray(widget.props?.selectedFields) ? (widget.props.selectedFields as string[]).join(", ") : "");

            // Extract Headers
            const headers = widget.props?.headers as Record<string, string> | undefined;
            if (headers) {
                setCustomHeaders(Object.entries(headers).map(([key, value]) => ({ key, value })));
            } else {
                setCustomHeaders([]);
            }

            setRefreshInterval(widget.refreshInterval || 5);

            // Formatting extraction
            setFormatType(widget.formatting?.type || "none");
            setFormatDecimals(widget.formatting?.decimals ?? 2);
        }
    }, [widget]);

    const [validationError, setValidationError] = useState("");

    if (!widget || !mounted) return null;

    const handleSave = () => {
        setValidationError("");

        if (!title.trim()) {
            setValidationError("Title is required.");
            return;
        }

        const finalUrl = apiEndpoint;
        let finalHeaders: Record<string, string> | undefined = undefined;

        if (widget.type === "CUSTOM") {
            if (!finalUrl) {
                setValidationError("Please enter the API URL.");
                return;
            }
            try {
                new URL(finalUrl);
            } catch {
                setValidationError("Invalid API URL.");
                return;
            }
            if (!selectedFields.trim()) {
                setValidationError("At least one field is required.");
                return;
            }

            // Generic Headers
            if (customHeaders.length > 0) {
                const headerObj: Record<string, string> = {};
                customHeaders.forEach(h => {
                    if (h.key && h.value) headerObj[h.key] = h.value;
                });
                if (Object.keys(headerObj).length > 0) {
                    finalHeaders = headerObj;
                }
            }
        }

        updateWidget(widgetId, {
            title,
            description,
            apiEndpoint: widget.type === "CUSTOM" ? finalUrl : undefined,
            refreshInterval,
            formatting: {
                type: formatType,
                decimals: formatDecimals
            },
            props: {
                ...widget.props,
                symbol,
                chartType,
                selectedFields: selectedFields.split(",").map(s => s.trim()).filter(Boolean),
                headers: finalHeaders
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
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">API URL</label>
                                    <input
                                        type="text"
                                        value={apiEndpoint}
                                        onChange={(e) => setApiEndpoint(e.target.value)}
                                        className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="https://api.example.com/data"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Enter the full API URL</p>
                                </div>

                                {/* Custom Headers Editing */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] font-medium text-muted-foreground">Headers</label>
                                        <button
                                            onClick={() => setCustomHeaders([...customHeaders, { key: "", value: "" }])}
                                            className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {customHeaders.map((header, index) => (
                                            <div key={index} className="flex gap-2 animate-in slide-in-from-top-1 fade-in">
                                                <input
                                                    type="text"
                                                    value={header.key}
                                                    onChange={(e) => {
                                                        const newHeaders = [...customHeaders];
                                                        newHeaders[index].key = e.target.value;
                                                        setCustomHeaders(newHeaders);
                                                    }}
                                                    placeholder="Key"
                                                    className="flex-1 h-8 px-2 rounded-md border border-input bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                                />
                                                <input
                                                    type="text"
                                                    value={header.value}
                                                    onChange={(e) => {
                                                        const newHeaders = [...customHeaders];
                                                        newHeaders[index].value = e.target.value;
                                                        setCustomHeaders(newHeaders);
                                                    }}
                                                    placeholder="Value"
                                                    className="flex-1 h-8 px-2 rounded-md border border-input bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newHeaders = customHeaders.filter((_, i) => i !== index);
                                                        setCustomHeaders(newHeaders);
                                                    }}
                                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>



                            {/* Resolved URL Preview */}
                            {apiEndpoint.includes("{{") && (
                                <div className="p-2 bg-muted/30 rounded border border-border/50 text-[10px] font-mono break-all text-muted-foreground">
                                    <span className="font-semibold text-primary">Preview: </span>
                                    {substituteVariables(apiEndpoint, apiKeys)}
                                </div>
                            )}

                            {/* Field Selection Helper */}
                            <div className="space-y-1.5 pt-2 border-t border-border/30">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-muted-foreground">Fields (comma separated)</label>
                                    <button
                                        onClick={async () => {
                                            if (!apiEndpoint) return;
                                            setIsFetchingFields(true);
                                            try {
                                                // Use substituteVariables to get real URL
                                                const finalUrl = substituteVariables(apiEndpoint, apiKeys);
                                                let fetchUrl = finalUrl;
                                                if (finalUrl.includes("stock.indianapi.in")) {
                                                    fetchUrl = `/api/proxy?url=${encodeURIComponent(finalUrl)}`;
                                                }

                                                const res = await fetch(fetchUrl);
                                                if (!res.ok) throw new Error(`Status: ${res.status}`);
                                                const data = await res.json();

                                                // Flatten keys for suggesting
                                                const keys: string[] = [];
                                                const traverse = (obj: unknown, prefix = "") => {
                                                    if (!obj || typeof obj !== 'object') return;
                                                    const record = obj as Record<string, unknown>;
                                                    Object.keys(record).forEach(k => {
                                                        const displayKey = prefix ? `${prefix}.${k}` : k;
                                                        // Limit depth/noise
                                                        if (displayKey.length < 50) keys.push(displayKey);
                                                        if (typeof record[k] === 'object' && record[k] !== null && !Array.isArray(record[k])) {
                                                            traverse(record[k], displayKey);
                                                        }
                                                    });
                                                };
                                                traverse(data);
                                                // If array, just show "Array" or first item keys
                                                if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
                                                    traverse(data[0], "[0]");
                                                }

                                                setAvailableFields(keys.slice(0, 30)); // limit suggestions
                                                setValidationError(""); // clear errors if successful
                                            } catch (e: unknown) {
                                                const errorMsg = e instanceof Error ? e.message : String(e);
                                                setValidationError(`Fetch failed: ${errorMsg}`);
                                            } finally {
                                                setIsFetchingFields(false);
                                            }
                                        }}
                                        className="text-[10px] bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                        title="Fetch API to see available fields"
                                    >
                                        {isFetchingFields ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Code className="w-3 h-3" />}
                                        {isFetchingFields ? "Fetching..." : "Fetch Fields"}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={selectedFields}
                                    onChange={(e) => setSelectedFields(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                                    placeholder="current_price, high, low"
                                />

                                {availableFields.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2 p-2 bg-muted/20 rounded border border-border/30 max-h-32 overflow-y-auto">
                                        {availableFields.map(f => (
                                            <button
                                                key={f}
                                                onClick={() => {
                                                    const parts = selectedFields.split(",").map(s => s.trim()).filter(Boolean);
                                                    if (!parts.includes(f)) {
                                                        setSelectedFields([...parts, f].join(", "));
                                                    }
                                                }}
                                                className="text-[10px] px-1.5 py-0.5 bg-background border border-border rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                {f} {selectedFields.includes(f) && <Check className="w-2 h-2" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                                onChange={(e) => setFormatType(e.target.value as 'none' | 'number' | 'currency' | 'percent')}
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

                    {validationError && (
                        <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {validationError}
                        </div>
                    )}

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
