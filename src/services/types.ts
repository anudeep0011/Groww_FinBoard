export interface OHLCData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    history: OHLCData[];
}
