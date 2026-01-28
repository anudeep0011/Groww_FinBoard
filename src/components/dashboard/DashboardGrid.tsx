"use client";

import React, { useMemo } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { WidgetWrapper } from "./WidgetWrapper";
import { EmptyState } from "./EmptyState";
import { ExpandedWidgetOverlay } from "./ExpandedWidgetOverlay";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Handle RGL imports for Next.js app directory (avoid ESM/CommonJS mismatch)
import { Responsive, WidthProvider, Layout } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardGrid() {
    const { widgets, updateLayout, isEditMode, _hasHydrated } = useDashboardStore();

    // Transform widgets to RGL layout format
    const layout = useMemo(
        () =>
            widgets.map((w) => ({
                i: w.id,
                x: w.layout.x,
                y: w.layout.y,
                w: w.layout.w,
                h: w.layout.h,
            })),
        [widgets]
    );

    const handleLayoutChange = (currentLayout: Layout[]) => {
        updateLayout(currentLayout);
    };

    // Prevent FOUC (Flash of Unstyled Content) or empty state flash by waiting for hydration
    if (!_hasHydrated) {
        return <div className="w-full min-h-screen bg-background" />; // Or specific skeleton
    }

    if (widgets.length === 0) {
        return (
            <div className="w-full min-h-screen p-6">
                <EmptyState />
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen p-6">
            <ExpandedWidgetOverlay />
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                onLayoutChange={handleLayoutChange}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                draggableHandle=".widget-drag-handle"
            >
                {widgets.map((widget) => (
                    <div key={widget.id}>
                        <WidgetWrapper widget={widget} />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}
