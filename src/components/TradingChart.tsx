import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { ChartDataPoint, TimeRange } from '../types';
import {
  CandlestickChart,
} from 'react-native-wagmi-charts';
import { formatPrice } from 'src/utils/dataGenerator';
import icon from 'src/icon';

interface TradingChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  selectedTimeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  timeRanges?: TimeRange[];
}

const screenWidth = Dimensions.get('window').width;

export const TradingChart: React.FC<TradingChartProps> = ({
  data,
  width = screenWidth * 0.55 - 20,
  height = 350,
  selectedTimeRange,
  onTimeRangeChange,
  timeRanges = [],
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // For small datasets, use all data points to avoid gaps
    // Only sample for very large datasets
    let processedData = data;
    if (data.length > 500) {
      const step = Math.ceil(data.length / 300);
      processedData = data.filter((_, index) => index % step === 0);
      // Always include the last point
      if (processedData[processedData.length - 1] !== data[data.length - 1]) {
        processedData.push(data[data.length - 1]);
      }
    }

    return processedData.map((point) => ({
      timestamp: point.timestamp,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
    }));
  }, [data]);

  const currentPrice = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data[data.length - 1].close;
  }, [data]);

  const priceRange = useMemo(() => {
    if (!chartData || chartData.length === 0) return { min: 0, max: 0 };
    
    const allPrices = chartData.flatMap(d => [d.high, d.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.1; // 10% padding
    
    return {
      min: min - padding,
      max: max + padding
    };
  }, [chartData]);

  const gridLines = useMemo(() => {
    const lines = [];
    const numHorizontalLines = 10;
    const numVerticalLines = 7;
    
    // Horizontal lines (price levels)
    for (let i = 0; i <= numHorizontalLines; i++) {
      const price = priceRange.min + (priceRange.max - priceRange.min) * (i / numHorizontalLines);
      lines.push({
        type: 'horizontal',
        value: price,
        position: (i / numHorizontalLines) * 100
      });
    }
    
    // Vertical lines (time intervals)
    for (let i = 0; i <= numVerticalLines; i++) {
      lines.push({
        type: 'vertical',
        position: (i / numVerticalLines) * 100
      });
    }
    
    return lines;
  }, [priceRange, chartData]);

  const volumeData = useMemo(() => {
    // Use the same processed data as candlesticks for perfect alignment
    return chartData;
  }, [chartData]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No chart data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <View style={styles.chartWrapper}>
        {/* Grid Lines */}
        <View style={[styles.gridContainer, { width: width, height: height + 40 }]}>
          {gridLines.map((line, index) => (
            <View
              key={`grid-${line.type}-${index}`}
              style={[
                styles.gridLine,
                line.type === 'horizontal' ? {
                  top: `${100 - line.position}%`,
                  width: '100%',
                  height: 1,
                } : {
                  left: `${line.position}%`,
                  width: 1,
                  height: '100%',
                }
              ]}
            />
          ))}
        </View>

        {/* Price Labels on the Right */}
        <View style={[styles.priceLabelsRight, { height: height + 40 }]}>
          {gridLines
            .filter(line => line.type === 'horizontal')
            .map((line, index, arr) => (
              index === 0 ? null : (
                <Text
                  key={`price-${index}`}
                  style={[
                    styles.priceLabel,
                    { top: `${100 - line.position}%` }
                  ]}
                >
                  ${formatPrice(line.value ?? 0)}
                </Text>
              )
            ))}
        </View>

        <CandlestickChart.Provider data={chartData}>
          <CandlestickChart height={height} width={width}>
            <CandlestickChart.Candles 
              positiveColor="#12DD00"
              negativeColor="#FF3F3F"
            />
            <CandlestickChart.Crosshair>
              <CandlestickChart.Tooltip />
            </CandlestickChart.Crosshair>
          </CandlestickChart>
          
          {/* Current Price Indicator */}
          <View style={[styles.currentPriceContainer, { height: height }]}>
            {currentPrice > 0 && (
              <>
                <View 
                  style={[
                    styles.currentPriceLineContainer,
                    {
                      top: `${100 - ((currentPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                    }
                  ]}
                >
                  {Array.from({ length: 50 }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dashSegment,
                        {
                          left: `${index * 2}%`,
                          display: index % 2 === 0 ? 'flex' : 'none'
                        }
                      ]}
                    />
                  ))}
                </View>
                <View 
                  style={[
                    styles.currentPriceLabel,
                    {
                      top: `${100 - ((currentPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                    }
                  ]}
                >
                  <Text style={styles.currentPriceText}>
                    {formatPrice(currentPrice)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </CandlestickChart.Provider>

        {/* Volume bars */}
        <View style={styles.volumeSection}>
          <View style={[styles.volumeBars, { width: width }]}>
            {volumeData.map((point, index) => {
              const isGreen = point.close > point.open;
              const maxVolume = Math.max(...volumeData.map(d => d.volume));
              const barHeight = (point.volume / maxVolume) * 30;
              
              // Calculate exact width and positioning to match candlesticks
              const totalBarsWidth = width; // Match candlestick chart width
              const barWidth = Math.max(1, totalBarsWidth / volumeData.length * 0.8); // 80% of available space for bars
              const barSpacing = totalBarsWidth / volumeData.length * 0.2; // 20% for spacing
              
              return (
                <View
                  key={`${point.timestamp}-${index}`}
                  style={[
                    styles.volumeBar,
                    {
                      height: barHeight,
                      backgroundColor: isGreen ? 'rgba(18, 221, 0, 0.3)' : 'rgba(255, 63, 63, 0.3)',
                      width: barWidth,
                      marginRight: index < volumeData.length - 1 ? barSpacing : 0,
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Time range buttons */}
      {timeRanges.length > 0 && (
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                selectedTimeRange?.value === range.value && styles.activeTimeRange
              ]}
              onPress={() => onTimeRangeChange?.(range)}
            >
              <Text style={[
                styles.timeRangeText,
                selectedTimeRange?.value === range.value && styles.activeTimeRangeText
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Chart control buttons */}
      <View style={styles.chartControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>H1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Image source={icon.forward} style={styles.controlButtonIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Image source={icon.bolt} style={styles.controlButtonIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#13183C',
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    padding: 10,
    marginRight: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  chartWrapper: {
    marginLeft: -10,
  },
  volumeSection: {
    marginTop: 10,
  },
  volumeBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
  },
  volumeBar: {
    borderRadius: 1,
    minWidth: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#152652',
  },
  activeTimeRange: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: '#FFFFFF',
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15,
  },
  controlButton: {
    backgroundColor: '#0043F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  controlButtonIcon: {
    width: 12,
    height: 12,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  gridContainer: {
    position: 'absolute',
    zIndex: -1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#9CB8FF',
  },
  priceLabelsRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 55,
    height: '100%',
  },
  priceLabel: {
    fontSize: 9,
    color: 'white',
    position: 'absolute',
    transform: [{ translateY: -4.5 }],
  },
  currentPriceContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  currentPriceLineContainer: {
    position: 'absolute',
    width: '100%',
    height: 1,
    opacity: 0.8,
  },
  dashSegment: {
    position: 'absolute',
    width: '1.5%',
    height: 1,
    backgroundColor: '#00FFD1',
  },
  currentPriceLabel: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#12DD00',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    transform: [{ translateY: -6 }],
  },
  currentPriceText: {
    fontSize: 9,
    color: '#000000',
  },
});