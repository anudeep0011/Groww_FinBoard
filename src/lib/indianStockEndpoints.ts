// Indian Stock API Endpoint Configuration

export interface IndianStockEndpoint {
    value: string;
    label: string;
    requiresSymbol: boolean;
    category: string;
}

export const INDIAN_STOCK_ENDPOINTS: IndianStockEndpoint[] = [
    // Stock Data (requires symbol)
    { value: "/nse/stock", label: "NSE Stock Details", requiresSymbol: true, category: "Stock Data" },
    { value: "/stock", label: "Stock Details", requiresSymbol: true, category: "Stock Data" },
    { value: "/historical_data", label: "Historical Data", requiresSymbol: true, category: "Stock Data" },
    { value: "/stock_forecasts", label: "Stock Forecasts", requiresSymbol: true, category: "Stock Data" },
    { value: "/historical_stats", label: "Historical Stats", requiresSymbol: true, category: "Stock Data" },
    { value: "/stock_target_price", label: "Stock Target Price", requiresSymbol: true, category: "Stock Data" },

    // Market Data (no symbol needed)
    { value: "/trending", label: "Trending Stocks", requiresSymbol: false, category: "Market Data" },
    { value: "/NSE_most_active", label: "NSE Most Active", requiresSymbol: false, category: "Market Data" },
    { value: "/BSE_most_active", label: "BSE Most Active", requiresSymbol: false, category: "Market Data" },
    { value: "/price_shockers", label: "Price Shockers", requiresSymbol: false, category: "Market Data" },
    { value: "/fetch_52_week_high_low_data", label: "52 Week High/Low", requiresSymbol: false, category: "Market Data" },

    // News & Info (no symbol needed)
    { value: "/news", label: "News", requiresSymbol: false, category: "News & Info" },
    { value: "/ipo", label: "IPO Data", requiresSymbol: false, category: "News & Info" },
    { value: "/recent_announcements", label: "Recent Announcements", requiresSymbol: false, category: "News & Info" },
    { value: "/corporate_actions", label: "Corporate Actions", requiresSymbol: false, category: "News & Info" },

    // Other (no symbol needed)
    { value: "/commodities", label: "Commodities", requiresSymbol: false, category: "Other" },
    { value: "/mutual_funds", label: "Mutual Funds", requiresSymbol: false, category: "Other" },
    { value: "/mutual_funds_details", label: "Mutual Fund Details", requiresSymbol: false, category: "Other" },
    { value: "/mutual_fund_search", label: "Mutual Fund Search", requiresSymbol: false, category: "Other" },
    { value: "/industry_search", label: "Industry Search", requiresSymbol: false, category: "Other" },
    { value: "/statement", label: "Statement", requiresSymbol: false, category: "Other" },
];

export const getEndpointConfig = (endpoint: string): IndianStockEndpoint | undefined => {
    return INDIAN_STOCK_ENDPOINTS.find(e => e.value === endpoint);
};

export const requiresSymbol = (endpoint: string): boolean => {
    const config = getEndpointConfig(endpoint);
    return config?.requiresSymbol ?? false;
};

export const getEndpointsByCategory = () => {
    const categories: Record<string, IndianStockEndpoint[]> = {};
    INDIAN_STOCK_ENDPOINTS.forEach(endpoint => {
        if (!categories[endpoint.category]) {
            categories[endpoint.category] = [];
        }
        categories[endpoint.category].push(endpoint);
    });
    return categories;
};
