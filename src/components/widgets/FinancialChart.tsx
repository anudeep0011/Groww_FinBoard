"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    CandlestickSeries,
    AreaSeries,
    HistogramSeries,
    LineSeries,
    Time
} from "lightweight-charts";

export interface ChartDataPoint {
    time: string | Time;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    value?: number; // for Line/Area
    volume?: number; // Optional volume for this timestamp
}

export type ChartType = "CANDLE" | "AREA" | "LINE" | "BAR";

interface FinancialChartProps {
    data: ChartDataPoint[];
    volume?: { time: string | Time; value: number; color?: string }[];
    chartType?: ChartType;
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
        upColor?: string;
        downColor?: string;
    };
    height?: number;
}

export const FinancialChart = forwardRef<IChartApi | null, FinancialChartProps>(({
    data,
    volume,
    chartType = "AREA",
    colors = {},
    height
}, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick" | "Area" | "Line" | "Histogram"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const {
        backgroundColor = "transparent",
        lineColor = "#2962FF",
        textColor = "rgba(255, 255, 255, 0.9)",
        areaTopColor = "rgba(41, 98, 255, 0.28)",
        areaBottomColor = "rgba(41, 98, 255, 0.05)",
        upColor = "#26a69a",
        downColor = "#ef5350",
    } = colors;

    useImperativeHandle(ref, () => chartRef.current as IChartApi);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: height || chartContainerRef.current.clientHeight,
            grid: {
                vertLines: { color: "rgba(197, 203, 206, 0.05)" },
                horzLines: { color: "rgba(197, 203, 206, 0.05)" },
            },
            crosshair: {
                mode: 1, // Magnet mode
                vertLine: {
                    width: 1,
                    color: "rgba(224, 227, 235, 0.1)",
                    style: 0,
                },
                horzLine: {
                    visible: true,
                    labelVisible: true,
                    color: "rgba(224, 227, 235, 0.1)",
                },
            },
            timeScale: {
                borderColor: "rgba(197, 203, 206, 0.1)",
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: "rgba(197, 203, 206, 0.1)",
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2, // Leave space for volume
                },
            },

        });

        chartRef.current = chart;

        // 1. Add Main Series (Price)
        let series;
        if (chartType === "CANDLE") {
            series = chart.addSeries(CandlestickSeries, {
                upColor,
                downColor,
                borderVisible: false,
                wickUpColor: upColor,
                wickDownColor: downColor,
            });
            // Determine strict data for candles
            const candleData = data.map(d => ({
                time: d.time,
                open: d.open || d.value || 0,
                high: d.high || d.value || 0,
                low: d.low || d.value || 0,
                close: d.close || d.value || 0,
            }));
            series.setData(candleData);
        } else if (chartType === "AREA") {
            series = chart.addSeries(AreaSeries, {
                lineColor,
                topColor: areaTopColor,
                bottomColor: areaBottomColor,
                lineWidth: 2,
            });
            series.setData(data.map(d => ({
                time: d.time,
                value: d.close || d.value || 0
            })));
        } else {
            series = chart.addSeries(LineSeries, {
                color: lineColor,
                lineWidth: 2,
            });
            series.setData(data.map(d => ({
                time: d.time,
                value: d.close || d.value || 0
            })));
        }
        seriesRef.current = series;

        // 2. Add Volume Series (Optional)
        if (volume && volume.length > 0) {
            const volSeries = chart.addSeries(HistogramSeries, {
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '', // Overlay on same chart
            });

            // Set volume scale margins to sit at bottom
            volSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.8, // Start at 80% down
                    bottom: 0,
                },
            });

            volSeries.setData(volume);
            volumeSeriesRef.current = volSeries;
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [data, volume, chartType, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, upColor, downColor, height]);

    // Handle updates (This is a simplified full re-render approach, strictly effect-based above is usually fine for these props)
    // For specialized high-freq updates, we'd use the ref to call .update()

    return (
        <div ref={chartContainerRef} className="w-full h-full" />
    );
});

FinancialChart.displayName = "FinancialChart";
