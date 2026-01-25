import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import React from "react";

// Loading component
const WidgetLoader = () => (
    <div className="flex items-center justify-center h-full w-full bg-muted/10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
    </div>
);

// Lazy load heavy widgets
const ChartWidget = dynamic(() => import("./ChartWidget").then(mod => mod.ChartWidget), {
    loading: () => <WidgetLoader />,
    ssr: false // Charts often need window/document which isn't available on server
});

const CustomApiWidget = dynamic(() => import("./CustomApiWidget").then(mod => mod.CustomApiWidget), {
    loading: () => <WidgetLoader />,
});

// Lighter widgets can remain static or also be dynamic if needed
import { CardWidget } from "./CardWidget"; // Keep static if very small, or make dynamic for consistency
import { TableWidget } from "./TableWidget"; // Keep static or dynamic

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
    CHART: ChartWidget,
    CUSTOM: CustomApiWidget,
    CARD: CardWidget, // Keeping lightweight widgets static for instant render
    TABLE: TableWidget
};
