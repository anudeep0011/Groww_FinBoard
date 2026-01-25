"use client";

import React, { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";

interface FinancialChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
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

        // Detect Data Type and Add Series
        // We expect data to be normalized before passing here, but let's handle basic detection
        // Format needed: { time: '2018-12-22', value: 32.51 } for Line/Area
        // Format needed: { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 } for Candlestick

        if (data.length > 0) {
            const firstItem = data[0];
            const isCandle = "open" in firstItem && "high" in firstItem && "low" in firstItem && "close" in firstItem;

            if (isCandle) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const candlestickSeries = (chart as any).addCandlestickSeries({
                    upColor: '#26a69a',
                    downColor: '#ef5350',
                    borderVisible: false,
                    wickUpColor: '#26a69a',
                    wickDownColor: '#ef5350',
                });
                candlestickSeries.setData(data);
                chart.timeScale().fitContent();
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const areaSeries = (chart as any).addAreaSeries({
                    lineColor,
                    topColor: areaTopColor,
                    bottomColor: areaBottomColor,
                });

                // Ensure data has 'value' key
                const validData = data.map(d => ({
                    time: d.time,
                    value: d.value !== undefined ? d.value : (d.close || d.price || 0)
                }));

                // Sort by time just in case
                validData.sort((a, b) => (new Date(a.time).getTime() - new Date(b.time).getTime()));

                // Filter out invalid dates/values
                const cleanData = validData.filter(d => d.time && !isNaN(d.value));

                areaSeries.setData(cleanData);
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
