
import { useState, useCallback } from 'react';
import BlockchainHashGenerator, { BatchData } from '../utils/blockchain';

export interface BlockchainEntry {
  hash: string;
  data: BatchData;
  timestamp: number;
  previousHash?: string;
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

      const hash = BlockchainHashGenerator.generateBatchHash(fullBatchData);
      
      const newEntry: BlockchainEntry = {
        hash,
        data: fullBatchData,
        timestamp,
        previousHash
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

  const generateTransactionHash = useCallback((
    fromAddress: string,
    toAddress: string,
    batchId: string,
    eventType: 'CREATE' | 'TRANSFER' | 'VERIFY'
  ) => {
    return BlockchainHashGenerator.generateTransactionHash(
      fromAddress,
      toAddress,
      batchId,
      Date.now(),
      eventType
    );
  }, []);

  const generateQRHash = useCallback((batchHash: string, productId: string) => {
    return BlockchainHashGenerator.generateQRHash(batchHash, productId);
  }, []);

  const getLatestHash = useCallback(() => {
    return blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : null;
  }, [blockchain]);

  const validateChain = useCallback(() => {
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];
      
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      const isValid = BlockchainHashGenerator.validateHash(
        currentBlock.data,
        currentBlock.hash
      );
      
      if (!isValid) {
        return false;
      }
    }
    return true;
  }, [blockchain]);

  return {
    blockchain,
    addBatch,
    generateTransactionHash,
    generateQRHash,
    getLatestHash,
    validateChain,
    isGenerating,
    chainLength: blockchain.length
  };
};
