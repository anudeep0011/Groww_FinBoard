import { StockData, OHLCData } from "./types";

const BASE_URL = "https://finnhub.io/api/v1";

// Simple in-memory cache
const CACHE = new Map<string, { data: StockData; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Request queue to prevent bursts
let requestQueue: Promise<any> = Promise.resolve();
const RATE_LIMIT_DELAY = 1000; // 1 second between calls

// Finnhub candle response format
interface FinnhubCandles {
    c: number[]; // close
    h: number[]; // high
    l: number[]; // low
    o: number[]; // open
    s: string;   // status
    t: number[]; // time
    v: number[]; // volume
}

interface FinnhubQuote {
    c: number; // Current price
    d: number; // Change
    dp: number; // Percent change
    h: number; // High price of the day
    l: number; // Low price of the day
    o: number; // Open price of the day
    pc: number; // Previous close price
}

export async function fetchFinnhubData(
    symbol: string,
    apiKey: string,
    resolution: string = "D",
    from?: number,
    to?: number
): Promise<StockData> {
    if (!apiKey) {
        throw new Error("API Key is missing");
    }

    // Normalize 'to' to the nearest minute to improve cache hit rate
    // If 'to' is not provided, we assume 'now'. We round 'now' down to the nearest minute.
    const now = Math.floor(Date.now() / 1000);
    const normalizedTo = to || (Math.floor(now / 60) * 60);
    const normalizedFrom = from || (normalizedTo - (30 * 24 * 60 * 60));

    // Check Cache
    const cacheKey = `${symbol}-${resolution}-${normalizedFrom}-${normalizedTo}`;
    const cached = CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        // console.log(`[Finnhub] Serving ${symbol} from cache`);
        return cached.data;
    }

    // Chain requests to prevent burst
    const currentRequest = requestQueue.then(async () => {
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY));

        // 1. Fetch Quote for real-time price
        const quoteRes = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`);

        if (!quoteRes.ok) {
            if (quoteRes.status === 429) {
                throw new Error("Rate limit exceeded. Try again in 1 min.");
            }
            if (quoteRes.status === 401 || quoteRes.status === 403) {
                throw new Error("Invalid API Key");
            }
            throw new Error(`Failed to fetch quote: ${quoteRes.statusText}`);
        }
        const quote: FinnhubQuote = await quoteRes.json();

        // 2. Fetch Candles for history
        let history: OHLCData[] = [];
        try {
            const candleRes = await fetch(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${normalizedFrom}&to=${normalizedTo}&token=${apiKey}`);

            if (candleRes.ok) {
                const candles: FinnhubCandles = await candleRes.json();
                if (candles.s === "ok" && candles.t) {
                    history = candles.t.map((timestamp, index) => ({
                        time: new Date(timestamp * 1000).toLocaleString(), // Use local string for better readability
                        open: candles.o[index],
                        high: candles.h[index],
                        low: candles.l[index],
                        close: candles.c[index],
                        volume: candles.v[index],
                    }));
                } else if (candles.s === "no_data") {
                    console.warn("Finnhub returned no data for this range.");
                }
            } else {
                if (candleRes.status === 429) {
                    console.warn("Rate limit exceeded for candles request.");
                } else {
                    console.warn(`Finnhub candle fetch failed: ${candleRes.status}`);
                }
            }
        } catch (err) {
            console.warn("Finnhub history fetch failed, returning only quote", err);
        }

        // If history is empty, create a single point from quote to prevent UI crash
        if (history.length === 0) {
            history.push({
                time: new Date().toLocaleString(),
                open: quote.o || quote.c,
                high: quote.h || quote.c,
                low: quote.l || quote.c,
                close: quote.c,
                volume: 0
            });
        }

        const data = {
            symbol,
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            currency: "USD", // Finnhub default for US stocks
            history: history
        };

        // Update Cache
        CACHE.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    });

    // Update queue tail
    requestQueue = currentRequest.then(() => { }).catch(() => { });

    return currentRequest;
}
