import useSWR from "swr";
import { getStockData } from "@/services";
import { StockData } from "@/services/types";

// Map range to Finnhub Resolution & Timestamps
const getRangeParams = (range: "1D" | "1W" | "1M" | "1Y") => {
    const to = Math.floor(Date.now() / 1000);
    let from = to;
    let resolution = "D";

    switch (range) {
        case "1D": // Intra-day (5 min intervals)
            from = to - (24 * 60 * 60);
            resolution = "5";
            break;
        case "1W": // 1 Week (30 min intervals)
            from = to - (7 * 24 * 60 * 60);
            resolution = "30";
            break;
        case "1M": // 1 Month (Daily)
            from = to - (30 * 24 * 60 * 60);
            resolution = "D";
            break;
        case "1Y": // 1 Year (Weekly)
            from = to - (365 * 24 * 60 * 60);
            resolution = "W";
            break;
    }
    return { resolution, from, to };
};

export function useStockData(symbol: string, range: "1D" | "1W" | "1M" | "1Y" = "1M", refreshInterval: number = 60000) {
    const { resolution, from, to } = getRangeParams(range);

    // Pass params as array key to SWR to trigger re-fetch on change
    const { data, error, isLoading, mutate } = useSWR<StockData>(
        [symbol, resolution, from, to],
        ([s, res, f, t]: [string, string, number, number]) => getStockData(s, res, f, t),
        {
            refreshInterval: refreshInterval,
            keepPreviousData: true,
            dedupingInterval: 2000,
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
                // Never retry on 404.
                if (error.status === 404) return;

                // Never retry on 429 (Rate Limit) or 401/403 (Auth) to prevent spamming
                // We depend on the error object having a status, or the message containing "429"
                if (error.message.includes("429") || error.message.includes("Rate limit")) return;
                if (error.message.includes("401") || error.message.includes("403") || error.message.includes("Invalid API")) return;

                // Only retry up to 3 times.
                if (retryCount >= 3) return;

                // Retry after 5 seconds.
                setTimeout(() => revalidate({ retryCount }), 5000);
            }
        }
    );

    return {
        stock: data,
        isLoading,
        isError: error,
        mutate,
    };
}
