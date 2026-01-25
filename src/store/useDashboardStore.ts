import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DashboardState, WidgetConfig } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Initial Layout Helper
const getNextPosition = (widgets: WidgetConfig[]) => {
    // Simple logic: place at bottom. complex logic later.
    const maxY = widgets.reduce((acc, w) => Math.max(acc, w.layout.y + w.layout.h), 0);
    return { x: 0, y: maxY };
};

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            widgets: [],
            isEditMode: false,
            theme: "dark",
            dataSource: "MOCK",
            apiKey: "",

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

                set({ widgets: [...widgets, newWidget] });
            },

            removeWidget: (id) =>
                set((state) => ({
                    widgets: state.widgets.filter((w) => w.id !== id),
                })),

            updateWidget: (id, updates) =>
                set((state) => ({
                    widgets: state.widgets.map((w) =>
                        w.id === id ? { ...w, ...updates } : w
                    ),
                })),

            updateLayout: (layout) =>
                set((state) => {
                    // efficient update
                    const widgetMap = new Map(state.widgets.map(w => [w.id, w]));
                    layout.forEach((l) => {
                        const w = widgetMap.get(l.i);
                        if (w) {
                            w.layout = { ...w.layout, x: l.x, y: l.y, w: l.w, h: l.h };
                        }
                    });
                    return { widgets: Array.from(widgetMap.values()) };
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
        }),

        {
            name: "finboard-storage",
        }
    )
);
