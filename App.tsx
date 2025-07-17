import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TradingChart } from './src/components/TradingChart';
import { useTradingData } from './src/hooks/useTradingData';
import { formatPrice, formatAmount, formatPercentage, formatTimeAgo } from './src/utils/dataGenerator';
import { TimeRange, OrderBookItem, Trade, OrderData } from './src/types';
import icon from './src/icon';

export default function App(): JSX.Element {
  const {
    tradingData,
    chartData,
    orderBook,
    trades,
    orderTabData,
    selectedTimeRange,
    selectedCurrency,
    currencies,
    timeRanges,
    changeTimeRange,
    changeCurrency,
    isInitialized,
    isUpdating,
  } = useTradingData();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'Open' | 'Filled' | 'Cancelled'>('Open');

  // Get current orders based on active tab
  const getCurrentOrders = (): OrderData[] => {
    switch (activeTab) {
      case 'Open':
        return orderTabData.open;
      case 'Filled':
        return orderTabData.filled;
      case 'Cancelled':
        return orderTabData.cancelled;
      default:
        return [];
    }
  };

  const currentOrders = getCurrentOrders();
  const displayOrder = currentOrders.length > 0 ? currentOrders[0] : null;

  const renderOrderBookItem = ({ item, index }: { item: OrderBookItem; index: number }) => {
    return (
      <View style={styles.orderBookRow}>
        <Text style={[styles.orderBookPrice, { color: item.isBid ? '#12DD00' : '#FF3F3F' }]}>
          {formatPrice(item.price)}
        </Text>
        <Text style={styles.orderBookAmount}>{formatAmount(item.amount)}</Text>
      </View>
    );
  };

  const renderTradeItem = ({ item }: { item: Trade }) => (
    <View style={styles.tradeRow}>
      <Text style={[styles.tradePrice, { color: item.side === 'buy' ? '#12DD00' : '#FF3F3F' }]}>
        {formatPrice(item.price)}
      </Text>
      <Text style={styles.tradeAmount}>{formatAmount(item.amount)}</Text>
    </View>
  );

  const renderCurrencyPicker = () => (
    <Modal
      visible={showCurrencyPicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCurrencyPicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.currencyPicker}>
          {currencies.map((currency, index) => (
            <TouchableOpacity
              key={currency.pair}
              style={[
                styles.currencyOption,
                index === currencies.length - 1 && styles.currencyOptionLast
              ]}
              onPress={() => {
                changeCurrency(currency);
                setShowCurrencyPicker(false);
              }}
            >
              <Text style={styles.currencyOptionText}>{currency.symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F0F23" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <Image source={icon.menu} style={styles.menuIcon} resizeMode="contain" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Trading Details</Text>
          
          <TouchableOpacity style={styles.shareButton}>
            <Image source={icon.notification} style={styles.shareIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceLeftSection}>
              <View style={styles.highLowContainer}>
                <View style={styles.highLowItem}>
                  <Text style={[styles.highLowLabel, { color: '#19FF05' }]}>High</Text>
                  <Text style={[styles.highLowValue]}>
                    {formatPrice(tradingData.high)}
                  </Text>
                </View>
                <View style={styles.highLowItem}>
                  <Text style={[styles.highLowLabel, { color: '#FF3F3F' }]}>Low</Text>
                  <Text style={[styles.highLowValue]}>
                    {formatPrice(tradingData.low)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.volumeContainer}>
                <View style={styles.volumeItem}>
                  <Text style={styles.volumeLabel}>Vol (BTC)</Text>
                  <Text style={styles.volumeValue}>{formatPrice(tradingData.volume)}</Text>
                </View>
                <View style={styles.volumeItem}>
                  <Text style={styles.volumeLabel}>Vol (ETH)</Text>
                  <Text style={styles.volumeValue}>{formatPrice(tradingData.volumeETH)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.priceRightSection}>
              <View>
                <Text style={styles.mainPrice}>
                  ${formatPrice(tradingData.price)}
                </Text>
                <Text style={[styles.priceChange, { color: tradingData.changePercent >= 0 ? '#00FFD1' : '#FF3F3F' }]}>
                  ({formatPercentage(tradingData.changePercent)})
                </Text>
              </View>
              
              {/* Currency Selector */}
              <View style={styles.currencySection}>
                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                >
                  <Text style={styles.currencyText}>{selectedCurrency.symbol}</Text>
                  <Text style={styles.currencyArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.chartSection}>
            <View style={styles.chartLeftSection}>
              {!isInitialized ? (
                <View style={[styles.chartLoadingContainer, { height: 400 }]}>
                  <Text style={styles.chartLoadingText}>Loading 7D data...</Text>
                </View>
              ) : isUpdating ? (
                <View style={[styles.chartLoadingContainer, { height: 400 }]}>
                  <Text style={styles.chartLoadingText}>
                    {selectedTimeRange.label === '7D' ? 'Updating chart...' : `Loading ${selectedTimeRange.label} data...`}
                  </Text>
                </View>
              ) : (
                <TradingChart 
                  data={chartData} 
                  selectedTimeRange={selectedTimeRange}
                  onTimeRangeChange={changeTimeRange}
                  timeRanges={timeRanges}
                />
              )}
              
              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                {['Open', 'Filled', 'Cancelled'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tab,
                      activeTab === tab && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab(tab as 'Open' | 'Filled' | 'Cancelled')}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {tab}
                    </Text>
                    {activeTab === tab && <View style={styles.tabIndicator} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Order Details */}
              {displayOrder && (
                <View style={styles.orderDetails}>
                  <View style={styles.orderRow}>
                    <View style={styles.orderStatusRow} >
                      <View style={[
                        styles.orderStatusDot,
                      ]} />
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={[
                        styles.orderType,
                        { color: displayOrder.type === 'Buy' ? '#12DD00' : '#FF3F3F' }
                      ]}>
                        {displayOrder.type}
                      </Text>
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={styles.orderPair}>{displayOrder.pair}</Text>
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={styles.orderTime}>{formatTimeAgo(displayOrder.timestamp)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderRow}>
                    <View style={styles.orderStatusRow} />
                    <View style={styles.orderColumn}>
                      <Text style={styles.orderLabelText}>Price</Text>
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={styles.orderLabelText}>Amount</Text>
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={[styles.orderLabelText, {textAlign: 'center'}]}>Executed</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderRow}>
                    <View style={styles.orderStatusRow} />
                    <View style={styles.orderColumn}>
                      <Text style={styles.orderDataText}>{displayOrder.price}</Text>
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={styles.orderDataText}>{displayOrder.amount}</Text>
                    </View>
                    <View style={styles.orderColumn}>
                      <Text style={[styles.orderDataText, {textAlign: 'center'}]}>{displayOrder.executed}</Text>
                    </View>
                  </View>
                </View>
              )}

            </View>
            <View style={styles.chartRightSection}>
              <View style={styles.orderBookSection}>
                <Text style={styles.sectionTitle}>Order book</Text>
                <FlatList
                  data={orderBook.slice(0, 12)}
                  renderItem={renderOrderBookItem}
                  keyExtractor={(item, index) => `orderbook-${index}`}
                  scrollEnabled={false}
                />
              </View>
              <View style={styles.tradesSection}>
                <Text style={styles.sectionTitle}>Trades</Text>
                <FlatList
                  data={trades.slice(0, 12)}
                  renderItem={renderTradeItem}
                  keyExtractor={(item, index) => `trade-${index}`}
                  scrollEnabled={false}
                />
              </View>
            </View>
          </View>

          {/* Bottom Section */}
        </ScrollView>
        
        {/* Currency Picker Modal */}
        {renderCurrencyPicker()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01041F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#01041F',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  priceLeftSection: {
    flex: 0.5,
    backgroundColor: '#191F3F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#001B7C',
    paddingVertical: 10,
  },
  priceRightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.5,
    zIndex: 999,
  },
  highLowContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    paddingBottom: 10,
    paddingHorizontal: 5,
  },
  highLowItem: {
    flex: 1,
  },
  highLowLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  highLowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  volumeItem: {
    flex: 1,
  },
  volumeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 6,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mainPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    color: '#00FFD1',
  },
  currencySection: {
    position: 'relative',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 200,
    paddingRight: 16,
  },
  currencySelector: {
    backgroundColor: '#13183C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
  },
  currencyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  currencyArrow: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
  },
  currencyPicker: {
    backgroundColor: '#13183C',
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  currencyOptionLast: {
    borderBottomWidth: 0,
  },
  currencyOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  chartSection: {
    flexDirection: 'row',
    marginTop: 16,
  },
  chartLeftSection: {
    flex: 0.7,
  },
  chartRightSection: {
    flex: 0.3,
    gap: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1A1A2E',
    minWidth: 40,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeButtonText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
  },
  orderBookSection: {
    flex: 1,
  },
  tradesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  orderBookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingRight: 5,
  },
  orderBookPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderBookAmount: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingRight: 5,
  },
  tradePrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  tradeAmount: {
    fontSize: 12,
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
  },
  tab: {
    paddingVertical: 8,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0043F0',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -4 }],
    width: 8,
    height: 8,
    backgroundColor: '#0043F0',
    borderRadius: 4,
  },
  orderDetails: {
    marginTop: 20,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#13183C',
    borderRadius: 8,
    gap: 5,
  },
  orderRow: {
    flexDirection: 'row',
  },
  orderColumn: {
    flex: 0.31,
    justifyContent: 'center',
  },
  orderStatusRow: {
    flex: 0.07,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderStatusDot: {
    width: 13,
    height: 13,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'white',
    marginRight: 6,
  },
  orderType: {
    fontSize: 14,
    color: '#12DD00',
    fontWeight: '400',
  },
  orderPair: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderTime: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  orderLabelText: {
    fontSize: 10,
    color: '#CDCDCD',
  },
  orderDataText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  chartLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#001B7C',
  },
  chartLoadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
});
