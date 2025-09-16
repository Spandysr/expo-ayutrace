
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
  locationHistory?: Array<{
    stage: string;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    timestamp: number;
  }>;
}

const STORAGE_KEY = '@ayutrack_blockchain';

// Enhanced sample data with location history
const sampleBatches: BlockchainEntry[] = [
  {
    hash: "A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456",
    data: {
      productType: "Ashwagandha Powder",
      quantity: 100,
      timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
      batchNumber: "ASH-2024-001",
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore, Karnataka, India",
        stage: "RETAIL"
      },
      stage: "RETAIL",
      stageData: BlockchainHashGenerator.generateStageData("RETAIL")
    },
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
    privateKey: "1A2B3C4D5E6F789012345678901234567890ABCDEF1234567890ABCDEF1234",
    locationHistory: [
      {
        stage: "FARMING",
        location: { latitude: 9.9312, longitude: 76.2673, address: "Kochi, Kerala, India" },
        timestamp: Date.now() - (120 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "HARVESTING", 
        location: { latitude: 9.9312, longitude: 76.2673, address: "Kochi, Kerala, India" },
        timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "PROCESSING",
        location: { latitude: 11.0168, longitude: 76.9558, address: "Coimbatore, Tamil Nadu, India" },
        timestamp: Date.now() - (15 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "QUALITY_TESTING",
        location: { latitude: 13.0827, longitude: 80.2707, address: "Chennai, Tamil Nadu, India" },
        timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "PACKAGING",
        location: { latitude: 11.0168, longitude: 76.9558, address: "Coimbatore, Tamil Nadu, India" },
        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "DISTRIBUTION",
        location: { latitude: 12.9716, longitude: 77.5946, address: "Bangalore, Karnataka, India" },
        timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000)
      }
    ],
    consumerQRData: {
      batchId: "ASH-2024-001",
      productName: "Ashwagandha Powder",
      batchNumber: "ASH-2024-001",
      harvestDate: "2024-01-01",
      origin: "Kochi, Kerala, India",
      qualityGrade: "Grade A",
      certifications: ["Organic", "Ayush Certified"],
      blockchainHash: "A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456",
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
    hash: "B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF1234567A",
    data: {
      productType: "Turmeric Capsules",
      quantity: 250,
      timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
      batchNumber: "TUR-2024-002",
      location: {
        latitude: 11.0168,
        longitude: 76.9558,
        address: "Coimbatore, Tamil Nadu, India",
        stage: "DISTRIBUTION"
      },
      previousHash: "A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456",
      stage: "DISTRIBUTION",
      stageData: BlockchainHashGenerator.generateStageData("DISTRIBUTION")
    },
    timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000),
    previousHash: "A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456",
    privateKey: "2B3C4D5E6F789012345678901234567890ABCDEF1234567890ABCDEF123456AB",
    locationHistory: [
      {
        stage: "FARMING",
        location: { latitude: 8.5241, longitude: 76.9366, address: "Thiruvananthapuram, Kerala, India" },
        timestamp: Date.now() - (90 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "HARVESTING",
        location: { latitude: 8.5241, longitude: 76.9366, address: "Thiruvananthapuram, Kerala, India" },
        timestamp: Date.now() - (20 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "PROCESSING",
        location: { latitude: 11.0168, longitude: 76.9558, address: "Coimbatore, Tamil Nadu, India" },
        timestamp: Date.now() - (12 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "QUALITY_TESTING",
        location: { latitude: 13.0827, longitude: 80.2707, address: "Chennai, Tamil Nadu, India" },
        timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000)
      },
      {
        stage: "PACKAGING",
        location: { latitude: 11.0168, longitude: 76.9558, address: "Coimbatore, Tamil Nadu, India" },
        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000)
      }
    ],
    consumerQRData: {
      batchId: "TUR-2024-002",
      productName: "Turmeric Capsules",
      batchNumber: "TUR-2024-002",
      harvestDate: "2024-01-05",
      origin: "Thiruvananthapuram, Kerala, India",
      qualityGrade: "Grade A+",
      certifications: ["Organic", "Ayush Certified", "ISO 22000"],
      blockchainHash: "B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF1234567A",
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

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBlockchain(JSON.parse(stored));
      } else {
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

  const addBatch = useCallback(async (
    batchData: Omit<BatchData, 'timestamp' | 'previousHash' | 'privateKey'>, 
    requiresPrivateKey?: string,
    stage?: string
  ) => {
    setIsGenerating(true);
    
    try {
      const timestamp = Date.now();
      const isFirstBlock = blockchain.length === 0;
      const previousHash = isFirstBlock ? undefined : blockchain[blockchain.length - 1].hash;
      
      // Validate private key if this is not the first block
      if (!isFirstBlock && requiresPrivateKey) {
        const isValidKey = await BlockchainHashGenerator.validatePrivateKey(requiresPrivateKey, previousHash!);
        if (!isValidKey) {
          throw new Error('Invalid private key for block creation');
        }
      }

      // Get current location
      const currentLocation = await BlockchainHashGenerator.getCurrentLocation();
      
      // Generate stage data based on the stage
      const currentStage = stage || (isFirstBlock ? 'FARMING' : 'PROCESSING');
      const stageData = BlockchainHashGenerator.generateStageData(currentStage, currentLocation);
      
      const fullBatchData: BatchData = {
        ...batchData,
        timestamp,
        previousHash,
        location: currentLocation || {
          latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
          longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
          address: "Generated Location, India"
        },
        stage: currentStage as any,
        stageData
      };

      // Generate hash using expo-crypto
      const hash = await BlockchainHashGenerator.generateBatchHash(fullBatchData);
      
      // Always generate private key for next block (even for first block)
      const nextPrivateKey = await BlockchainHashGenerator.generatePrivateKey(hash, timestamp);
      
      // Create location history entry
      const locationHistory = currentLocation ? [{
        stage: currentStage,
        location: currentLocation,
        timestamp
      }] : [];
      
      // Generate consumer QR data
      const consumerQRData = await BlockchainHashGenerator.generateConsumerQRData(
        fullBatchData, 
        hash, 
        locationHistory
      );
      
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
        endorsements: endorsementResult.endorsements,
        locationHistory
      };

      const updatedBlockchain = [...blockchain, newEntry];
      setBlockchain(updatedBlockchain);
      await saveBlockchainData(updatedBlockchain);
      
      return {
        success: true,
        hash,
        privateKey: nextPrivateKey,
        consumerQRData,
        entry: newEntry,
        location: currentLocation
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

  const addStageToExistingBatch = useCallback(async (
    batchNumber: string, 
    stage: string, 
    privateKey: string
  ) => {
    setIsGenerating(true);
    
    try {
      const existingBatch = getBatchByNumber(batchNumber);
      if (!existingBatch) {
        throw new Error('Batch not found');
      }

      // Validate private key
      const isValidKey = await BlockchainHashGenerator.validatePrivateKey(
        privateKey, 
        existingBatch.hash
      );
      if (!isValidKey) {
        throw new Error('Invalid private key for stage addition');
      }

      // Get current location
      const currentLocation = await BlockchainHashGenerator.getCurrentLocation();
      
      // Generate stage data
      const stageData = BlockchainHashGenerator.generateStageData(stage, currentLocation);
      
      const timestamp = Date.now();
      
      // Create new batch data for this stage
      const stageBatchData: BatchData = {
        productType: existingBatch.data.productType,
        quantity: existingBatch.data.quantity,
        batchNumber: `${batchNumber}-${stage}`,
        timestamp,
        previousHash: existingBatch.hash,
        location: currentLocation || {
          latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
          longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
          address: "Generated Location, India"
        },
        stage: stage as any,
        stageData
      };

      // Generate new hash
      const hash = await BlockchainHashGenerator.generateBatchHash(stageBatchData);
      
      // Generate next private key
      const nextPrivateKey = await BlockchainHashGenerator.generatePrivateKey(hash, timestamp);
      
      // Update location history
      const newLocationEntry = currentLocation ? {
        stage,
        location: currentLocation,
        timestamp
      } : null;

      const updatedLocationHistory = [
        ...(existingBatch.locationHistory || []),
        ...(newLocationEntry ? [newLocationEntry] : [])
      ];
      
      // Generate updated consumer QR data
      const consumerQRData = await BlockchainHashGenerator.generateConsumerQRData(
        stageBatchData, 
        hash, 
        updatedLocationHistory
      );
      
      // Simulate endorsement
      const endorsementResult = await BlockchainHashGenerator.simulatePeerEndorsement(hash);
      
      const newEntry: BlockchainEntry = {
        hash,
        data: stageBatchData,
        timestamp,
        previousHash: existingBatch.hash,
        privateKey: nextPrivateKey,
        consumerQRData,
        endorsements: endorsementResult.endorsements,
        locationHistory: updatedLocationHistory
      };

      const updatedBlockchain = [...blockchain, newEntry];
      setBlockchain(updatedBlockchain);
      await saveBlockchainData(updatedBlockchain);
      
      return {
        success: true,
        hash,
        privateKey: nextPrivateKey,
        consumerQRData,
        entry: newEntry,
        location: currentLocation
      };
    } catch (error) {
      console.error('Error adding stage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsGenerating(false);
    }
  }, [blockchain]);

  const getBatchByNumber = useCallback((batchNumber: string) => {
    // First try exact match
    let batch = blockchain.find(entry => entry.data.batchNumber === batchNumber);
    
    // If not found, try to find by base batch number (without stage suffix)
    if (!batch) {
      const baseBatchNumber = batchNumber.split('-').slice(0, 3).join('-'); // e.g., TUR-2024-002
      batch = blockchain.find(entry => {
        const entryBaseBatch = entry.data.batchNumber.split('-').slice(0, 3).join('-');
        return entryBaseBatch === baseBatchNumber;
      });
    }
    
    // If still not found, try partial matching
    if (!batch) {
      batch = blockchain.find(entry => 
        entry.data.batchNumber.includes(batchNumber) || 
        batchNumber.includes(entry.data.batchNumber)
      );
    }
    
    return batch;
  }, [blockchain]);

  const getBatchByHash = useCallback((hash: string) => {
    return blockchain.find(entry => entry.hash === hash);
  }, [blockchain]);

  const getFullBatchHistory = useCallback((baseBatchNumber: string) => {
    // Extract base batch number (first 3 parts: TUR-2024-002)
    const baseNumber = baseBatchNumber.split('-').slice(0, 3).join('-');
    
    return blockchain.filter(entry => {
      const entryBaseNumber = entry.data.batchNumber.split('-').slice(0, 3).join('-');
      return entryBaseNumber === baseNumber;
    }).sort((a, b) => a.timestamp - b.timestamp);
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
      chainValid: blockchain.length === 0 ? true : null,
      totalBlocks: blockchain.length,
      pendingTransactions: 0
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
    addStageToExistingBatch,
    getBatchByNumber,
    getBatchByHash,
    getFullBatchHistory,
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
