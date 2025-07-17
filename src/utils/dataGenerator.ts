import { ChartDataPoint, OrderBookItem, Trade, TimeRange, Currency, OrderData, OrderTabData } from '../types';

export const TIME_RANGES: TimeRange[] = [
  { label: '7D', value: '7D', days: 7 },
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: '5Y', value: '5Y', days: 1825 },
  { label: 'Max', value: 'Max', days: 3650 },
];

// Currency base prices and configurations
export const CURRENCY_CONFIG: { [key: string]: { basePrice: number; symbol: string; name: string } } = {
  'USDBTC': { basePrice: 66360.55, symbol: 'USD/BTC', name: 'Bitcoin' },
  'USDETH': { basePrice: 3245.67, symbol: 'USD/ETH', name: 'Ethereum' },
  'USDADA': { basePrice: 0.45, symbol: 'USD/ADA', name: 'Cardano' },
  'USDSOL': { basePrice: 145.23, symbol: 'USD/SOL', name: 'Solana' },
};

// Cache for storing generated data points by currency and time range
export const DATA_CACHE: { [key: string]: { [timeRange: string]: ChartDataPoint[] } } = {};

// Track the maximum time range generated for each currency
export const MAX_GENERATED_RANGE: { [key: string]: number } = {};

// Store the complete historical data for each currency (all time ranges combined)
export const COMPLETE_DATA_CACHE: { [key: string]: ChartDataPoint[] } = {};

// Initialize 7D data for each currency pair
export const initializeHistoricalData = () => {
  
  Object.entries(CURRENCY_CONFIG).forEach(([pair, config]) => {
    // Initialize cache for this currency pair
    DATA_CACHE[pair] = {};
    
    // Generate 7D data starting from base price
    const sevenDaysData = generateDataForTimeRange(pair, 7, config.basePrice);
    DATA_CACHE[pair]['7D'] = sevenDaysData;
    
    // Store in complete cache as well
    COMPLETE_DATA_CACHE[pair] = [...sevenDaysData];
    
    MAX_GENERATED_RANGE[pair] = 7;
  });
};

// Generate data points for a specific time range
const generateDataForTimeRange = (pair: string, days: number, startPrice: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const timeRangeMs = days * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const startTime = now - timeRangeMs;
  
  // Start with 10 data points for 7D
  const totalPoints = 20;
  const intervalMs = timeRangeMs / totalPoints;
  
  let currentPrice = startPrice;
  
  for (let i = 0; i < totalPoints; i++) {
    const timestamp = startTime + (i * intervalMs);
    const volatility = 0.015; // 1.5% volatility
    const change = (Math.random() - 0.5) * 2 * volatility;
    
    const open = currentPrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = Math.random() * 2000 + 500;
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
    
    currentPrice = close;
  }
  
  return data;
};

// Generate additional historical data points when expanding time range
const generateAdditionalHistoricalData = (pair: string, fromDays: number, toDays: number, endPrice: number): ChartDataPoint[] => {
  const additionalData: ChartDataPoint[] = [];
  const additionalTimeMs = (toDays - fromDays) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const startTime = now - (toDays * 24 * 60 * 60 * 1000);
  const endTime = now - (fromDays * 24 * 60 * 60 * 1000);
  
  // Add exactly 20 points for each time range expansion
  const additionalPoints = 20;
  const intervalMs = additionalTimeMs / additionalPoints;
  
  // Start from a price that will naturally lead to the endPrice
  // Work backwards from endPrice to create realistic historical progression
  let currentPrice = endPrice;
  
  // Generate data points in reverse order (from most recent to oldest)
  const tempData: ChartDataPoint[] = [];
  for (let i = additionalPoints - 1; i >= 0; i--) {
    const timestamp = startTime + (i * intervalMs);
    
    // Skip if this timestamp overlaps with existing data
    if (timestamp >= endTime) continue;
    
    const volatility = 0.015;
    const change = (Math.random() - 0.5) * 2 * volatility;
    
    const close = currentPrice;
    const open = close / (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = Math.random() * 2000 + 500;
    
    tempData.unshift({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
    
    currentPrice = open;
  }
  
  return tempData;
};

// Get or generate data for a specific time range
export const getChartDataForTimeRange = (pair: string, timeRange: TimeRange): ChartDataPoint[] => {
  const cacheKey = timeRange.value;
  
  // Check if we already have cached data for this time range
  if (DATA_CACHE[pair] && DATA_CACHE[pair][cacheKey]) {
    return DATA_CACHE[pair][cacheKey];
  }
  
  // Initialize cache if it doesn't exist
  if (!DATA_CACHE[pair]) {
    DATA_CACHE[pair] = {};
    COMPLETE_DATA_CACHE[pair] = [];
  }
  
  const currentMaxRange = MAX_GENERATED_RANGE[pair] || 7;
  
  // If requesting a time range we haven't generated yet, we need to expand
  if (timeRange.days > currentMaxRange) {
    // Get the earliest data point from existing complete data to connect properly
    const existingData = COMPLETE_DATA_CACHE[pair] || [];
    const earliestDataPoint = existingData.length > 0 ? existingData[0] : null;
    const connectPrice = earliestDataPoint ? earliestDataPoint.open : CURRENCY_CONFIG[pair].basePrice;
    
    // Generate additional historical data points
    const additionalData = generateAdditionalHistoricalData(pair, currentMaxRange, timeRange.days, connectPrice);
    
    // Combine additional data with existing data (additional first, then existing)
    const combinedData = [...additionalData, ...existingData].sort((a, b) => a.timestamp - b.timestamp);
    
    // Update complete cache
    COMPLETE_DATA_CACHE[pair] = combinedData;
    
    // Cache the new data for this specific time range
    DATA_CACHE[pair][cacheKey] = combinedData;
    MAX_GENERATED_RANGE[pair] = timeRange.days;
    
    return combinedData;
  } else {
    // Filter existing complete data for the requested time range
    const completeData = COMPLETE_DATA_CACHE[pair] || [];
    const now = Date.now();
    const rangeStart = now - (timeRange.days * 24 * 60 * 60 * 1000);
    
    const filteredData = completeData
      .filter(point => point.timestamp >= rangeStart)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Cache the filtered data
    DATA_CACHE[pair][cacheKey] = filteredData;
    
    return filteredData;
  }
};

// Add new real-time data point with 1% volatility
export const addNewDataPoint = (pair: string): ChartDataPoint | null => {
  const completeData = COMPLETE_DATA_CACHE[pair] || [];
  if (completeData.length === 0) return null;
  
  const lastDataPoint = completeData[completeData.length - 1];
  const now = Date.now();
  const volatility = 0.01; // 1% volatility for real-time updates
  const change = (Math.random() - 0.5) * 2 * volatility;
  
  const open = lastDataPoint.close;
  const close = open * (1 + change);
  const high = Math.max(open, close) * (1 + Math.random() * 0.005);
  const low = Math.min(open, close) * (1 - Math.random() * 0.005);
  const volume = Math.random() * 1000 + 500;
  
  const newDataPoint: ChartDataPoint = {
    timestamp: now,
    open,
    high,
    low,
    close,
    volume,
  };
  
  // Add to complete data cache
  COMPLETE_DATA_CACHE[pair].push(newDataPoint);
  
  // Update all cached ranges for this currency
  Object.keys(DATA_CACHE[pair] || {}).forEach(rangeKey => {
    const range = TIME_RANGES.find(r => r.value === rangeKey);
    if (range) {
      const cutoffTime = now - (range.days * 24 * 60 * 60 * 1000);
      DATA_CACHE[pair][rangeKey] = COMPLETE_DATA_CACHE[pair].filter(point => point.timestamp >= cutoffTime);
    }
  });
  
  return newDataPoint;
};

// Get current price for a currency pair
export const getCurrentPrice = (pair: string): number => {
  const completeData = COMPLETE_DATA_CACHE[pair] || [];
  if (completeData.length === 0) {
    const config = CURRENCY_CONFIG[pair];
    return config ? config.basePrice : 0;
  }
  return completeData[completeData.length - 1].close;
};

// Get price statistics for a currency pair
export const getPriceStats = (pair: string, timeRange: TimeRange) => {
  const data = getChartDataForTimeRange(pair, timeRange);
  if (data.length === 0) return { high: 0, low: 0, volume: 0 };
  
  const high = Math.max(...data.map(d => d.high));
  const low = Math.min(...data.map(d => d.low));
  const volume = data.reduce((sum, d) => sum + d.volume, 0);
  
  return { high, low, volume };
};

// Clear cache for a specific currency pair (useful for testing)
export const clearCacheForPair = (pair: string) => {
  delete DATA_CACHE[pair];
  delete COMPLETE_DATA_CACHE[pair];
  delete MAX_GENERATED_RANGE[pair];
};

// Clear all cache (useful for testing)
export const clearAllCache = () => {
  Object.keys(DATA_CACHE).forEach(pair => {
    delete DATA_CACHE[pair];
  });
  Object.keys(COMPLETE_DATA_CACHE).forEach(pair => {
    delete COMPLETE_DATA_CACHE[pair];
  });
  Object.keys(MAX_GENERATED_RANGE).forEach(pair => {
    delete MAX_GENERATED_RANGE[pair];
  });
};

export const generateOrderBookData = (basePrice: number): OrderBookItem[] => {
  const orderBook: OrderBookItem[] = [];
  
  // Generate random order book entries with balanced bids and asks
  for (let i = 0; i < 12; i++) {
    // Randomly determine if this is a bid (buy) or ask (sell)
    const isBid = Math.random() > 0.5;
    
    // Price variation based on whether it's a bid or ask
    let priceVariation;
    if (isBid) {
      // Bids are typically below market price
      priceVariation = -Math.random() * 0.002; // 0% to -0.2%
    } else {
      // Asks are typically above market price
      priceVariation = Math.random() * 0.002; // 0% to +0.2%
    }
    
    const price = basePrice * (1 + priceVariation);
    const amount = Math.random() * 0.1 + 0.001;
    orderBook.push({ price, amount, isBid });
  }
  
  // Sort by price: bids descending, asks ascending
  return orderBook.sort((a, b) => {
    if (a.isBid && b.isBid) return b.price - a.price; // Bids: highest first
    if (!a.isBid && !b.isBid) return a.price - b.price; // Asks: lowest first
    return a.isBid ? -1 : 1; // Bids before asks
  });
};

export const generateTradesData = (basePrice: number): Trade[] => {
  const trades: Trade[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 20; i++) {
    const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.002);
    const amount = Math.random() * 0.1 + 0.001;
    const timestamp = now - i * 60000; // 1 minute intervals
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    
    trades.push({
      price,
      amount,
      timestamp,
      side,
    });
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

export const formatPrice = (price: number): string => {
  if (price < 1) {
    return price.toFixed(4);
  } else if (price < 100) {
    return price.toFixed(2);
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

export const formatAmount = (amount: number): string => {
  return amount.toFixed(3);
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toFixed(0);
}; 

export const generateOrderTabData = (basePrice: number): OrderTabData => {
  const now = Date.now();
  
  // Generate Open Orders
  const openOrders: OrderData[] = [
    {
      id: '1',
      type: 'Buy',
      pair: 'BTC/ETH',
      price: '0.001230BTC',
      amount: '0.001230ETH',
      executed: '0.000ETH',
      timestamp: now - 60000, // 1 min ago
      status: 'open'
    },
  ];

  // Generate Filled Orders
  const filledOrders: OrderData[] = [
    {
      id: '4',
      type: 'Buy',
      pair: 'BTC/ETH',
      price: '0.001220BTC',
      amount: '0.001220ETH',
      executed: '0.001220ETH',
      timestamp: now - 300000, // 5 mins ago
      status: 'filled'
    },
  ];

  // Generate Cancelled Orders
  const cancelledOrders: OrderData[] = [
    {
      id: '8',
      type: 'Buy',
      pair: 'BTC/ETH',
      price: '0.001200BTC',
      amount: '0.005000ETH',
      executed: '0.000ETH',
      timestamp: now - 86400000, // 1 day ago
      status: 'cancelled'
    },
  ];

  return {
    open: openOrders,
    filled: filledOrders,
    cancelled: cancelledOrders
  };
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) {
    return `Placed ${minutes}min${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `Placed ${hours}hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `Placed ${days}day${days !== 1 ? 's' : ''} ago`;
  }
}; 