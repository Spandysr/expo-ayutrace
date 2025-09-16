
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBlockchain } from '../../hooks/useBlockchain';

export default function HistoryScreen() {
  const router = useRouter();
  const { getRecentBatches, isLoading } = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = () => {
    // Simulate scan history from recent batches
    const recentBatches = getRecentBatches(10);
    const simulatedHistory = recentBatches.map((batch, index) => ({
      id: batch.data.batchNumber,
      productName: batch.data.productType,
      scanDate: new Date(batch.timestamp + (index * 24 * 60 * 60 * 1000)).toLocaleDateString(),
      status: Math.random() > 0.2 ? 'Verified' : 'Processing',
      origin: batch.data.location 
        ? `${batch.data.location.latitude.toFixed(2)}, ${batch.data.location.longitude.toFixed(2)}`
        : 'Kerala, India',
      hash: batch.hash,
      timestamp: batch.timestamp
    }));
    setScanHistory(simulatedHistory);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadScanHistory();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return { bg: '#E8F5E8', text: '#4CAF50' };
      case 'Processing': return { bg: '#FFF3E0', text: '#FF9800' };
      default: return { bg: '#FFEBEE', text: '#F44336' };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading scan history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{scanHistory.length}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {scanHistory.filter(item => item.status === 'Verified').length}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>

        {scanHistory.map((item) => {
          const statusColor = getStatusColor(item.status);
          return (
            <TouchableOpacity key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{item.productName}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: statusColor.bg }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: statusColor.text }
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.batchId}>Batch ID: {item.id}</Text>
              <Text style={styles.scanDate}>Scanned: {item.scanDate}</Text>
              <Text style={styles.origin}>Origin: {item.origin}</Text>
              
              <View style={styles.blockchainInfo}>
                <Text style={styles.hashLabel}>🔗 Blockchain Hash:</Text>
                <Text style={styles.hashValue}>{item.hash.substring(0, 32)}...</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.viewButton} 
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        
        {scanHistory.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="scan-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No scan history yet</Text>
            <Text style={styles.emptyMessage}>
              Start scanning QR codes to track your Ayurvedic products
            </Text>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  batchId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scanDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  origin: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  blockchainInfo: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  hashLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  hashValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
