import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const router = useRouter();
  const historyItems = [
    {
      id: 'AB12345',
      productName: 'Ashwagandha Powder',
      scanDate: '2024-01-15',
      status: 'Verified',
      origin: 'Kerala, India'
    },
    {
      id: 'TU67890',
      productName: 'Turmeric Root',
      scanDate: '2024-01-12',
      status: 'Verified',
      origin: 'Tamil Nadu, India'
    },
    {
      id: 'NE54321',
      productName: 'Neem Leaves',
      scanDate: '2024-01-10',
      status: 'Processing',
      origin: 'Karnataka, India'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {historyItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{item.productName}</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: item.status === 'Verified' ? '#E8F5E8' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.status === 'Verified' ? '#4CAF50' : '#FF9800' }
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.batchId}>Batch ID: {item.id}</Text>
            <Text style={styles.scanDate}>Scanned: {item.scanDate}</Text>
            <Text style={styles.origin}>Origin: {item.origin}</Text>
            
            <TouchableOpacity style={styles.viewButton} onPress={() => router.push(`/product/${item.id}`)}>
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        {historyItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No scan history</Text>
            <Text style={styles.emptyMessage}>
              Start scanning QR codes to track your Ayurvedic products
            </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
    marginBottom: 12,
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
  },
});