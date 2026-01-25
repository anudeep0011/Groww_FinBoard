import { StockData, OHLCData } from "./types";

// Generate realistic OHLC candles
const generateHistory = (startPrice: number, points: number = 20): OHLCData[] => {
    let currentPrice = startPrice;
    const history: OHLCData[] = [];
    const now = new Date();

    for (let i = points; i > 0; i--) {
        const time = new Date(now.getTime() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Simulate volatility
        const volatility = startPrice * 0.002;
        const change = (Math.random() - 0.5) * 2 * volatility;

        const open = parseFloat(currentPrice.toFixed(2));
        const close = parseFloat((currentPrice + change).toFixed(2));
        const high = parseFloat((Math.max(open, close) + Math.random() * volatility).toFixed(2));
        const low = parseFloat((Math.min(open, close) - Math.random() * volatility).toFixed(2));
        const volume = Math.floor(Math.random() * 10000) + 1000;

        history.push({ time, open, high, low, close, volume });
        currentPrice = close;
    }
    return history;
};

export const MOCK_STOCKS: Record<string, StockData> = {
    "AAPL": {
        symbol: "AAPL",
        price: 185.92,
        change: 2.34,
        changePercent: 1.25,
        currency: "USD",
        history: generateHistory(183)
    },
    "GOOGL": {
        symbol: "GOOGL",
        price: 142.50,
        change: -0.85,
        changePercent: -0.55,
        currency: "USD",
        history: generateHistory(143)
    },
    "BTC": {
        symbol: "BTC",
        price: 45000,
        change: 1200,
        changePercent: 2.1,
        currency: "USD",
        history: generateHistory(44000)
    },
    "TSLA": {
        symbol: "TSLA",
        price: 240.10,
        change: -5.20,
        changePercent: -2.01,
        currency: "USD",
        history: generateHistory(245)
    }
};

export async function fetchStockData(symbol: string): Promise<StockData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data, but slightly randomized for live feel
    const base = MOCK_STOCKS[symbol] || MOCK_STOCKS["AAPL"];

    // Generate next tick based on last close

    const volatility = base.price * 0.001;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = parseFloat((base.price + change).toFixed(2));

    // Update history (shift and push new fake candle updates)
    const newHistory = [...base.history];

    if (Math.random() > 0.8) {
        // New candle every now and then
        newHistory.shift();
        const newCandleBase = newPrice;
        newHistory.push({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: newCandleBase,
            high: newCandleBase,
            low: newCandleBase,
            close: newCandleBase,
            volume: 100
        });
    } else {
        // Update last candle
        const last = newHistory[newHistory.length - 1];
        last.close = newPrice;
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        last.volume += Math.floor(Math.random() * 100);
        newHistory[newHistory.length - 1] = last;
    }

    return {
        ...base,
        price: newPrice,
        change: (newPrice - base.history[0].open),
        changePercent: ((newPrice - base.history[0].open) / base.history[0].open) * 100,
        history: newHistory
    };
}
