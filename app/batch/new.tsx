
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBlockchain } from '../../hooks/useBlockchain';

export default function NewBatchScreen() {
  const router = useRouter();
  const { addBatch, isGenerating, blockchain, getLatestHash } = useBlockchain();
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [previousHash, setPreviousHash] = useState('');
  const [nextPrivateKey, setNextPrivateKey] = useState('');
  const [consumerQRData, setConsumerQRData] = useState<any>(null);
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);

  React.useEffect(() => {
    setShowPrivateKeyInput(blockchain.length > 0);
    if (blockchain.length > 0) {
      const lastBlock = blockchain[blockchain.length - 1];
      setPreviousHash(lastBlock.hash);
    }
  }, [blockchain]);

  const handleCreateBatch = async () => {
    if (!productType || !quantity || !batchNumber) {
      alert('Please fill in all fields');
      return;
    }

    if (blockchain.length > 0 && !privateKey) {
      alert('Private key is required for subsequent blocks');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum)) {
      alert('Please enter a valid quantity');
      return;
    }

    const batchData = { 
      productType, 
      quantity: quantityNum, 
      batchNumber,
      location: {
        latitude: 12.9716, // Example: Bangalore coordinates
        longitude: 77.5946
      }
    };

    const result = await addBatch(batchData, blockchain.length > 0 ? privateKey : undefined);
    
    if (result.success) {
      setCurrentHash(result.hash);
      setPreviousHash(result.entry?.previousHash || '0');
      setNextPrivateKey(result.privateKey || '');
      setConsumerQRData(result.consumerQRData);
      
      // Clear form
      setProductType('');
      setQuantity('');
      setBatchNumber('');
      setPrivateKey('');
      
      alert(`Batch created successfully!\nHash: ${result.hash.substring(0, 16)}...\nPrivate Key for next block: ${result.privateKey?.substring(0, 16)}...`);
    } else {
      alert(`Error creating batch: ${result.error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>New Batch</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.form}>
        <Text style={styles.description}>
          Create a new batch for your Ayurvedic product. Each batch will be secured using blockchain technology with Hyperledger Fabric integration.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Product Type</Text>
          <TextInput
            style={styles.input}
            value={productType}
            onChangeText={setProductType}
            placeholder="e.g., Ashwagandha Powder, Turmeric Capsules"
          />

          <Text style={styles.label}>Quantity (kg)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g., 100"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Batch Number</Text>
          <TextInput
            style={styles.input}
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="e.g., AYU-2024-001"
          />

          {showPrivateKeyInput && (
            <>
              <Text style={styles.label}>Private Key (Required)</Text>
              <TextInput
                style={styles.input}
                value={privateKey}
                onChangeText={setPrivateKey}
                placeholder="Enter private key from previous block"
                secureTextEntry={true}
              />
              <Text style={styles.privateKeyNote}>
                ⚠️ You need the private key from the previous block to create a new block
              </Text>
            </>
          )}

          {/* Blockchain Information Display */}
          <View style={styles.blockchainInfo}>
            <Text style={styles.blockchainTitle}>🔗 Hyperledger Fabric Integration</Text>
            <Text style={styles.blockchainDescription}>
              Your batch will be recorded on a permissioned blockchain network with multiple authorized participants (farmers, labs, processors, regulators) ensuring transparency and immutability.
            </Text>
            
            <View style={styles.networkStatus}>
              <Text style={styles.networkLabel}>Network Status:</Text>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected to Peer Network</Text>
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
                  <Text style={styles.qrDataItem}>Certifications: {consumerQRData.certifications.join(', ')}</Text>
                  <Text style={styles.qrDataItem}>Expiry: {consumerQRData.expiryDate}</Text>
                  <Text style={styles.qrDataItem}>Verification: {consumerQRData.verificationUrl}</Text>
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
                • Tamper-proof transaction history
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, isGenerating && styles.disabledButton]}
            onPress={handleCreateBatch}
            disabled={isGenerating}
          >
            <Text style={styles.createButtonText}>
              {isGenerating ? 'Creating Blockchain Entry...' : 'Create Batch on Blockchain'}
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
});
