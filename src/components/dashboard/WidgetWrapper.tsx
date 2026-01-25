"use client";

import React, { useState } from "react";
import { WidgetConfig } from "@/types";
import { useDashboardStore } from "@/store/useDashboardStore";
import { X, GripHorizontal, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIDGET_REGISTRY } from "../widgets/WidgetRegistry";
import { WidgetConfigModal } from "./WidgetConfigModal";
import { motion } from "framer-motion";

interface WidgetWrapperProps {
    widget: WidgetConfig;
}

export function WidgetWrapper({ widget }: WidgetWrapperProps) {
    const { removeWidget, isEditMode, toggleWidgetExpansion, expandedWidgetId } = useDashboardStore();
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const isExpanded = expandedWidgetId === widget.id;

    const Component = WIDGET_REGISTRY[widget.type];

    const handleWrapperClick = (e: React.MouseEvent) => {
        // Prevent expansion if clicking specific controls or if we are in edit mode dragging
        if (isEditMode || isExpanded) return;
        // Also don't expand if clicking config modal
        if ((e.target as HTMLElement).closest("button")) return;

        toggleWidgetExpansion(widget.id);
    };

    return (
        <motion.div
            layout={true}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={handleWrapperClick}
            className={cn(
                "h-full w-full flex flex-col bg-card border border-border/50 shadow-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 backdrop-blur-sm relative",
                !isExpanded && !isEditMode && "cursor-pointer hover:scale-[1.01]"
            )}
        >
            {isConfigOpen && (
                <WidgetConfigModal widgetId={widget.id} onClose={() => setIsConfigOpen(false)} />
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-card/50 border-b border-border/40 h-10 shrink-0 select-none">
                <div className="flex items-center gap-2 overflow-hidden w-full">
                    {isEditMode ? (
                        <GripHorizontal className="w-4 h-4 text-muted-foreground cursor-grab widget-drag-handle hover:text-primary transition-colors shrink-0" />
                    ) : null}
                    <span className="text-sm font-medium truncate text-card-foreground">
                        {widget.title}
                    </span>
                    {widget.refreshInterval && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted/20 rounded text-muted-foreground">{widget.refreshInterval}s</span>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {/* Maximize button removed as click anywhere expands */}

                    {isEditMode && (
                        <>
                            <button
                                onClick={() => setIsConfigOpen(true)}
                                className="p-1 rounded-md hover:bg-accent/20 hover:text-accent transition-colors"
                                title="Configure"
                            >
                                <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this widget?")) {
                                        removeWidget(widget.id);
                                    }
                                }}
                                className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                                title="Remove"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
                {Component ? (
                    <Component {...widget.props} isPreview={true} />
                ) : (
                    <div className="p-4 text-red-500">Unknown Widget Type: {widget.type}</div>
                )}
            </div>
        </motion.div>
    );
}
