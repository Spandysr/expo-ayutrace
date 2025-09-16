import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

// Simple hashing utility
const sha256 = async (input) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
};

// Custom hook for blockchain functionality
const useBlockchain = () => {
  const [blockchain, setBlockchain] = useState([]);
  const [loading, setLoading] = useState(false);

  const addBlock = async (data) => {
    setLoading(true);
    const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : '0';
    const timestamp = Date.now();
    const blockData = JSON.stringify({ index: blockchain.length, timestamp, data, previousHash });
    const hash = await sha256(blockData);

    setBlockchain(prev => [...prev, { hash, data, timestamp, index: blockchain.length, previousHash }]);
    setLoading(false);
    return hash;
  };

  return { blockchain, addBlock, loading };
};


export default function NewBatchScreen() {
  const router = useRouter();
  const { addBlock, loading, blockchain } = useBlockchain();
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [previousHash, setPreviousHash] = useState('');
  const [currentHash, setCurrentHash] = useState('');

  const handleCreateBatch = async () => {
    if (!productType || !quantity || !batchNumber) {
      alert('Please fill in all fields');
      return;
    }
    const batchData = { productType, quantity, batchNumber, timestamp: Date.now() };
    const hash = await addBlock(batchData);
    setCurrentHash(hash);
    setPreviousHash(blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : '0');
    // Optionally navigate or show success message
    alert(`Batch created successfully! Hash: ${hash}`);
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
          Create a new batch for your product. The batch will be secured using blockchain technology.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Product Type</Text>
          <TextInput
            style={styles.input}
            value={productType}
            onChangeText={setProductType}
            placeholder="e.g., Organic Apples"
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g., 100 kg"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Batch Number</Text>
          <TextInput
            style={styles.input}
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="e.g., BATCH-12345"
          />

          {/* Blockchain Information Display */}
          <View style={styles.blockchainInfo}>
            <Text style={styles.blockchainTitle}>Blockchain Integration</Text>
            <Text style={styles.blockchainDescription}>
              Each batch is recorded on a distributed ledger, ensuring transparency and immutability.
            </Text>
            {blockchain.length > 0 && (
              <View style={styles.previousHashContainer}>
                <Text style={styles.previousHashLabel}>Previous Block Hash:</Text>
                <Text style={styles.previousHash}>{blockchain[blockchain.length - 1].hash}</Text>
              </View>
            )}
            {currentHash ? (
              <View style={styles.hashContainer}>
                <Text style={styles.hashLabel}>Current Block Hash:</Text>
                <Text style={styles.hash}>{currentHash}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreateBatch}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>{loading ? 'Creating...' : 'Create Batch'}</Text>
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