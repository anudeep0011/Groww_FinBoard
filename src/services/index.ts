import { fetchStockData as fetchMockData } from "./mock";
import { fetchFinnhubData } from "./finnhub";
import { StockData } from "./types";
import { useDashboardStore } from "@/store/useDashboardStore";

export async function getStockData(
    symbol: string,
    resolution: string = "D",
    from?: number,
    to?: number
): Promise<StockData> {
    const state = useDashboardStore.getState();
    const { dataSource, apiKey } = state;

    if (dataSource === "FINNHUB" && apiKey) {
        try {
            return await fetchFinnhubData(symbol, apiKey, resolution, from, to);
        } catch (error) {
            console.error("Finnhub fetch failed", error);
            throw error; // Throw error to trigger UI error state instead of silent fail
        }
    }

    return fetchMockData(symbol);
}
