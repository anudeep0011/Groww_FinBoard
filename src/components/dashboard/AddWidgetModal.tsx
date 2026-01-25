"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, TestTube, Search, Plus, Trash2, LayoutGrid, Table as TableIcon, LineChart } from "lucide-react";
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
    const [name, setName] = useState("Apple Inc.");
    const [type, setType] = useState<WidgetType>("CHART");
    const [apiUrl, setApiUrl] = useState("https://api.coinbase.com/v2/exchange-rates?currency=BTC");
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [testStatus, setTestStatus] = useState<"IDLE" | "TESTING" | "SUCCESS" | "ERROR">("IDLE");
    const [stockSymbol, setStockSymbol] = useState("AAPL"); // New state for Stock Chart symbol

    // Advanced Config State
    const [apiData, setApiData] = useState<any>(null);
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [displayMode, setDisplayMode] = useState<"CARD" | "TABLE" | "CHART">("CARD");
    const [fieldSearch, setFieldSearch] = useState("");
    const [showArraysOnly, setShowArraysOnly] = useState(false);

    // Handlers
    const handleAdd = () => {
        const widgetProps: any = {};

        if (type === "CHART") {
            widgetProps.symbol = stockSymbol;
        } else if (type === "CUSTOM") {
            widgetProps.apiUrl = apiUrl;
            widgetProps.refreshInterval = refreshInterval;
            widgetProps.selectedFields = selectedFields;
            widgetProps.displayMode = displayMode;
        }

        addWidget({
            title: name || "New Widget",
            type: type,
            props: widgetProps,
            apiEndpoint: type === "CUSTOM" ? apiUrl : undefined,
            refreshInterval: refreshInterval
        });
        onClose();
    };

    const handleTestApi = async () => {
        if (!apiUrl) return;
        setTestStatus("TESTING");
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();

            setApiData(data);
            const flattened = flattenObject(data);
            setAvailableFields(Object.keys(flattened));

            setTestStatus("SUCCESS");
        } catch (e) {
            setTestStatus("ERROR");
            setTimeout(() => setTestStatus("IDLE"), 2000);
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

                    {/* Widget Type Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Widget Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setType("CHART"); setName("Apple Inc."); }}
                                className={cn(
                                    "flex-1 px-4 py-3 rounded-lg border flex flex-col items-center gap-2 transition-all",
                                    type === "CHART" ? "bg-primary/20 border-primary text-primary" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                                )}
                            >
                                <LineChart className="w-6 h-6" />
                                <span className="text-sm font-medium">Stock Chart</span>
                            </button>
                            <button
                                onClick={() => { setType("CUSTOM"); setName("Bitcoin Price"); }}
                                className={cn(
                                    "flex-1 px-4 py-3 rounded-lg border flex flex-col items-center gap-2 transition-all",
                                    type === "CUSTOM" ? "bg-primary/20 border-primary text-primary" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                                )}
                            >
                                <TestTube className="w-6 h-6" />
                                <span className="text-sm font-medium">Custom API</span>
                            </button>
                        </div>
                    </div>

                    {/* Widget Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Widget Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={type === "CHART" ? "e.g., Apple Inc." : "e.g., Bitcoin Price"}
                            className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder-slate-500"
                        />
                    </div>

                    {/* CHART Config */}
                    {type === "CHART" && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Stock Symbol</label>
                            <input
                                type="text"
                                // Reuse apiUrl state for symbol to save lines or make new state? Let's assume user types symbol here.
                                // Actually better to use a dedicated state or reuse name if we parse it.
                                // Let's use apiUrl as a temp holder for Symbol for now or add new state?
                                // To be safe, let's hardcode to AAPL in logic or add a small input.
                                // For this demo, let's just use 'name' as title and add a specific Symbol Input.
                                placeholder="AAPL"
                                value={stockSymbol}
                                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                                className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100"
                            />
                            <p className="text-[10px] text-slate-500">Enter stock symbol (e.g. AAPL, GOOGL, MSFT)</p>
                        </div>
                    )}

                    {/* CUSTOM Config */}
                    {type === "CUSTOM" && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">API URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        placeholder="https://api.example.com/data"
                                        className="flex-1 h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 font-mono"
                                    />
                                    <button
                                        onClick={handleTestApi}
                                        disabled={!apiUrl || testStatus === "TESTING"}
                                        className={cn(
                                            "px-4 h-10 text-xs font-medium rounded-md border border-slate-700 transition-colors flex items-center gap-2",
                                            testStatus === "SUCCESS" ? "bg-primary text-white border-primary" :
                                                "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                        )}
                                    >
                                        {testStatus === "TESTING" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube className="w-3.5 h-3.5" />}
                                        {testStatus === "TESTING" ? "Testing" : "Test"}
                                    </button>
                                </div>

                                {testStatus === "SUCCESS" && (
                                    <div className="text-[11px] text-green-400 flex items-center gap-1.5 bg-green-500/10 px-3 py-2 rounded border border-green-500/20 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        API connection successful! {Object.keys(apiData || {}).length} fields found.
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
