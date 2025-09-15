import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const quickActions = [
    { title: 'Scan Product', subtitle: 'Scan QR code to track', action: () => router.push('/(tabs)/scan') },
    { title: 'New Batch', subtitle: 'Create product batch', action: () => router.push('/batch/new') },
    { title: 'My Batches', subtitle: 'View your batches', action: () => router.push('/batch/list') },
    { title: 'View History', subtitle: 'See scan history', action: () => router.push('/(tabs)/history') },
  ];

  const recentActivity = [
    { id: 'AB12345', product: 'Ashwagandha Powder', status: 'Verified', date: '2024-01-15' },
    { id: 'TU67890', product: 'Turmeric Root', status: 'Processing', date: '2024-01-12' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.subtitle}>Track your Ayurvedic products</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={action.action}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((item) => (
            <View key={item.id} style={styles.activityCard}>
              <View style={styles.activityInfo}>
                <Text style={styles.productName}>{item.product}</Text>
                <Text style={styles.batchId}>Batch: {item.id}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
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
          ))}
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
  },
  activityInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  batchId: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999999',
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
});
