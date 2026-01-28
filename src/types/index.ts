export type WidgetType = "CHART" | "TABLE" | "CARD" | "CUSTOM";

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    title: string;
    description?: string;
    apiEndpoint?: string;
    refreshInterval?: number; // in seconds
    props?: Record<string, unknown>; // Flexible props for different widgets
    formatting?: {
        type: 'none' | 'number' | 'currency' | 'percent';
        decimals: number;
        currencySymbol?: string;
    };
    displayMode?: "CARD" | "CHART" | "TABLE";
    layout: LayoutItem;
}

export interface LayoutItem {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
}

export interface DashboardState {
    widgets: WidgetConfig[];
    isEditMode: boolean;
    theme: "dark" | "light";
    dataSource: "MOCK" | "FINNHUB";
    apiKeys: Record<string, string>;
    apiKey: string; // Deprecated, compatibility for direct access
    addWidget: (widget: Omit<WidgetConfig, "id" | "layout"> & { id?: string }) => void;
    setDataSource: (source: "MOCK" | "FINNHUB") => void;
    setApiKey: (provider: string, key: string) => void;
    removeApiKey: (provider: string) => void;
    removeWidget: (id: string) => void;
    updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
    updateLayout: (layout: LayoutItem[]) => void;
    toggleEditMode: () => void;
    setTheme: (theme: "dark" | "light") => void;
    expandedWidgetId: string | null;
    editingWidgetId?: string | null;
    toggleWidgetExpansion: (id: string | null) => void;
    setEditingWidgetId?: (id: string | null) => void;

    importDashboard: (state: Partial<DashboardState>) => void;
}
