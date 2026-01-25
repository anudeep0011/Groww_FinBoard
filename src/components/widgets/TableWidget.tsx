"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StockRow {
    symbol: string;
    name: string;
    price: number;
    change: number;
    marketCap: string;
}

const MOCK_DATA: StockRow[] = [
    { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 1.25, marketCap: "2.8T" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 370.45, change: 0.85, marketCap: "2.7T" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.50, change: -0.55, marketCap: "1.8T" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 153.30, change: -1.20, marketCap: "1.6T" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 540.10, change: 3.40, marketCap: "1.3T" },
];

export function TableWidget() {
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const itemsPerPage = 5;

    const filteredData = React.useMemo(() => {
        return MOCK_DATA.filter(stock =>
            stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
            stock.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    return (
        <div className="flex flex-col h-full w-full bg-background/40">
            {/* Controls */}
            <div className="p-2 border-b border-border/50 flex gap-2">
                <input
                    type="text"
                    placeholder="Search stocks..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full h-8 px-2 text-xs bg-background/50 border border-border/50 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Header */}
            <div className="flex items-center px-4 py-2 border-b border-border/50 text-xs font-semibold text-muted-foreground bg-muted/20">
                <div className="flex-1">Company</div>
                <div className="w-24 text-right">Price</div>
                <div className="w-20 text-right">Change</div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
                {paginatedData.length > 0 ? (
                    paginatedData.map((stock) => (
                        <div key={stock.symbol} className="flex items-center px-4 py-3 border-b border-border/30 hover:bg-accent/5 transition-colors text-sm">
                            <div className="flex-1">
                                <div className="font-medium text-foreground">{stock.symbol}</div>
                                <div className="text-xs text-muted-foreground">{stock.name}</div>
                            </div>
                            <div className="w-24 text-right font-mono">
                                ${stock.price.toFixed(2)}
                            </div>
                            <div className={cn("w-20 text-right flex items-center justify-end gap-1", stock.change >= 0 ? "text-accent" : "text-destructive")}>
                                {stock.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(stock.change)}%
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                        No results found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="border-t border-border/50 bg-muted/10">
                {totalPages > 1 && (
                    <div className="p-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/20">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-2 py-1 hover:bg-accent/10 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                            Prev
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-2 py-1 hover:bg-accent/10 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
                <div className="px-2 py-1 text-[10px] text-muted-foreground/60 font-medium text-right">
                    Last updated: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
