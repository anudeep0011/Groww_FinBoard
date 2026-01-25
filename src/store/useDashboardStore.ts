import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DashboardState, WidgetConfig } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ExtendedDashboardState extends DashboardState {
    layouts: Record<string, WidgetConfig[]>; // Keyed by template ID (e.g., 'CUSTOM', 'TECH', 'CRYPTO')
    activeTemplate: string;
    switchTemplate: (templateId: string, defaultWidgets?: WidgetConfig[]) => void;

    // Deprecated but kept for compatibility if needed, though we should remove them
    switchToCustom: () => void;
    switchToPreset: (widgets: WidgetConfig[]) => void;
}

// Initial Layout Helper
// Helper function to determine the initial position for a new widget.
// Currently implements a simple "stack at bottom" strategy.
// TODO: Implement a "find first available gap" algorithm for better packing.
const getNextPosition = (widgets: WidgetConfig[]) => {
    // Check if there are existing widgets to find the lowest point
    const maxY = widgets.reduce((acc, w) => Math.max(acc, w.layout.y + w.layout.h), 0);
    return { x: 0, y: maxY };
};

export const useDashboardStore = create<ExtendedDashboardState>()(
    persist(
        (set, get) => ({
            widgets: [],
            layouts: {
                'CUSTOM': []
            },
            activeTemplate: 'CUSTOM',
            isEditMode: false,
            theme: "dark",
            dataSource: "MOCK",
            apiKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "",

            setDataSource: (source) => set({ dataSource: source }),
            setApiKey: (key) => set({ apiKey: key }),

            addWidget: (widget) => {
                const { widgets } = get();
                const { x, y } = getNextPosition(widgets);
                const newWidget: WidgetConfig = {
                    ...widget,
                    id: uuidv4(), // We will need uuid generic or just Math.random for now to save deps
                    layout: {
                        i: "", // set later
                        x,
                        y,
                        w: 4, // default width
                        h: 4, // default height
                    },
                };
                newWidget.layout.i = newWidget.id;

                const updatedWidgets = [...widgets, newWidget];
                const { activeTemplate, layouts } = get();

                set({
                    widgets: updatedWidgets,
                    layouts: {
                        ...layouts,
                        [activeTemplate]: updatedWidgets
                    }
                });
            },

            removeWidget: (id) =>
                set((state) => {
                    const updatedWidgets = state.widgets.filter((w) => w.id !== id);
                    return {
                        widgets: updatedWidgets,
                        layouts: {
                            ...state.layouts,
                            [state.activeTemplate]: updatedWidgets
                        }
                    };
                }),

            updateWidget: (id, updates) =>
                set((state) => {
                    const updatedWidgets = state.widgets.map((w) =>
                        w.id === id ? { ...w, ...updates } : w
                    );
                    return {
                        widgets: updatedWidgets,
                        layouts: {
                            ...state.layouts,
                            [state.activeTemplate]: updatedWidgets
                        }
                    };
                }),

            updateLayout: (layout) =>
                set((state) => {
                    // Optimized update using a Map for O(1) lookups instead of O(n^2) finding.
                    // This is crucial for performance during rapid drag-and-drop events.
                    const widgetMap = new Map(state.widgets.map(w => [w.id, w]));
                    layout.forEach((l) => {
                        const w = widgetMap.get(l.i);
                        if (w) {
                            w.layout = { ...w.layout, x: l.x, y: l.y, w: l.w, h: l.h };
                        }
                    });
                    const updatedWidgets = Array.from(widgetMap.values());
                    return {
                        widgets: updatedWidgets,
                        layouts: {
                            ...state.layouts,
                            [state.activeTemplate]: updatedWidgets
                        }
                    };
                }),

            toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

            setTheme: (theme) => set({ theme }),

            expandedWidgetId: null,

            toggleWidgetExpansion: (id) => set((state) => {
                // If passing null, force close
                if (id === null) return { expandedWidgetId: null };

                // If toggling same ID, close it (optional, but good UX)
                if (state.expandedWidgetId === id) return { expandedWidgetId: null };

                return { expandedWidgetId: id };
                return { expandedWidgetId: id };
            }),

            importDashboard: (state) => set((prev) => ({
                ...prev,
                widgets: state.widgets || [],
                theme: state.theme || "dark",
                dataSource: state.dataSource || "MOCK",
                // We typically do NOT import API keys for security, or we could if requested.
                // For now let's keep apiKey separate or manual.
            })),

            switchTemplate: (templateId, defaultWidgets = []) => set((state) => {
                // If layout exists for this template, load it.
                // If not, use defaultWidgets (and save them as the layout).
                const existingLayout = state.layouts[templateId];
                const widgetsToLoad = existingLayout || defaultWidgets;

                return {
                    activeTemplate: templateId,
                    widgets: widgetsToLoad,
                    layouts: {
                        ...state.layouts,
                        [templateId]: widgetsToLoad
                    }
                };
            }),

            // Compatibility wrappers
            switchToCustom: () => get().switchTemplate('CUSTOM'),
            switchToPreset: (widgets) => {
                // For presets, we might want to use a specific ID based on the widgets or just a generic one?
                // Actually, the new DashboardHeader will call switchTemplate directly.
                // But to keep TS happy for now:
                get().switchTemplate('PRESET_LEGACY', widgets);
            },
        }),

        {
            name: "finboard-storage",
        }
    )
);
