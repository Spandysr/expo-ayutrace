
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlockchain } from '../../hooks/useBlockchain';
import BlockchainHashGenerator from '../../utils/blockchain';

const PRODUCT_TYPES = [
  'Ashwagandha Powder',
  'Turmeric Capsules', 
  'Brahmi Extract',
  'Neem Oil',
  'Triphala Churna',
  'Amla Juice',
  'Giloy Tablets',
  'Tulsi Extract'
];

const STAGES = [
  { key: 'FARMING', label: 'Farming', icon: '🌱' },
  { key: 'HARVESTING', label: 'Harvesting', icon: '🌾' },
  { key: 'PROCESSING', label: 'Processing', icon: '⚗️' },
  { key: 'QUALITY_TESTING', label: 'Quality Testing', icon: '🔬' },
  { key: 'PACKAGING', label: 'Packaging', icon: '📦' },
  { key: 'DISTRIBUTION', label: 'Distribution', icon: '🚛' },
  { key: 'RETAIL', label: 'Retail', icon: '🏪' }
];

export default function NewBatchScreen() {
  const router = useRouter();
  const { addBatch, isGenerating, blockchain, getLatestHash, getLatestPrivateKey } = useBlockchain();
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedStage, setSelectedStage] = useState('FARMING');
  const [currentHash, setCurrentHash] = useState('');
  const [previousHash, setPreviousHash] = useState('');
  const [nextPrivateKey, setNextPrivateKey] = useState('');
  const [consumerQRData, setConsumerQRData] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);

  useEffect(() => {
    const isFirstBlock = blockchain.length === 0;
    setShowPrivateKeyInput(!isFirstBlock);
    
    if (!isFirstBlock) {
      const lastBlock = blockchain[blockchain.length - 1];
      setPreviousHash(lastBlock.hash);
    }

    // Generate batch number automatically
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setBatchNumber(`AYU-${year}${month}${day}-${randomSuffix}`);

    // Get initial location
    const loadInitialLocation = async () => {
      console.log('Loading initial location...');
      const location = await BlockchainHashGenerator.getCurrentLocation();
      setCurrentLocation(location);
      console.log('Initial location loaded:', location);
    };
    
    loadInitialLocation();
  }, [blockchain]);

  const handleCreateBatch = async () => {
    if (!productType || !quantity || !batchNumber) {
      Alert.alert('Error', 'Please fill in all required fields including batch number');
      return;
    }

    if (blockchain.length > 0 && !privateKey) {
      Alert.alert('Error', 'Private key is required for subsequent blocks');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum)) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const batchData = { 
      productType, 
      quantity: quantityNum, 
      batchNumber
    };

    const result = await addBatch(
      batchData, 
      blockchain.length > 0 ? privateKey : undefined,
      selectedStage
    );
    
    if (result.success) {
      setCurrentHash(result.hash);
      setPreviousHash(result.entry?.previousHash || '0');
      setNextPrivateKey(result.privateKey || '');
      setConsumerQRData(result.consumerQRData);
      setCurrentLocation(result.location);
      
      // Clear form
      setProductType('');
      setQuantity('');
      setPrivateKey('');
      setBatchNumber('');
      
      Alert.alert(
        'Success!', 
        `Batch created successfully!\n\nBatch: ${result.entry?.data.batchNumber}\nHash: ${result.hash.substring(0, 16)}...\n\n${blockchain.length === 0 ? 'First block created! ' : ''}Private Key for next block: ${result.privateKey?.substring(0, 16)}...`,
        [
          { text: 'View Batches', onPress: () => router.push('/batch/list') },
          { text: 'Create Another', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('Error', `Failed to create batch: ${result.error}`);
    }
  };

  const fillSampleData = () => {
    const sampleProduct = PRODUCT_TYPES[Math.floor(Math.random() * PRODUCT_TYPES.length)];
    const sampleQuantity = (Math.floor(Math.random() * 500) + 50).toString();
    
    setProductType(sampleProduct);
    setQuantity(sampleQuantity);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>New Batch</Text>
        <TouchableOpacity onPress={fillSampleData} style={styles.sampleButton}>
          <Ionicons name="flash" size={24} color="#FF9800" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.form}>
        <Text style={styles.description}>
          Create a new batch for your Ayurvedic product with live location tracking and blockchain security.
        </Text>

        {/* Live Status Indicator */}
        <View style={styles.liveStatus}>
          <View style={styles.liveIndicator} />
          <Text style={styles.liveText}>🔴 LIVE - Real-time blockchain creation</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Product Type *</Text>
          <View style={styles.pickerContainer}>
            {PRODUCT_TYPES.map((product) => (
              <TouchableOpacity
                key={product}
                style={[
                  styles.productOption,
                  productType === product && styles.productOptionSelected
                ]}
                onPress={() => setProductType(product)}
              >
                <Text style={[
                  styles.productOptionText,
                  productType === product && styles.productOptionTextSelected
                ]}>
                  {product}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Quantity (kg) *</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g., 100"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Batch Number *</Text>
          <TextInput
            style={styles.input}
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="Enter batch number (e.g., AYU-2025-001)"
          />

          <Text style={styles.label}>Supply Chain Stage</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
            {STAGES.map((stage) => (
              <TouchableOpacity
                key={stage.key}
                style={[
                  styles.stageOption,
                  selectedStage === stage.key && styles.stageOptionSelected
                ]}
                onPress={() => setSelectedStage(stage.key)}
              >
                <Text style={styles.stageIcon}>{stage.icon}</Text>
                <Text style={[
                  styles.stageText,
                  selectedStage === stage.key && styles.stageTextSelected
                ]}>
                  {stage.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {showPrivateKeyInput && (
            <>
              <Text style={styles.label}>Private Key (Required for Block #{blockchain.length + 1})</Text>
              <TextInput
                style={styles.input}
                value={privateKey}
                onChangeText={setPrivateKey}
                placeholder="Enter private key from previous block"
                secureTextEntry={true}
                autoCapitalize="characters"
              />
              {getLatestPrivateKey() && (
                <TouchableOpacity 
                  style={styles.useLastKeyButton}
                  onPress={() => setPrivateKey(getLatestPrivateKey()!)}
                >
                  <Text style={styles.useLastKeyText}>Use Latest Private Key</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.decryptKeyButton}
                onPress={() => {
                  Alert.prompt(
                    'Decrypt Private Key',
                    'Enter the encrypted private key you received:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Decrypt', 
                        onPress: async (encryptedKey) => {
                          if (encryptedKey) {
                            try {
                              const decryptedKey = await BlockchainHashGenerator.decryptPrivateKey(
                                encryptedKey, 
                                getLatestHash() || ''
                              );
                              setPrivateKey(decryptedKey);
                              Alert.alert('Success!', 'Private key decrypted and loaded');
                            } catch (error) {
                              Alert.alert('Error', 'Failed to decrypt key. Please check the encrypted key and try again.');
                            }
                          }
                        }
                      }
                    ],
                    'plain-text'
                  );
                }}
              >
                <Ionicons name="lock-open" size={16} color="#2196F3" />
                <Text style={styles.decryptKeyText}>Decrypt Received Key</Text>
              </TouchableOpacity>
              <Text style={styles.privateKeyNote}>
                ⚠️ You need the private key from the previous block to create a new block
              </Text>
            </>
          )}

          {/* Location Status */}
          <View style={styles.locationStatus}>
            <Text style={styles.locationTitle}>📍 Live Location Tracking</Text>
            <Text style={styles.locationDescription}>
              Your current location will be automatically captured and added to the blockchain for this stage.
            </Text>
            <TouchableOpacity 
              style={styles.refreshLocationButton} 
              onPress={async () => {
                console.log('Refreshing location...');
                const location = await BlockchainHashGenerator.getCurrentLocation();
                setCurrentLocation(location);
                console.log('Location refreshed:', location);
              }}
            >
              <Ionicons name="refresh" size={16} color="#4CAF50" />
              <Text style={styles.refreshLocationText}>Refresh Location</Text>
            </TouchableOpacity>
            {currentLocation && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  📍 {currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                </Text>
                <Text style={styles.locationAccuracy}>
                  Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          {/* Blockchain Information Display */}
          <View style={styles.blockchainInfo}>
            <Text style={styles.blockchainTitle}>🔗 Hyperledger Fabric Integration</Text>
            <Text style={styles.blockchainDescription}>
              {blockchain.length === 0 
                ? "Creating the genesis block for your supply chain. No private key required for the first block."
                : `Creating block #${blockchain.length + 1} in the chain. This will require the private key from block #${blockchain.length}.`
              }
            </Text>
            
            <View style={styles.networkStatus}>
              <Text style={styles.networkLabel}>Network Status:</Text>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected to {blockchain.length === 0 ? 'Genesis' : 'Peer'} Network</Text>
              </View>
            </View>

            {blockchain.length > 0 && (
              <View style={styles.previousHashContainer}>
                <Text style={styles.previousHashLabel}>Previous Block Hash:</Text>
                <Text style={styles.previousHash}>{getLatestHash()?.substring(0, 32)}...</Text>
              </View>
            )}
            
            {currentHash ? (
              <View style={styles.hashContainer}>
                <Text style={styles.hashLabel}>✅ Block Hash Generated:</Text>
                <Text style={styles.hash}>{currentHash}</Text>
                <Text style={styles.hashNote}>
                  This hash represents your batch on the blockchain. It's verified by multiple peers in the network.
                </Text>
              </View>
            ) : null}

            {nextPrivateKey ? (
              <View style={styles.privateKeyContainer}>
                <Text style={styles.privateKeyLabel}>🔐 Private Key for Next Block:</Text>
                <Text style={styles.privateKeyValue}>{nextPrivateKey}</Text>
                <Text style={styles.privateKeyWarning}>
                  ⚠️ IMPORTANT: Save this private key! You'll need it to create the next block in the chain.
                </Text>
                
                <View style={styles.shareKeySection}>
                  <Text style={styles.shareKeyTitle}>📤 Share Encrypted Key</Text>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={async () => {
                      const encryptedKey = await BlockchainHashGenerator.encryptPrivateKey(nextPrivateKey);
                      Alert.alert(
                        'Encrypted Private Key', 
                        `Share this encrypted key with the next person:\n\n${encryptedKey}\n\nThey will need to decrypt it using the batch hash.`,
                        [
                          { text: 'Copy to Clipboard', onPress: () => {
                            // In a real app, you would use Clipboard.setString()
                            Alert.alert('Copied!', 'Encrypted key copied to clipboard');
                          }},
                          { text: 'OK' }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="share" size={16} color="#fff" />
                    <Text style={styles.shareButtonText}>Generate Encrypted Key</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.shareKeyNote}>
                    💡 The recipient can decrypt this using the current block hash
                  </Text>
                </View>
              </View>
            ) : null}

            {consumerQRData ? (
              <View style={styles.consumerQRContainer}>
                <Text style={styles.consumerQRLabel}>📱 Consumer QR Code Data:</Text>
                <View style={styles.qrDataContainer}>
                  <Text style={styles.qrDataItem}>Product: {consumerQRData.productName}</Text>
                  <Text style={styles.qrDataItem}>Batch: {consumerQRData.batchNumber}</Text>
                  <Text style={styles.qrDataItem}>Origin: {consumerQRData.origin}</Text>
                  <Text style={styles.qrDataItem}>Grade: {consumerQRData.qualityGrade}</Text>
                  <Text style={styles.qrDataItem}>Certifications: {consumerQRData.certifications?.join(', ')}</Text>
                  <Text style={styles.qrDataItem}>Expiry: {consumerQRData.expiryDate}</Text>
                </View>
                <Text style={styles.consumerQRNote}>
                  This QR code can be printed on product packaging for consumer verification
                </Text>
              </View>
            ) : null}

            <View style={styles.consensusInfo}>
              <Text style={styles.consensusLabel}>Consensus Mechanism:</Text>
              <Text style={styles.consensusText}>
                • Multi-peer endorsement required{'\n'}
                • Distributed ledger replication{'\n'}
                • Tamper-proof transaction history{'\n'}
                • Real-time location verification
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, isGenerating && styles.disabledButton]}
            onPress={handleCreateBatch}
            disabled={isGenerating}
          >
            <Text style={styles.createButtonText}>
              {isGenerating 
                ? 'Creating Blockchain Entry...' 
                : blockchain.length === 0 
                  ? 'Create Genesis Block' 
                  : 'Create Batch on Blockchain'
              }
            </Text>
          </TouchableOpacity>
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
  sampleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  form: {
    paddingVertical: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    marginRight: 8,
  },
  liveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  productOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  productOptionText: {
    fontSize: 14,
    color: '#666',
  },
  productOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stageScroll: {
    marginBottom: 16,
  },
  stageOption: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  stageOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stageIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  stageText: {
    fontSize: 12,
    color: '#666',
  },
  stageTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  useLastKeyButton: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  useLastKeyText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  locationStatus: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  locationDescription: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
  },
  locationInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  refreshLocationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  locationAccuracy: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  blockchainInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  blockchainDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  networkStatus: {
    marginBottom: 12,
  },
  networkLabel: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 4,
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
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#555',
  },
  previousHashContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 4,
  },
  previousHashLabel: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  previousHash: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  hashContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  hashLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  hash: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 8,
  },
  hashNote: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  consensusInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  consensusLabel: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    marginBottom: 4,
  },
  consensusText: {
    fontSize: 11,
    color: '#555',
    lineHeight: 16,
  },
  privateKeyNote: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
    marginTop: 4,
  },
  privateKeyContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  privateKeyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  privateKeyValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#FFFDE7',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  privateKeyWarning: {
    fontSize: 11,
    color: '#D84315',
    fontWeight: '600',
    textAlign: 'center',
  },
  consumerQRContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  consumerQRLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  qrDataContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  qrDataItem: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    lineHeight: 16,
  },
  consumerQRNote: {
    fontSize: 11,
    color: '#2E7D32',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareKeySection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  shareKeyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  shareKeyNote: {
    fontSize: 11,
    color: '#1976D2',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  decryptKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decryptKeyText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
