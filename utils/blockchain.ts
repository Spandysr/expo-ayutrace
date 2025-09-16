
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
  privateKey?: string;
}

export interface ConsumerQRData {
  batchId: string;
  productName: string;
  batchNumber: string;
  harvestDate: string;
  origin: string;
  qualityGrade: string;
  certifications: string[];
  blockchainHash: string;
  verificationUrl: string;
  expiryDate: string;
  manufacturingDetails: {
    facilityName: string;
    licenseNumber: string;
    processedDate: string;
  };
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
   * Generates a private key for the next block creation
   */
  static async generatePrivateKey(batchHash: string, timestamp: number): Promise<string> {
    const keyData = {
      batchHash,
      timestamp,
      nonce: Math.random().toString(36).substring(2, 15),
      entropy: Date.now().toString()
    };

    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(keyData)
    );
  }

  /**
   * Validates private key for next block creation
   */
  static async validatePrivateKey(privateKey: string, previousHash: string): Promise<boolean> {
    // In a real implementation, this would verify the private key against the blockchain
    return privateKey.length === 64 && previousHash.length === 64;
  }

  /**
   * Creates consumer QR data with complete product information
   */
  static async generateConsumerQRData(
    batchData: BatchData,
    blockchainHash: string,
    additionalDetails?: Partial<ConsumerQRData>
  ): Promise<ConsumerQRData> {
    const baseUrl = 'https://ayutrack-verify.replit.app/product/';
    
    const consumerData: ConsumerQRData = {
      batchId: batchData.batchNumber,
      productName: batchData.productType,
      batchNumber: batchData.batchNumber,
      harvestDate: new Date(batchData.timestamp - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 30 days before processing
      origin: batchData.location ? `${batchData.location.latitude.toFixed(4)}, ${batchData.location.longitude.toFixed(4)}` : 'Kerala, India',
      qualityGrade: 'Grade A',
      certifications: ['Organic', 'Ayush Certified', 'ISO 22000'],
      blockchainHash,
      verificationUrl: `${baseUrl}${batchData.batchNumber}`,
      expiryDate: new Date(batchData.timestamp + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 1 year from processing
      manufacturingDetails: {
        facilityName: 'AyurVedic Processing Unit',
        licenseNumber: 'AYUSH-2024-001',
        processedDate: new Date(batchData.timestamp).toISOString().split('T')[0]
      },
      ...additionalDetails
    };

    return consumerData;
  }

  /**
   * Generates QR code hash for consumer scanning
   */
  static async generateConsumerQRHash(consumerData: ConsumerQRData): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(consumerData)
    );
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
