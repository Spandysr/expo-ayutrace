
import { createHash } from 'crypto';

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
   * Generates a SHA-256 hash for a batch entry
   */
  static generateBatchHash(batchData: BatchData): string {
    const dataString = JSON.stringify({
      productType: batchData.productType,
      quantity: batchData.quantity,
      timestamp: batchData.timestamp,
      location: batchData.location,
      batchNumber: batchData.batchNumber,
      previousHash: batchData.previousHash || '0'
    });

    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Generates a transaction hash for supply chain events
   */
  static generateTransactionHash(
    fromAddress: string,
    toAddress: string,
    batchId: string,
    timestamp: number,
    eventType: 'CREATE' | 'TRANSFER' | 'VERIFY'
  ): string {
    const transactionData = {
      from: fromAddress,
      to: toAddress,
      batchId,
      timestamp,
      eventType,
      nonce: Math.random().toString(36).substring(2, 15)
    };

    return createHash('sha256').update(JSON.stringify(transactionData)).digest('hex');
  }

  /**
   * Generates a QR code compatible hash for product verification
   */
  static generateQRHash(batchHash: string, productId: string): string {
    const qrData = {
      batchHash,
      productId,
      timestamp: Date.now(),
      version: '1.0'
    };

    return createHash('sha256').update(JSON.stringify(qrData)).digest('hex');
  }

  /**
   * Validates hash integrity
   */
  static validateHash(data: any, expectedHash: string): boolean {
    const computedHash = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    return computedHash === expectedHash;
  }
}

export default BlockchainHashGenerator;
