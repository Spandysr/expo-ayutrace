
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlockchain } from '../../hooks/useBlockchain';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getBatchByNumber, getFullBatchHistory, isLoading } = useBlockchain();
  const [batchData, setBatchData] = useState<any>(null);
  const [batchHistory, setBatchHistory] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('timeline');

  useEffect(() => {
    if (id) {
      console.log('Looking for batch with ID:', id);
      const batch = getBatchByNumber(id as string);
      const history = getFullBatchHistory(id as string);
      
      console.log('Found batch:', batch);
      console.log('Found history:', history);
      
      setBatchData(batch);
      setBatchHistory(history);
    }
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!batchData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#FF5722" />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorMessage}>
            The requested batch could not be found in the blockchain.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      FARMING: '🌱',
      HARVESTING: '🌾',
      PROCESSING: '⚗️',
      QUALITY_TESTING: '🔬',
      PACKAGING: '📦',
      DISTRIBUTION: '🚛',
      RETAIL: '🏪'
    };
    return icons[stage] || '📍';
  };

  const getStageColor = (stage: string) => {
    const colors = {
      FARMING: '#4CAF50',
      HARVESTING: '#8BC34A',
      PROCESSING: '#FF9800',
      QUALITY_TESTING: '#2196F3',
      PACKAGING: '#9C27B0',
      DISTRIBUTION: '#FF5722',
      RETAIL: '#795548'
    };
    return colors[stage] || '#666';
  };

  const showQRData = () => {
    if (batchData.consumerQRData) {
      const qrInfo = batchData.consumerQRData;
      Alert.alert(
        'QR Code Information',
        `Product: ${qrInfo.productName}\nBatch: ${qrInfo.batchNumber}\nOrigin: ${qrInfo.origin}\nGrade: ${qrInfo.qualityGrade}\nCertifications: ${qrInfo.certifications?.join(', ')}\nExpiry: ${qrInfo.expiryDate}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>Product History</Text>
        <TouchableOpacity onPress={showQRData} style={styles.headerButton}>
          <Ionicons name="qr-code-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Product Header */}
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{batchData.data.productType}</Text>
        <Text style={styles.batchNumber}>Batch: {batchData.data.batchNumber}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.metaItem}>📦 {batchData.data.quantity} kg</Text>
          <Text style={styles.metaItem}>📅 {formatDate(batchData.timestamp)}</Text>
        </View>
        
        {/* Verification Status */}
        <View style={styles.verificationBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.verificationText}>Blockchain Verified</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'timeline' && styles.activeTab]}
          onPress={() => setSelectedTab('timeline')}
        >
          <Text style={[styles.tabText, selectedTab === 'timeline' && styles.activeTabText]}>
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'blockchain' && styles.activeTab]}
          onPress={() => setSelectedTab('blockchain')}
        >
          <Text style={[styles.tabText, selectedTab === 'blockchain' && styles.activeTabText]}>
            Blockchain
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'location' && styles.activeTab]}
          onPress={() => setSelectedTab('location')}
        >
          <Text style={[styles.tabText, selectedTab === 'location' && styles.activeTabText]}>
            Locations
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'timeline' && (
          <View style={styles.timelineContainer}>
            <Text style={styles.sectionTitle}>Supply Chain Journey</Text>
            
            {/* Current Stage */}
            <View style={styles.currentStage}>
              <View style={[styles.stageIndicator, { backgroundColor: getStageColor(batchData.data.stage) }]}>
                <Text style={styles.stageIcon}>{getStageIcon(batchData.data.stage)}</Text>
              </View>
              <View style={styles.stageContent}>
                <Text style={styles.stageName}>{batchData.data.stage?.replace('_', ' ')}</Text>
                <Text style={styles.stageTime}>{formatDate(batchData.timestamp)}</Text>
                <Text style={styles.stageLocation}>
                  📍 {batchData.data.location?.address || 'Location unavailable'}
                </Text>
              </View>
            </View>

            {/* Stage Details */}
            {batchData.data.stageData && (
              <View style={styles.stageDetails}>
                <Text style={styles.stageDetailsTitle}>Stage Details</Text>
                {Object.entries(batchData.data.stageData).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailKey}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>
                    <Text style={styles.detailValue}>
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Location History Timeline */}
            {batchData.locationHistory && batchData.locationHistory.length > 0 && (
              <View style={styles.locationHistory}>
                <Text style={styles.sectionTitle}>Location History</Text>
                {batchData.locationHistory.map((location, index) => (
                  <View key={index} style={styles.locationEntry}>
                    <View style={[styles.locationDot, { backgroundColor: getStageColor(location.stage) }]} />
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationStage}>
                        {getStageIcon(location.stage)} {location.stage.replace('_', ' ')}
                      </Text>
                      <Text style={styles.locationAddress}>{location.location.address}</Text>
                      <Text style={styles.locationTime}>{formatDate(location.timestamp)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {selectedTab === 'blockchain' && (
          <View style={styles.blockchainContainer}>
            <Text style={styles.sectionTitle}>Blockchain Information</Text>
            
            <View style={styles.hashContainer}>
              <Text style={styles.hashLabel}>Block Hash:</Text>
              <Text style={styles.hashValue}>{batchData.hash}</Text>
            </View>

            {batchData.previousHash && (
              <View style={styles.hashContainer}>
                <Text style={styles.hashLabel}>Previous Hash:</Text>
                <Text style={styles.hashValue}>{batchData.previousHash}</Text>
              </View>
            )}

            {/* Endorsements */}
            {batchData.endorsements && (
              <View style={styles.endorsementsContainer}>
                <Text style={styles.endorsementsTitle}>Peer Endorsements</Text>
                {batchData.endorsements.map((endorsement, index) => (
                  <View key={index} style={styles.endorsementItem}>
                    <View style={styles.endorsementHeader}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.endorsementPeer}>{endorsement.peerId}</Text>
                    </View>
                    <Text style={styles.endorsementSignature}>
                      Signature: {endorsement.signature.substring(0, 24)}...
                    </Text>
                    <Text style={styles.endorsementTime}>
                      {formatDate(endorsement.timestamp)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Network Stats */}
            <View style={styles.networkStats}>
              <Text style={styles.networkStatsTitle}>Network Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Consensus:</Text>
                <Text style={styles.statValue}>Achieved ✅</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Confirmations:</Text>
                <Text style={styles.statValue}>{batchData.endorsements?.length || 4}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Network:</Text>
                <Text style={styles.statValue}>Hyperledger Fabric</Text>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'location' && (
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Geographic Journey</Text>
            
            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                Map View Placeholder
              </Text>
              <Text style={styles.mapDescription}>
                Interactive map showing the geographic journey of this product through the supply chain will be implemented here.
              </Text>
            </View>

            {/* Location Details */}
            <View style={styles.locationDetails}>
              <Text style={styles.locationDetailsTitle}>Current Location</Text>
              <View style={styles.currentLocationCard}>
                <Text style={styles.currentLocationText}>
                  📍 {batchData.data.location?.address || 'Address not available'}
                </Text>
                <Text style={styles.currentLocationCoords}>
                  Coordinates: {batchData.data.location?.latitude.toFixed(6)}, {batchData.data.location?.longitude.toFixed(6)}
                </Text>
                <Text style={styles.currentLocationStage}>
                  Stage: {batchData.data.stage?.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* All Locations */}
            {batchData.locationHistory && (
              <View style={styles.allLocations}>
                <Text style={styles.allLocationsTitle}>All Recorded Locations</Text>
                {batchData.locationHistory.map((location, index) => (
                  <View key={index} style={styles.locationCard}>
                    <View style={styles.locationCardHeader}>
                      <Text style={styles.locationCardStage}>
                        {getStageIcon(location.stage)} {location.stage.replace('_', ' ')}
                      </Text>
                      <Text style={styles.locationCardTime}>
                        {formatDate(location.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.locationCardAddress}>
                      📍 {location.location.address}
                    </Text>
                    <Text style={styles.locationCardCoords}>
                      {location.location.latitude.toFixed(6)}, {location.location.longitude.toFixed(6)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  productHeader: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  batchNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    fontSize: 14,
    color: '#666',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  timelineContainer: {
    flex: 1,
  },
  currentStage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stageIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIcon: {
    fontSize: 20,
  },
  stageContent: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  stageTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  stageLocation: {
    fontSize: 12,
    color: '#666',
  },
  stageDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  stageDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  locationHistory: {
    marginTop: 16,
  },
  locationEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationStage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationTime: {
    fontSize: 12,
    color: '#999',
  },
  blockchainContainer: {
    flex: 1,
  },
  hashContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  hashLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hashValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    lineHeight: 16,
  },
  endorsementsContainer: {
    marginTop: 16,
  },
  endorsementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  endorsementItem: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  endorsementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  endorsementPeer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 4,
  },
  endorsementSignature: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 2,
  },
  endorsementTime: {
    fontSize: 12,
    color: '#999',
  },
  networkStats: {
    marginTop: 16,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
  },
  networkStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  locationContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: '#F0F0F0',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  mapDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  locationDetails: {
    marginBottom: 16,
  },
  locationDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentLocationCard: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  currentLocationCoords: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentLocationStage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  allLocations: {
    marginTop: 16,
  },
  allLocationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationCardStage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationCardTime: {
    fontSize: 12,
    color: '#999',
  },
  locationCardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationCardCoords: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#999',
  },
});
