# Trading Chart App

A professional React Native trading application featuring real-time candlestick charts, order management, and comprehensive market data visualization.

## Features

### 📈 Advanced Trading Charts
- **Candlestick Charts**: Interactive OHLC (Open, High, Low, Close) visualization
- **Real-time Updates**: Live price updates every 5 seconds with 1% volatility
- **Multiple Time Ranges**: 7D, 1M, 3M, 1Y, 5Y, and Max views
- **Volume Indicators**: Volume bars aligned with candlesticks
- **Grid System**: Professional grid lines with price labels
- **Current Price Line**: Dashed horizontal line showing current market price

### 💰 Multi-Currency Support
- **Bitcoin (BTC)**: Primary trading pair USD/BTC
- **Ethereum (ETH)**: USD/ETH trading pair
- **Cardano (ADA)**: USD/ADA trading pair
- **Solana (SOL)**: USD/SOL trading pair
- **Dynamic Switching**: Seamless currency pair switching with modal picker

### 📊 Market Data
- **Real-time Pricing**: Live price updates with percentage changes
- **High/Low Indicators**: 24-hour price range display
- **Volume Tracking**: BTC and ETH volume metrics
- **Order Book**: Live bid/ask spread with 12 order levels
- **Recent Trades**: Latest 12 trades with buy/sell indicators

### 🎯 Order Management
- **Order Tabs**: Three-tab navigation (Open, Filled, Cancelled)
- **Order Details**: Comprehensive order information display
- **Status Indicators**: Visual order status with color coding
- **Time Tracking**: Relative time stamps for order placement
- **Execution Data**: Price, amount, and execution status

### 🎨 Professional UI/UX
- **Dark Theme**: Modern dark blue color scheme
- **Responsive Layout**: Optimized for mobile trading
- **Smooth Animations**: Fluid transitions and interactions
- **Icon Integration**: Custom icons for enhanced visual appeal
- **Loading States**: Proper loading indicators for data fetching

## Technical Architecture

### Data Generation System
- **Incremental Loading**: Efficient data loading starting with 7D, expanding as needed
- **Caching System**: Multi-level caching for optimal performance
- **Real-time Updates**: Continuous data point generation with proper volatility
- **Data Continuity**: Seamless data connection between time ranges

### Chart Implementation
- **react-native-wagmi-charts**: Professional candlestick chart library
- **Custom Grid System**: Hand-built grid lines and price labels
- **Volume Visualization**: Aligned volume bars with candlestick data
- **Performance Optimized**: Efficient rendering for smooth scrolling

### State Management
- **Custom Hooks**: Centralized trading data management
- **Real-time Updates**: Separate real-time calculation system
- **Currency Switching**: Isolated currency state management
- **Order Management**: Comprehensive order state tracking

## Project Structure

```
chart/
├── src/
│   ├── components/
│   │   └── TradingChart.tsx      # Main chart component
│   ├── hooks/
│   │   └── useTradingData.ts     # Trading data management
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── utils/
│   │   └── dataGenerator.ts      # Data generation utilities
│   └── icon/                     # Custom icon assets
├── android/                      # Android platform files
├── ios/                          # iOS platform files
├── assets/                       # App assets
└── App.tsx                       # Main application component
```

## Data Flow

1. **Initialization**: App loads with 7D data for all currency pairs
2. **Real-time Updates**: New data points added every 5 seconds
3. **Time Range Expansion**: Additional historical data generated on demand
4. **Currency Switching**: Instant switching between trading pairs
5. **Order Management**: Dynamic order data based on current market conditions

## Performance Optimizations

- **Efficient Caching**: Multi-level data caching system
- **Incremental Loading**: Load only necessary data points
- **Optimized Rendering**: Smooth chart performance with large datasets
- **Memory Management**: Proper cleanup and garbage collection
- **Background Updates**: Non-blocking real-time data updates

## Running the App Locally

### Prerequisites
- Node.js (v14 or higher)
- React Native development environment
- iOS Simulator (for iOS development)
- Android Emulator (for Android development)

### Installation

1. **Install Dependencies**: Run the following command to install all the necessary libraries:
   ```bash
   yarn install
   ```

2. **iOS**: To run the app on the iOS simulator, execute:
   ```bash
   yarn ios
   ```

3. **Android**: To run the app on the Android emulator, use:
   ```bash
   yarn android
   ```

### Development Commands

```bash
# Start Metro bundler
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## Configuration

### Currency Configuration
Modify `src/utils/dataGenerator.ts` to add new currency pairs:

```typescript
export const CURRENCY_CONFIG = {
  'USDBTC': { basePrice: 66360.55, symbol: 'USD/BTC', name: 'Bitcoin' },
  'USDETH': { basePrice: 3245.67, symbol: 'USD/ETH', name: 'Ethereum' },
  // Add new currencies here
};
```

### Time Range Configuration
Adjust time ranges in `src/utils/dataGenerator.ts`:

```typescript
export const TIME_RANGES = [
  { label: '7D', value: '7D', days: 7 },
  { label: '1M', value: '1M', days: 30 },
  // Modify or add time ranges
];
```

## Key Features Implementation

### Real-time Price Updates
- Updates every 5 seconds with 1% volatility
- Proper percentage calculation based on previous price
- Smooth animation transitions

### Order Book Simulation
- Realistic bid/ask spread generation
- Dynamic price distribution around market price
- Color-coded buy/sell indicators

### Chart Interactions
- Smooth scrolling and zooming
- Time range switching with data continuity
- Professional grid system with price labels

## Dependencies

### Core Dependencies
- **React Native**: Mobile app framework
- **react-native-wagmi-charts**: Chart visualization
- **react-native-gesture-handler**: Touch interactions
- **react-native-reanimated**: Smooth animations

### Development Dependencies
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Metro**: React Native bundler

