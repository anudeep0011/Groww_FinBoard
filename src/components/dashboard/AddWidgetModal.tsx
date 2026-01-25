"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, TestTube, Search, Plus, Trash2, LayoutGrid, Table as TableIcon, LineChart, AlertCircle } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { WidgetType } from "@/types";
import { cn } from "@/lib/utils";
import { flattenObject } from "@/lib/jsonUtils";

interface AddWidgetModalProps {
    onClose: () => void;
}

export function AddWidgetModal({ onClose }: AddWidgetModalProps) {
    const { addWidget } = useDashboardStore();

    // Form State
    const [name, setName] = useState("");
    const [type] = useState<WidgetType>("CUSTOM");
    const [apiUrl, setApiUrl] = useState("");
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [testStatus, setTestStatus] = useState<"IDLE" | "TESTING" | "SUCCESS" | "ERROR">("IDLE");

    // Advanced Config State
    const [apiData, setApiData] = useState<any>(null);
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [displayMode, setDisplayMode] = useState<"CARD" | "TABLE" | "CHART">("CARD");
    const [fieldSearch, setFieldSearch] = useState("");
    const [showArraysOnly, setShowArraysOnly] = useState(false);

    // Generic Headers State
    const [customHeaders, setCustomHeaders] = useState<{ key: string, value: string }[]>([]);

    // Handlers
    const [validationError, setValidationError] = useState("");

    const handleAdd = () => {
        setValidationError("");

        if (!name.trim()) {
            setValidationError("Please enter a widget name.");
            return;
        }

        let finalUrl = apiUrl;
        let finalHeaders: Record<string, string> | undefined = undefined;

        if (type === "CUSTOM") {
            if (!finalUrl) {
                setValidationError("Please enter the API URL.");
                return;
            }
            try {
                new URL(finalUrl);
            } catch (e) {
                setValidationError("Invalid API URL.");
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

        if (selectedFields.length === 0 && type === "CUSTOM") {
            setValidationError("Please select at least one field to display.");
            return;
        }

        const newWidget = {
            type: type,
            title: name,
            apiEndpoint: type === "CUSTOM" ? finalUrl : undefined,
            refreshInterval: refreshInterval,
            formatting: {
                type: 'none' as const,
                decimals: 2
            },
            props: {
                symbol: type === "CHART" || type === "CARD" ? "AAPL" : undefined,
                chartType: type === "CHART" ? "AREA" : undefined,
                selectedFields: selectedFields,
                headers: finalHeaders,
                displayMode: displayMode
            }
        };

        addWidget(newWidget);
        onClose();
    };

    const handleTestApi = async () => {
        if (!apiUrl) return;

        setTestStatus("TESTING");
        setValidationError(""); // Clear previous errors
        try {
            const headers: Record<string, string> = {};
            // Add custom headers
            customHeaders.forEach(h => {
                if (h.key && h.value) headers[h.key] = h.value;
            });

            let fetchUrl = apiUrl;
            // Use proxy for Indian Stock API to handle CORS and User-Agent
            if (apiUrl.includes("stock.indianapi.in")) {
                fetchUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
            }

            const res = await fetch(fetchUrl, { headers });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const data = await res.json();

            // Strict Error Detection
            if (data.status === "error" || data.Status === "Error") {
                const msg = data.message || data.Message || "API returned an error status.";
                if (msg.toLowerCase().includes("apikey")) {
                    throw new Error("Invalid API Key. Please check your key.");
                }
                throw new Error(msg);
            }
            if (data.code && typeof data.code === "number" && data.code >= 400) {
                const msg = data.message || `API Error Code: ${data.code}`;
                if (data.code === 401 || msg.toLowerCase().includes("apikey")) {
                    throw new Error("Invalid API Key. Please check your key.");
                }
                throw new Error(msg);
            }
            if (data["Error Message"] || data["Note"] || data["Information"]) {
                const msg = data["Error Message"] || data["Note"] || data["Information"];
                if (msg.toLowerCase().includes("apikey") || msg.toLowerCase().includes("invalid api key")) {
                    throw new Error("Invalid API Key. Please check your key.");
                }
                throw new Error(msg);
            }

            setApiData(data);
            const flattened = flattenObject(data);
            const keys = Object.keys(flattened);

            if (keys.length === 0) {
                throw new Error("API returned empty data object.");
            }

            setAvailableFields(keys);
            setTestStatus("SUCCESS");
        } catch (error: any) {
            setTestStatus("ERROR");
            setValidationError(error.message || "Failed to connect to API");
        }
    };

    const toggleField = (field: string) => {
        if (selectedFields.includes(field)) {
            setSelectedFields(selectedFields.filter(f => f !== field));
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const filteredAvailableFields = availableFields.filter(f => {
        const matchSearch = f.toLowerCase().includes(fieldSearch.toLowerCase()) && !selectedFields.includes(f);
        if (!showArraysOnly) return matchSearch;

        const val = flattenObject(apiData)[f];
        return matchSearch && Array.isArray(val);
    });

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[600px] bg-[#0f172a] border border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                    <h3 className="font-semibold text-lg">Add New Widget</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-5 overflow-y-auto min-h-0 custom-scrollbar">

                    {/* Widget Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Widget Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Bitcoin Price"
                            className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-500"
                        />
                    </div>

                    {/* CUSTOM Config */}
                    {type === "CUSTOM" && (
                        <>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">API URL</label>
                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        placeholder="https://api.example.com/data"
                                        className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 font-mono"
                                    />
                                    <p className="text-[10px] text-slate-500">Enter the full API URL (including query parameters)</p>
                                </div>

                                {/* Custom Headers Section */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-slate-400">Headers (Optional)</label>
                                        <button
                                            onClick={() => setCustomHeaders([...customHeaders, { key: "", value: "" }])}
                                            className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Header
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
                                                    placeholder="Key (e.g. X-Api-Key)"
                                                    className="flex-1 h-8 px-2 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-300 font-mono"
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
                                                    className="flex-1 h-8 px-2 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-300 font-mono"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newHeaders = customHeaders.filter((_, i) => i !== index);
                                                        setCustomHeaders(newHeaders);
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleTestApi}
                                    disabled={!apiUrl || testStatus === "TESTING"}
                                    className={cn(
                                        "w-full h-9 text-xs font-medium rounded-md border border-slate-700 transition-colors flex items-center justify-center gap-2",
                                        testStatus === "SUCCESS" ? "bg-primary text-white border-primary" :
                                            "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                    )}
                                >
                                    {testStatus === "TESTING" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube className="w-3.5 h-3.5" />}
                                    {testStatus === "TESTING" ? "Testing Connection..." : "Test Connection"}
                                </button>

                                {testStatus === "SUCCESS" && (
                                    <div className="text-[11px] text-green-400 flex items-center gap-1.5 bg-green-500/10 px-3 py-2 rounded border border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Connection successful! {Object.keys(apiData || {}).length} fields found.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">Refresh Interval (seconds)</label>
                                <input
                                    type="number"
                                    min={5}
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100"
                                />
                            </div>
                        </>
                    )}

                    {/* Advanced Configuration Area - Only show after success for CUSTOM */}
                    {type === "CUSTOM" && testStatus === "SUCCESS" && (
                        <div className="space-y-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-4 fade-in">
                            {/* ... (Existing Custom Fields Config) ... */}
                            <h4 className="text-sm font-semibold text-slate-200">Select Fields to Display</h4>

                            {/* Display Mode */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">Display Mode</label>
                                <div className="flex gap-2">
                                    {(["CARD", "TABLE", "CHART"] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setDisplayMode(mode)}
                                            className={cn(
                                                "px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all border",
                                                displayMode === mode ? "bg-primary/20 text-primary border-primary" : "border-slate-700 text-slate-400 hover:bg-slate-800"
                                            )}
                                        >
                                            {mode === "CARD" && <LayoutGrid className="w-3.5 h-3.5" />}
                                            {mode === "TABLE" && <TableIcon className="w-3.5 h-3.5" />}
                                            {mode === "CHART" && <LineChart className="w-3.5 h-3.5" />}
                                            {mode.charAt(0) + mode.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ... Search and Fields ...  */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400">Search Fields</label>
                                <input
                                    type="text"
                                    placeholder="Search for fields..."
                                    value={fieldSearch}
                                    onChange={(e) => setFieldSearch(e.target.value)}
                                    className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="arraysOnly"
                                        checked={showArraysOnly}
                                        onChange={(e) => setShowArraysOnly(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="arraysOnly" className="text-xs text-slate-400 cursor-pointer select-none">Show arrays only (for table view)</label>
                                </div>
                            </div>

                            {/* Field Selection */}
                            <div className="space-y-4">
                                {/* Available Fields */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-slate-400">Available Fields</span>
                                    <div className="flex flex-col gap-1 p-1 bg-slate-900/50 border border-slate-800 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                                        {filteredAvailableFields.map(field => {
                                            return (
                                                <button
                                                    key={field}
                                                    onClick={() => toggleField(field)}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all group text-left"
                                                >
                                                    <span className="text-xs font-mono text-slate-300 truncate">{field}</span>
                                                    <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary" />
                                                </button>
                                            )
                                        })}
                                        {filteredAvailableFields.length === 0 && (
                                            <div className="text-xs text-slate-500 p-2 text-center">No fields found matching filters.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Fields */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-slate-400">Selected Fields</span>
                                    <div className="flex flex-col gap-1 p-1 bg-slate-900/50 border border-slate-800 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                                        {selectedFields.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 py-4">
                                                <p className="text-xs">No fields selected</p>
                                            </div>
                                        ) : (
                                            selectedFields.map(field => (
                                                <div key={field} className="flex items-center justify-between px-3 py-2 rounded bg-primary/10 border border-primary/20">
                                                    <span className="text-xs font-mono text-primary truncate">{field}</span>
                                                    <button
                                                        onClick={() => toggleField(field)}
                                                        className="text-slate-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {validationError && (
                    <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {validationError}
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 flex justify-end gap-3 shrink-0 bg-[#0f172a]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!name || (type === "CUSTOM" && testStatus !== "SUCCESS")}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Widget
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}
