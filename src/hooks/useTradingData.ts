import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TradingData, 
  ChartDataPoint, 
  OrderBookItem, 
  Trade, 
  TimeRange, 
  Currency,
  OrderTabData
} from '../types';
import { 
  initializeHistoricalData,
  addNewDataPoint,
  getChartDataForTimeRange,
  getCurrentPrice,
  getPriceStats,
  generateOrderBookData, 
  generateTradesData,
  generateOrderTabData,
  TIME_RANGES,
  CURRENCY_CONFIG
} from '../utils/dataGenerator';

export const useTradingData = () => {
  const [tradingData, setTradingData] = useState<TradingData>({
    symbol: 'USD/BTC',
    price: 66360.55,
    change: 0,
    changePercent: 0,
    high: 66360.55,
    low: 66360.55,
    volume: 0,
    volumeETH: 0,
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookItem[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orderTabData, setOrderTabData] = useState<OrderTabData>({
    open: [],
    filled: [],
    cancelled: []
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(TIME_RANGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    symbol: 'USD/BTC',
    name: 'Bitcoin',
    pair: 'USDBTC',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRealTimeUpdate, setIsRealTimeUpdate] = useState(false);

  const currencies: Currency[] = useMemo(() => [
    { symbol: 'USD/BTC', name: 'Bitcoin', pair: 'USDBTC' },
    { symbol: 'USD/ETH', name: 'Ethereum', pair: 'USDETH' },
    { symbol: 'USD/ADA', name: 'Cardano', pair: 'USDADA' },
    { symbol: 'USD/SOL', name: 'Solana', pair: 'USDSOL' },
  ], []);

  const updateChartData = useCallback((timeRange: TimeRange, currencyPair: string) => {
    if (isUpdating) return; // Prevent concurrent updates
    
    setIsUpdating(true);
    try {
      const newData = getChartDataForTimeRange(currencyPair, timeRange);
      setChartData(newData);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating]);

  const updateTradingData = useCallback((currencyPair: string, timeRange: TimeRange) => {
    const currentPrice = getCurrentPrice(currencyPair);
    const stats = getPriceStats(currencyPair, timeRange);
    const config = CURRENCY_CONFIG[currencyPair];
    
    if (!config) return;

    setTradingData(prev => {
      // Calculate change based on actual generated data
      const chartData = getChartDataForTimeRange(currencyPair, timeRange);
      let change = 0;
      let changePercent = 0;
      
      if (chartData.length > 1) {
        // Compare last price with second last price in the time range
        const secondLastPrice = chartData[chartData.length - 2].close;
        const lastPrice = chartData[chartData.length - 1].close;
        change = lastPrice - secondLastPrice;
        changePercent = secondLastPrice > 0 ? (change / secondLastPrice) * 100 : 0;
      }

      return {
        ...prev,
        symbol: config.symbol,
        price: currentPrice,
        change,
        changePercent,
        high: stats.high,
        low: stats.low,
        volume: stats.volume,
        volumeETH: stats.volume * 0.7, // Mock ETH volume
      };
    });
  }, []);

  const updateOrderBook = useCallback((currencyPair: string) => {
    const currentPrice = getCurrentPrice(currencyPair);
    const newOrderBook = generateOrderBookData(currentPrice);
    setOrderBook(newOrderBook);
  }, []);

  const updateTrades = useCallback((currencyPair: string) => {
    const currentPrice = getCurrentPrice(currencyPair);
    const newTrades = generateTradesData(currentPrice);
    setTrades(newTrades);
  }, []);

  const updateOrderTabData = useCallback((currencyPair: string) => {
    const currentPrice = getCurrentPrice(currencyPair);
    const newOrderTabData = generateOrderTabData(currentPrice);
    setOrderTabData(newOrderTabData);
  }, []);

  const addRealTimeData = useCallback(() => {
    if (!isInitialized || isUpdating) return;
    
    setIsRealTimeUpdate(true);
    
    // Get the previous price before adding new data point
    const previousPrice = getCurrentPrice(selectedCurrency.pair);
    
    // Add new data point with 1% volatility
    const newDataPoint = addNewDataPoint(selectedCurrency.pair);
    if (newDataPoint) {
      // Calculate change percentage based on previous price
      const currentPrice = newDataPoint.close;
      const change = currentPrice - previousPrice;

      const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
      
      // Update trading data with calculated change
      const stats = getPriceStats(selectedCurrency.pair, selectedTimeRange);
      const config = CURRENCY_CONFIG[selectedCurrency.pair];
      
      if (config) {
        setTradingData(prev => ({
          ...prev,
          symbol: config.symbol,
          price: currentPrice,
          change,
          changePercent,
          high: stats.high,
          low: stats.low,
          volume: stats.volume,
          volumeETH: stats.volume * 0.7, // Mock ETH volume
        }));
      }
      
      // Update chart data for current time range
      updateChartData(selectedTimeRange, selectedCurrency.pair);
      // Update order book and trades
      updateOrderBook(selectedCurrency.pair);
      updateTrades(selectedCurrency.pair);
      updateOrderTabData(selectedCurrency.pair);
    }
    
    setIsRealTimeUpdate(false);
  }, [isInitialized, isUpdating, selectedCurrency.pair, selectedTimeRange, updateChartData, updateOrderBook, updateTrades, updateOrderTabData, getPriceStats, CURRENCY_CONFIG]);

  const changeCurrency = useCallback((currency: Currency) => {
    if (isUpdating) return;
    
    setSelectedCurrency(currency);
    if (isInitialized) {
      updateChartData(selectedTimeRange, currency.pair);
      updateTradingData(currency.pair, selectedTimeRange);
      updateOrderBook(currency.pair);
      updateTrades(currency.pair);
      updateOrderTabData(currency.pair);
    }
  }, [isInitialized, isUpdating, selectedTimeRange, updateChartData, updateTradingData, updateOrderBook, updateTrades, updateOrderTabData]);

  const changeTimeRange = useCallback((timeRange: TimeRange) => {
    if (isUpdating) return;
    
    setSelectedTimeRange(timeRange);
    if (isInitialized) {
      updateChartData(timeRange, selectedCurrency.pair);
      updateTradingData(selectedCurrency.pair, timeRange);
    }
  }, [isInitialized, isUpdating, selectedCurrency.pair, updateChartData, updateTradingData]);

  // Initialize 7D data on first load
  useEffect(() => {
    if (!isInitialized) {
      initializeHistoricalData();
      setIsInitialized(true);
      // Initial trading data update
      setTimeout(() => {
        updateTradingData(selectedCurrency.pair, selectedTimeRange);
      }, 100);
    }
  }, [isInitialized, selectedCurrency.pair, selectedTimeRange, updateTradingData]);

  // Update data when initialized (only for initial load)
  useEffect(() => {
    if (isInitialized && !isUpdating && !isRealTimeUpdate) {
      updateChartData(selectedTimeRange, selectedCurrency.pair);
      updateOrderBook(selectedCurrency.pair);
      updateTrades(selectedCurrency.pair);
      updateOrderTabData(selectedCurrency.pair);
    }
  }, [isInitialized, isUpdating, isRealTimeUpdate, selectedCurrency.pair, selectedTimeRange, updateChartData, updateOrderBook, updateTrades, updateOrderTabData]);

  // Real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      addRealTimeData();
    }, 5000);

    return () => clearInterval(interval);
  }, [addRealTimeData]);

  return {
    tradingData,
    chartData,
    orderBook,
    trades,
    orderTabData,
    selectedTimeRange,
    selectedCurrency,
    currencies,
    timeRanges: TIME_RANGES,
    changeTimeRange,
    changeCurrency,
    isInitialized,
    isUpdating,
  };
}; 