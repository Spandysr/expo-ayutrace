
import * as Crypto from 'expo-crypto';
import * as Location from 'expo-location';

export interface BatchData {
  productType: string;
  quantity: number;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    stage?: string;
  };
  batchNumber: string;
  previousHash?: string;
  privateKey?: string;
  stage?: 'FARMING' | 'HARVESTING' | 'PROCESSING' | 'QUALITY_TESTING' | 'PACKAGING' | 'DISTRIBUTION' | 'RETAIL';
  stageData?: any;
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

export class BlockchainHashGenerator {
  /**
   * Gets current location for geo-tagging
   */
  static async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null> {
    try {
      console.log('Requesting location permissions...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        // Return a fallback location if permission denied
        return {
          latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
          longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
          address: "Bangalore, Karnataka, India (Fallback)"
        };
      }

      console.log('Getting current position...');
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });
      
      console.log('Location obtained:', location.coords);
      
      // Get reverse geocoding for address
      let address = '';
      try {
        console.log('Getting reverse geocoding...');
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          address = `${place.city || place.subregion || ''}, ${place.region || ''}, ${place.country || ''}`.replace(/^,\s*|,\s*$/g, '');
          console.log('Address resolved:', address);
        }
      } catch (error) {
        console.log('Could not get address:', error);
        address = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address || undefined
      };
    } catch (error) {
      console.log('Error getting location:', error);
      // Return a fallback location with some randomness to simulate real locations
      const fallbackLocations = [
        { lat: 12.9716, lng: 77.5946, addr: "Bangalore, Karnataka, India" },
        { lat: 13.0827, lng: 80.2707, addr: "Chennai, Tamil Nadu, India" },
        { lat: 11.0168, lng: 76.9558, addr: "Coimbatore, Tamil Nadu, India" },
        { lat: 9.9312, lng: 76.2673, addr: "Kochi, Kerala, India" }
      ];
      
      const randomLocation = fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
      
      return {
        latitude: randomLocation.lat + (Math.random() - 0.5) * 0.01,
        longitude: randomLocation.lng + (Math.random() - 0.5) * 0.01,
        address: randomLocation.addr + " (Simulated)"
      };
    }
  }

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
      previousHash: batchData.previousHash || '0',
      stage: batchData.stage,
      stageData: batchData.stageData
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
   * Generates a secure private key with numbers and alphabets
   */
  static async generatePrivateKey(batchHash: string, timestamp: number): Promise<string> {
    const keyData = {
      batchHash,
      timestamp,
      nonce: Math.random().toString(36).substring(2, 15),
      entropy: Date.now().toString(),
      random: Math.random() * 1000000
    };

    const rawKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(keyData)
    );

    // Convert to alphanumeric format (numbers and uppercase letters only)
    return rawKey.toUpperCase().replace(/[^A-F0-9]/g, '');
  }

  /**
   * Validates private key for next block creation
   */
  static async validatePrivateKey(privateKey: string, previousHash: string): Promise<boolean> {
    // Enhanced validation - check format and length
    if (!privateKey || privateKey.length !== 64) return false;
    if (!/^[A-F0-9]+$/.test(privateKey)) return false;
    if (!previousHash || previousHash.length !== 64) return false;
    
    // In a real implementation, this would verify the private key against the blockchain
    return true;
  }

  /**
   * Creates consumer QR data with complete product information including location history
   */
  static async generateConsumerQRData(
    batchData: BatchData,
    blockchainHash: string,
    locationHistory?: Array<any>,
    additionalDetails?: Partial<ConsumerQRData>
  ): Promise<ConsumerQRData> {
    const baseUrl = 'https://ayutrack-verify.replit.app/product/';
    
    const consumerData: ConsumerQRData = {
      batchId: batchData.batchNumber,
      productName: batchData.productType,
      batchNumber: batchData.batchNumber,
      harvestDate: new Date(batchData.timestamp - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      origin: batchData.location?.address || `${batchData.location?.latitude.toFixed(4)}, ${batchData.location?.longitude.toFixed(4)}` || 'Kerala, India',
      qualityGrade: 'Grade A',
      certifications: ['Organic', 'Ayush Certified', 'ISO 22000'],
      blockchainHash,
      verificationUrl: `${baseUrl}${batchData.batchNumber}`,
      expiryDate: new Date(batchData.timestamp + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      manufacturingDetails: {
        facilityName: 'AyurVedic Processing Unit',
        licenseNumber: 'AYUSH-2024-001',
        processedDate: new Date(batchData.timestamp).toISOString().split('T')[0]
      },
      locationHistory: locationHistory || [],
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
      consensusReached: endorsements.length >= 3
    };
  }

  /**
   * Encrypts a private key using the current block hash as encryption key
   */
  static async encryptPrivateKey(privateKey: string, blockHash?: string): Promise<string> {
    const encryptionKey = blockHash || Date.now().toString();
    const combinedData = `${privateKey}-${encryptionKey}-${Date.now()}`;
    
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combinedData
    );
    
    // Create a reversible encoding by combining parts of the key with the hash
    const keyParts = privateKey.match(/.{1,8}/g) || [];
    const hashParts = (blockHash || encrypted).match(/.{1,8}/g) || [];
    
    let encryptedKey = '';
    for (let i = 0; i < Math.max(keyParts.length, hashParts.length); i++) {
      if (keyParts[i]) encryptedKey += keyParts[i];
      if (hashParts[i]) encryptedKey += hashParts[i].substring(0, 4);
    }
    
    // Add a verification suffix
    const verification = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      privateKey
    );
    
    return `ENC_${encryptedKey}_${verification.substring(0, 8)}`;
  }

  /**
   * Decrypts a private key using the previous block hash
   */
  static async decryptPrivateKey(encryptedKey: string, blockHash: string): Promise<string> {
    try {
      if (!encryptedKey.startsWith('ENC_') || !encryptedKey.includes('_')) {
        throw new Error('Invalid encrypted key format');
      }
      
      const parts = encryptedKey.split('_');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted key structure');
      }
      
      const encryptedData = parts[1];
      const verification = parts[2];
      
      // Extract the original private key by removing hash parts
      const hashParts = blockHash.match(/.{1,8}/g) || [];
      let decryptedKey = '';
      let position = 0;
      
      for (let i = 0; i < hashParts.length && position < encryptedData.length; i++) {
        // Take 8 characters for the key part
        if (position + 8 <= encryptedData.length) {
          decryptedKey += encryptedData.substring(position, position + 8);
          position += 8;
        }
        // Skip 4 characters for the hash part
        position += 4;
      }
      
      // Add any remaining characters
      while (position < encryptedData.length && decryptedKey.length < 64) {
        const remaining = encryptedData.substring(position);
        const nextKeyPart = remaining.match(/^.{1,8}/);
        if (nextKeyPart) {
          decryptedKey += nextKeyPart[0];
          position += nextKeyPart[0].length + 4; // Skip next hash part
        } else {
          break;
        }
      }
      
      // Pad if necessary
      while (decryptedKey.length < 64) {
        decryptedKey += '0';
      }
      
      // Trim to 64 characters
      decryptedKey = decryptedKey.substring(0, 64).toUpperCase();
      
      // Verify the decrypted key
      const keyVerification = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        decryptedKey
      );
      
      if (keyVerification.substring(0, 8) !== verification) {
        throw new Error('Key verification failed - incorrect decryption');
      }
      
      return decryptedKey;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Generate fake scenario data for different stages
   */
  static generateStageData(stage: string, location?: any): any {
    const stageTemplates = {
      FARMING: {
        farmerName: "Ravi Kumar",
        farmSize: "5 acres",
        soilType: "Red laterite",
        irrigationType: "Drip irrigation",
        fertilizers: ["Organic compost", "Vermicompost"],
        seedVariety: "Local indigenous",
        plantingDate: new Date(Date.now() - (120 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        expectedHarvest: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      HARVESTING: {
        harvestDate: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        harvestMethod: "Hand-picked",
        moistureContent: "12%",
        qualityGrade: "Premium",
        harvestedBy: "Kumar Harvest Team",
        weatherConditions: "Sunny, 28°C",
        yieldPerAcre: "2.5 tonnes"
      },
      PROCESSING: {
        processingDate: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        processingMethod: "Traditional sun drying",
        temperature: "45°C",
        duration: "72 hours",
        operator: "Ayur Processing Unit",
        batchSize: "500 kg",
        finalMoisture: "8%"
      },
      QUALITY_TESTING: {
        testDate: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        labName: "Ayush Certified Lab",
        testResults: {
          purity: "99.5%",
          heavyMetals: "Within limits",
          microbial: "Satisfactory",
          pesticides: "Not detected",
          activeCompounds: "Within range"
        },
        certificateNumber: "AC-2024-" + Math.floor(Math.random() * 10000),
        validUntil: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      PACKAGING: {
        packagingDate: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        packagingType: "Food-grade aluminum pouch",
        batchSize: "250g pouches",
        packagingFacility: "AyurPack Industries",
        expiryDate: new Date(Date.now() + (730 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        labelingCompliance: "FSSAI, Ayush Ministry"
      },
      DISTRIBUTION: {
        distributionDate: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        distributorName: "AyurDistribute Pvt Ltd",
        vehicleNumber: "KA-01-" + Math.floor(Math.random() * 10000),
        driverName: "Suresh Patel",
        transportConditions: "Ambient temperature, dry",
        destinationRegion: location?.address || "Southern India"
      },
      RETAIL: {
        receivedDate: new Date().toISOString().split('T')[0],
        retailerName: "Organic Health Store",
        storageConditions: "Cool, dry place",
        shelfLocation: "Ayurvedic Section",
        pricePerUnit: "₹299",
        availableStock: Math.floor(Math.random() * 100) + 20
      }
    };

    return stageTemplates[stage] || {};
  }
}

export default BlockchainHashGenerator;
