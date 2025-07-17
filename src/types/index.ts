export interface TradingData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  volumeETH: number;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookItem {
  price: number;
  amount: number;
  isBid: boolean;
  total?: number;
}

export interface Trade {
  price: number;
  amount: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export interface Currency {
  symbol: string;
  name: string;
  pair: string;
}

export interface CandlestickData {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OrderBookData {
  price: string;
  amount: string;
  side: 'buy' | 'sell';
}

export interface TradeData {
  price: string;
  amount: string;
  time: string;
  side: 'buy' | 'sell';
}

export interface OrderData {
  id: string;
  type: 'Buy' | 'Sell';
  pair: string;
  price: string;
  amount: string;
  executed: string;
  timestamp: number;
  status: 'open' | 'filled' | 'cancelled';
}

export interface OrderTabData {
  open: OrderData[];
  filled: OrderData[];
  cancelled: OrderData[];
} 