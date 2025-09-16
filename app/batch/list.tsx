
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlockchain } from '../../hooks/useBlockchain';

export default function BatchListScreen() {
  const router = useRouter();
  const { blockchain, isLoading, getLatestPrivateKey } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { key: 'all', label: 'All Batches' },
    { key: 'recent', label: 'Recent' },
    { key: 'ashwagandha', label: 'Ashwagandha' },
    { key: 'turmeric', label: 'Turmeric' }
  ];

  const filteredBatches = blockchain.filter(batch => {
    const matchesSearch = batch.data.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         batch.data.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case 'recent':
        return Date.now() - batch.timestamp < (7 * 24 * 60 * 60 * 1000); // Last 7 days
      case 'ashwagandha':
        return batch.data.productType.toLowerCase().includes('ashwagandha');
      case 'turmeric':
        return batch.data.productType.toLowerCase().includes('turmeric');
      default:
        return true;
    }
  }).sort((a, b) => b.timestamp - a.timestamp);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusFromTimestamp = (timestamp: number) => {
    const daysSinceCreation = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) return 'New';
    if (daysSinceCreation < 7) return 'Active';
    return 'Processed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return { bg: '#E8F5E8', text: '#4CAF50' };
      case 'Active': return { bg: '#E3F2FD', text: '#2196F3' };
      case 'Processed': return { bg: '#FFF3E0', text: '#FF9800' };
      default: return { bg: '#F5F5F5', text: '#666' };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading batches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>My Batches</Text>
        <TouchableOpacity 
          onPress={() => router.push('/batch/new')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search batches..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{blockchain.length}</Text>
            <Text style={styles.statLabel}>Total Batches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {blockchain.filter(b => Date.now() - b.timestamp < (7 * 24 * 60 * 60 * 1000)).length}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getLatestPrivateKey() ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Pending Keys</Text>
          </View>
        </View>

        {/* Batch List */}
        <ScrollView 
          style={styles.batchList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBatches.map((batch) => {
            const status = getStatusFromTimestamp(batch.timestamp);
            const statusColor = getStatusColor(status);
            
            return (
              <TouchableOpacity 
                key={batch.hash} 
                style={styles.batchCard}
                onPress={() => router.push(`/product/${batch.data.batchNumber}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{batch.data.productType}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.batchNumber}>Batch: {batch.data.batchNumber}</Text>
                <Text style={styles.quantity}>Quantity: {batch.data.quantity} kg</Text>
                <Text style={styles.date}>
                  Created: {new Date(batch.timestamp).toLocaleDateString()}
                </Text>

                <View style={styles.blockchainInfo}>
                  <Text style={styles.hashLabel}>🔗 Hash:</Text>
                  <Text style={styles.hashValue}>{batch.hash.substring(0, 24)}...</Text>
                </View>

                {batch.privateKey && (
                  <View style={styles.privateKeyInfo}>
                    <Text style={styles.privateKeyLabel}>🔐 Next Private Key Available</Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.endorsementInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.endorsementText}>
                      {batch.endorsements?.length || 4} Peer Endorsements
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredBatches.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No batches found' : 'No batches yet'}
              </Text>
              <Text style={styles.emptyMessage}>
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first batch to get started with blockchain tracking'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => router.push('/batch/new')}
                >
                  <Text style={styles.createButtonText}>Create First Batch</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  batchList: {
    flex: 1,
  },
  batchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
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
  batchNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  blockchainInfo: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  hashLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  hashValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
  },
  privateKeyInfo: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  privateKeyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  endorsementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endorsementText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
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
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
