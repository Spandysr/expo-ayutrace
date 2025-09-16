
import * as Crypto from 'expo-crypto';

export interface BatchData {
  productType: string;
  quantity: number;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  batchNumber: string;
  previousHash?: string;
}

export class BlockchainHashGenerator {
  /**
   * Generates a SHA-256 hash for a batch entry using expo-crypto
   */
  static async generateBatchHash(batchData: BatchData): Promise<string> {
    const dataString = JSON.stringify({
      productType: batchData.productType,
      quantity: batchData.quantity,
      timestamp: batchData.timestamp,
      location: batchData.location,
      batchNumber: batchData.batchNumber,
      previousHash: batchData.previousHash || '0'
    });

    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataString
    );
  }

  /**
   * Generates a transaction hash for supply chain events
   */
  static async generateTransactionHash(
    fromAddress: string,
    toAddress: string,
    batchId: string,
    timestamp: number,
    eventType: 'CREATE' | 'TRANSFER' | 'VERIFY'
  ): Promise<string> {
    const transactionData = {
      from: fromAddress,
      to: toAddress,
      batchId,
      timestamp,
      eventType,
      nonce: Math.random().toString(36).substring(2, 15)
    };

    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(transactionData)
    );
  }

  /**
   * Generates a QR code compatible hash for product verification
   */
  static async generateQRHash(batchHash: string, productId: string): Promise<string> {
    const qrData = {
      batchHash,
      productId,
      timestamp: Date.now(),
      version: '1.0'
    };

    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(qrData)
    );
  }

  /**
   * Validates hash integrity
   */
  static async validateHash(data: any, expectedHash: string): Promise<boolean> {
    const computedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(data)
    );
    return computedHash === expectedHash;
  }

  /**
   * Simulates Hyperledger Fabric peer endorsement
   */
  static async simulatePeerEndorsement(transactionHash: string): Promise<{
    endorsements: Array<{
      peerId: string;
      signature: string;
      timestamp: number;
    }>;
    consensusReached: boolean;
  }> {
    // Simulate multiple peer endorsements
    const peers = ['farmer-peer', 'lab-peer', 'processor-peer', 'regulator-peer'];
    const endorsements = [];

    for (const peerId of peers) {
      const endorsementData = `${transactionHash}-${peerId}-${Date.now()}`;
      const signature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        endorsementData
      );
      
      endorsements.push({
        peerId,
        signature,
        timestamp: Date.now()
      });
    }

    return {
      endorsements,
      consensusReached: endorsements.length >= 3 // Require majority consensus
    };
  }
}

export default BlockchainHashGenerator;
