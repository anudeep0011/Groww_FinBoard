import { StockData, OHLCData } from "./types";

const BASE_URL = "https://finnhub.io/api/v1";

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

    // Default time range: LAST 30 DAYS if not provided
    const currentTime = Math.floor(Date.now() / 1000);
    const apiTo = to || currentTime;
    const apiFrom = from || (apiTo - (30 * 24 * 60 * 60));

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
        const candleRes = await fetch(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${apiFrom}&to=${apiTo}&token=${apiKey}`);

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
                // We don't throw here to allow partial data (quote) if possible, 
                // but for strict consistency maybe we should? 
                // Let's warn and let it fallback to quote point so widget doesn't break entirely.
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

    return {
        symbol,
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        currency: "USD", // Finnhub default for US stocks
        history: history
    };
}
