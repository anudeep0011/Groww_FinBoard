"use client";

import React, { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, CandlestickSeries, AreaSeries, Time } from "lightweight-charts";

// Define strict types for our data
export interface ChartCandlestickData {
    time: string | Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface ChartAreaData {
    time: string | Time;
    value: number;
}

export type FinancialChartData = ChartCandlestickData | ChartAreaData;

interface FinancialChartProps {
    data: FinancialChartData[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

// Type guard to check if data is candlestick
function isCandlestickData(data: FinancialChartData): data is ChartCandlestickData {
    return (data as ChartCandlestickData).open !== undefined;
}

export function FinancialChart({ data, colors = {} }: FinancialChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    const {
        backgroundColor = "transparent",
        lineColor = "#2962FF",
        textColor = "rgba(255, 255, 255, 0.9)",
        areaTopColor = "#2962FF",
        areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = colors;

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            grid: {
                vertLines: { color: "rgba(197, 203, 206, 0.1)" },
                horzLines: { color: "rgba(197, 203, 206, 0.1)" },
            },
            timeScale: {
                borderColor: "rgba(197, 203, 206, 0.1)",
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: "rgba(197, 203, 206, 0.1)",
            },
        });

        chartRef.current = chart;

        if (data.length > 0) {
            const firstItem = data[0];
            const isCandle = isCandlestickData(firstItem);

            if (isCandle) {
                const candlestickSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#26a69a',
                    downColor: '#ef5350',
                    borderVisible: false,
                    wickUpColor: '#26a69a',
                    wickDownColor: '#ef5350',
                });
                // We know it's candlestick because of the check, but TS needs help with the array
                candlestickSeries.setData(data as ChartCandlestickData[]);
                chart.timeScale().fitContent();
            } else {
                const areaSeries = chart.addSeries(AreaSeries, {
                    lineColor,
                    topColor: areaTopColor,
                    bottomColor: areaBottomColor,
                });

                // Ensure data has 'value' key, handle potential fallback if data was passed loosely
                // In strict mode, we expect data to already be correct, but we'll keep the map for safety if needed
                // actually if we type `data` strictly, we shouldn't need to remap if the caller complies.
                // But let's support flexible input if the caller passes something slightly off (unlikely with strict TS)
                // For now, let's assume strict compliance but safe casting.

                const validData = data.filter((d): d is ChartAreaData => 'value' in d);

                // Sort by time just in case
                validData.sort((a, b) => (new Date(a.time as string).getTime() - new Date(b.time as string).getTime()));

                areaSeries.setData(validData);
                chart.timeScale().fitContent();
            }
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

    return (
        <div ref={chartContainerRef} className="w-full h-full" />
    );
}
