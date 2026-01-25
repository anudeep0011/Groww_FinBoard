import React from "react";
import { PlusCircle } from "lucide-react";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
                <PlusCircle className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground/80 mb-2">Welcome to FinBoard</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                Your dashboard is currently empty. Start by adding some widgets to track your favorite stocks and market data.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground/60">
                <p>Tip: Click the &quot;Add Widget&quot; button below to get started.</p>
            </div>
        </div>
    );
}
