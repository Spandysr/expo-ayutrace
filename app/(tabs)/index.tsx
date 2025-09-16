
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlockchain } from '../../hooks/useBlockchain';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { blockchain, getRecentBatches, getLatestPrivateKey, isLoading, chainLength } = useBlockchain();

  const quickActions = [
    { 
      title: 'Scan Product', 
      subtitle: 'Verify authenticity', 
      icon: 'scan',
      color: '#4CAF50',
      action: () => router.push('/(tabs)/scan') 
    },
    { 
      title: 'New Batch', 
      subtitle: 'Create blockchain entry', 
      icon: 'add-circle',
      color: '#2196F3',
      action: () => router.push('/batch/new') 
    },
    { 
      title: 'My Batches', 
      subtitle: `${chainLength} batches tracked`, 
      icon: 'cube',
      color: '#FF9800',
      action: () => router.push('/batch/list') 
    },
    { 
      title: 'View History', 
      subtitle: 'Scan records', 
      icon: 'time',
      color: '#9C27B0',
      action: () => router.push('/(tabs)/history') 
    },
  ];

  const recentActivity = getRecentBatches(5).map(batch => ({
    id: batch.data.batchNumber,
    product: batch.data.productType,
    status: Date.now() - batch.timestamp < (24 * 60 * 60 * 1000) ? 'New' : 'Verified',
    date: new Date(batch.timestamp).toLocaleDateString(),
    hash: batch.hash
  }));

  const networkStats = {
    totalBatches: chainLength,
    verifiedToday: blockchain.filter(b => 
      Date.now() - b.timestamp < (24 * 60 * 60 * 1000)
    ).length,
    activeNodes: 4,
    pendingKeys: getLatestPrivateKey() ? 1 : 0
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading blockchain data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.subtitle}>AyuTrack Blockchain Network</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Network Status */}
        <View style={styles.networkStatus}>
          <View style={styles.networkHeader}>
            <Text style={styles.networkTitle}>🔗 Hyperledger Network Status</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{networkStats.totalBatches}</Text>
              <Text style={styles.statLabel}>Total Batches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{networkStats.verifiedToday}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{networkStats.activeNodes}</Text>
              <Text style={styles.statLabel}>Peer Nodes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{networkStats.pendingKeys}</Text>
              <Text style={styles.statLabel}>Pending Keys</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.actionCard} 
                onPress={action.action}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Blockchain Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.activityCard}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <View style={styles.activityInfo}>
                  <Text style={styles.activityProduct}>{item.product}</Text>
                  <Text style={styles.activityId}>Batch: {item.id}</Text>
                  <Text style={styles.activityDate}>{item.date}</Text>
                  <Text style={styles.activityHash}>Hash: {item.hash.substring(0, 16)}...</Text>
                </View>
                <View style={[
                  styles.activityStatus,
                  { backgroundColor: item.status === 'New' ? '#E8F5E8' : '#E3F2FD' }
                ]}>
                  <Text style={[
                    styles.activityStatusText,
                    { color: item.status === 'New' ? '#4CAF50' : '#2196F3' }
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Ionicons name="cube-outline" size={48} color="#E0E0E0" />
              <Text style={styles.emptyActivityText}>No recent activity</Text>
              <Text style={styles.emptyActivitySubtext}>Create your first batch to get started</Text>
            </View>
          )}
        </View>

        {/* Private Key Notification */}
        {getLatestPrivateKey() && (
          <View style={styles.keyNotification}>
            <Ionicons name="key" size={24} color="#FF9800" />
            <View style={styles.keyNotificationContent}>
              <Text style={styles.keyNotificationTitle}>Private Key Available</Text>
              <Text style={styles.keyNotificationText}>
                You have a private key ready for the next block creation
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/batch/new')}
              style={styles.keyNotificationButton}
            >
              <Text style={styles.keyNotificationButtonText}>Use Now</Text>
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
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  networkStatus: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activityInfo: {
    flex: 1,
  },
  activityProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  activityId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  activityHash: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#999',
  },
  activityStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  keyNotification: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  keyNotificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  keyNotificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 2,
  },
  keyNotificationText: {
    fontSize: 14,
    color: '#F57C00',
  },
  keyNotificationButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  keyNotificationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
