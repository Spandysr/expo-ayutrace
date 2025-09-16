
import { useState, useCallback } from 'react';
import BlockchainHashGenerator, { BatchData } from '../utils/blockchain';

export interface BlockchainEntry {
  hash: string;
  data: BatchData;
  timestamp: number;
  previousHash?: string;
  endorsements?: Array<{
    peerId: string;
    signature: string;
    timestamp: number;
  }>;
}

export const useBlockchain = () => {
  const [blockchain, setBlockchain] = useState<BlockchainEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addBatch = useCallback(async (batchData: Omit<BatchData, 'timestamp' | 'previousHash'>) => {
    setIsGenerating(true);
    
    try {
      const timestamp = Date.now();
      const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : undefined;
      
      const fullBatchData: BatchData = {
        ...batchData,
        timestamp,
        previousHash
      };

      // Generate hash using expo-crypto
      const hash = await BlockchainHashGenerator.generateBatchHash(fullBatchData);
      
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
        endorsements: endorsementResult.endorsements
      };

      setBlockchain(prev => [...prev, newEntry]);
      
      return {
        success: true,
        hash,
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
      chainValid: blockchain.length === 0 ? true : null // Will be calculated when needed
    };
  }, [blockchain]);

  return {
    blockchain,
    addBatch,
    generateTransactionHash,
    generateQRHash,
    getLatestHash,
    validateChain,
    getNetworkStatus,
    isGenerating,
    chainLength: blockchain.length
  };
};
