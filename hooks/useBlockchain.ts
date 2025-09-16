
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BlockchainHashGenerator, { BatchData } from '../utils/blockchain';

export interface BlockchainEntry {
  hash: string;
  data: BatchData;
  timestamp: number;
  previousHash?: string;
  privateKey?: string;
  consumerQRData?: any;
  endorsements?: Array<{
    peerId: string;
    signature: string;
    timestamp: number;
  }>;
}

const STORAGE_KEY = '@ayutrack_blockchain';

// Sample data for demonstration
const sampleBatches: BlockchainEntry[] = [
  {
    hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    data: {
      productType: "Ashwagandha Powder",
      quantity: 100,
      timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      batchNumber: "ASH-2024-001",
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
    privateKey: "prvkey1a2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef12",
    consumerQRData: {
      batchId: "ASH-2024-001",
      productName: "Ashwagandha Powder",
      batchNumber: "ASH-2024-001",
      harvestDate: "2024-01-01",
      origin: "Kerala, India",
      qualityGrade: "Grade A",
      certifications: ["Organic", "Ayush Certified"],
      blockchainHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
      verificationUrl: "https://ayutrack-verify.replit.app/product/ASH-2024-001",
      expiryDate: "2025-01-01",
      manufacturingDetails: {
        facilityName: "AyurVedic Processing Unit",
        licenseNumber: "AYUSH-2024-001",
        processedDate: "2024-01-08"
      }
    }
  },
  {
    hash: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a",
    data: {
      productType: "Turmeric Capsules",
      quantity: 250,
      timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
      batchNumber: "TUR-2024-002",
      location: {
        latitude: 11.0168,
        longitude: 76.9558
      },
      previousHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
    },
    timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
    previousHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    privateKey: "prvkey2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef123a",
    consumerQRData: {
      batchId: "TUR-2024-002",
      productName: "Turmeric Capsules",
      batchNumber: "TUR-2024-002",
      harvestDate: "2024-01-05",
      origin: "Tamil Nadu, India",
      qualityGrade: "Grade A+",
      certifications: ["Organic", "Ayush Certified", "ISO 22000"],
      blockchainHash: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a",
      verificationUrl: "https://ayutrack-verify.replit.app/product/TUR-2024-002",
      expiryDate: "2025-01-05",
      manufacturingDetails: {
        facilityName: "AyurVedic Processing Unit",
        licenseNumber: "AYUSH-2024-001",
        processedDate: "2024-01-12"
      }
    }
  }
];

export const useBlockchain = () => {
  const [blockchain, setBlockchain] = useState<BlockchainEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load blockchain data from storage on mount
  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBlockchain(JSON.parse(stored));
      } else {
        // Initialize with sample data
        setBlockchain(sampleBatches);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBatches));
      }
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
      setBlockchain(sampleBatches);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBlockchainData = async (data: BlockchainEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save blockchain data:', error);
    }
  };

  const addBatch = useCallback(async (batchData: Omit<BatchData, 'timestamp' | 'previousHash' | 'privateKey'>, requiresPrivateKey?: string) => {
    setIsGenerating(true);
    
    try {
      const timestamp = Date.now();
      const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : undefined;
      
      // Validate private key if this is not the first block
      if (blockchain.length > 0 && requiresPrivateKey) {
        const isValidKey = await BlockchainHashGenerator.validatePrivateKey(requiresPrivateKey, previousHash!);
        if (!isValidKey) {
          throw new Error('Invalid private key for block creation');
        }
      }
      
      const fullBatchData: BatchData = {
        ...batchData,
        timestamp,
        previousHash
      };

      // Generate hash using expo-crypto
      const hash = await BlockchainHashGenerator.generateBatchHash(fullBatchData);
      
      // Generate private key for next block
      const nextPrivateKey = await BlockchainHashGenerator.generatePrivateKey(hash, timestamp);
      
      // Generate consumer QR data
      const consumerQRData = await BlockchainHashGenerator.generateConsumerQRData(fullBatchData, hash);
      
      // Simulate Hyperledger Fabric peer endorsement
      const endorsementResult = await BlockchainHashGenerator.simulatePeerEndorsement(hash);
      
      if (!endorsementResult.consensusReached) {
        throw new Error('Failed to reach consensus among peers');
      }

      const newEntry: BlockchainEntry = {
        hash,
        data: fullBatchData,
        timestamp,
        previousHash,
        privateKey: nextPrivateKey,
        consumerQRData,
        endorsements: endorsementResult.endorsements
      };

      const updatedBlockchain = [...blockchain, newEntry];
      setBlockchain(updatedBlockchain);
      await saveBlockchainData(updatedBlockchain);
      
      return {
        success: true,
        hash,
        privateKey: nextPrivateKey,
        consumerQRData,
        entry: newEntry
      };
    } catch (error) {
      console.error('Error generating blockchain entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsGenerating(false);
    }
  }, [blockchain]);

  const getBatchByNumber = useCallback((batchNumber: string) => {
    return blockchain.find(entry => entry.data.batchNumber === batchNumber);
  }, [blockchain]);

  const getBatchByHash = useCallback((hash: string) => {
    return blockchain.find(entry => entry.hash === hash);
  }, [blockchain]);

  const generateTransactionHash = useCallback(async (
    fromAddress: string,
    toAddress: string,
    batchId: string,
    eventType: 'CREATE' | 'TRANSFER' | 'VERIFY'
  ) => {
    return await BlockchainHashGenerator.generateTransactionHash(
      fromAddress,
      toAddress,
      batchId,
      Date.now(),
      eventType
    );
  }, []);

  const generateQRHash = useCallback(async (batchHash: string, productId: string) => {
    return await BlockchainHashGenerator.generateQRHash(batchHash, productId);
  }, []);

  const getLatestHash = useCallback(() => {
    return blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : null;
  }, [blockchain]);

  const getLatestPrivateKey = useCallback(() => {
    return blockchain.length > 0 ? blockchain[blockchain.length - 1].privateKey : null;
  }, [blockchain]);

  const validateChain = useCallback(async () => {
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];
      
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      const isValid = await BlockchainHashGenerator.validateHash(
        currentBlock.data,
        currentBlock.hash
      );
      
      if (!isValid) {
        return false;
      }
    }
    return true;
  }, [blockchain]);

  const getNetworkStatus = useCallback(() => {
    return {
      connected: true,
      peerCount: 4,
      lastBlockTime: blockchain.length > 0 ? blockchain[blockchain.length - 1].timestamp : null,
      chainValid: blockchain.length === 0 ? true : null
    };
  }, [blockchain]);

  const getRecentBatches = useCallback((limit: number = 5) => {
    return blockchain
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [blockchain]);

  return {
    blockchain,
    addBatch,
    getBatchByNumber,
    getBatchByHash,
    generateTransactionHash,
    generateQRHash,
    getLatestHash,
    getLatestPrivateKey,
    validateChain,
    getNetworkStatus,
    getRecentBatches,
    isGenerating,
    isLoading,
    chainLength: blockchain.length
  };
};
