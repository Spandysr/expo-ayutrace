
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useBlockchain } from '../../hooks/useBlockchain';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const { getBatchByNumber, getBatchByHash } = useBlockchain();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setIsLoading(true);
    
    try {
      // Try to parse QR data as JSON first
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        // If not JSON, treat as batch number
        parsedData = { batchNumber: data };
      }

      // Look up batch data
      let batchEntry = null;
      if (parsedData.batchNumber) {
        batchEntry = getBatchByNumber(parsedData.batchNumber);
      } else if (parsedData.blockchainHash) {
        batchEntry = getBatchByHash(parsedData.blockchainHash);
      }

      if (batchEntry) {
        setScannedData({
          ...parsedData,
          batchEntry,
          scanTime: new Date().toISOString(),
          verified: true
        });
      } else {
        setScannedData({
          ...parsedData,
          scanTime: new Date().toISOString(),
          verified: false,
          error: 'Batch not found in blockchain'
        });
      }
      
      setShowScanner(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to process QR code data');
      setScanned(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    setScanned(false);
    setScannedData(null);
    setShowScanner(true);
  };

  const simulateQRScan = (batchNumber: string) => {
    setIsLoading(true);
    const batchEntry = getBatchByNumber(batchNumber);
    
    setTimeout(() => {
      if (batchEntry && batchEntry.consumerQRData) {
        setScannedData({
          ...batchEntry.consumerQRData,
          batchEntry,
          scanTime: new Date().toISOString(),
          verified: true,
          simulated: true
        });
      } else {
        Alert.alert('Error', 'Batch not found');
      }
      setIsLoading(false);
    }, 1000);
  };

  const resetScan = () => {
    setScanned(false);
    setScannedData(null);
    setShowScanner(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#ccc" />
          <Text style={styles.permissionText}>Camera access is required to scan QR codes</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => BarCodeScanner.requestPermissionsAsync()}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR Scanner</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>Scan Product QR Code</Text>
          <Text style={styles.description}>
            Point your camera at the QR code on your Ayurvedic product to verify its authenticity and view blockchain details.
          </Text>

          <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
            <Ionicons name="scan" size={48} color="#4CAF50" />
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>Try Sample Products</Text>
          <Text style={styles.demoDescription}>
            Test the scanner with these sample batch numbers:
          </Text>
          
          <View style={styles.sampleButtons}>
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => simulateQRScan('ASH-2024-001')}
              disabled={isLoading}
            >
              <Text style={styles.sampleButtonText}>Scan Ashwagandha</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={() => simulateQRScan('TUR-2024-002')}
              disabled={isLoading}
            >
              <Text style={styles.sampleButtonText}>Scan Turmeric</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Processing QR Code...</Text>
          </View>
        )}

        {scannedData && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>
              {scannedData.verified ? '✅ Verified Product' : '❌ Unverified'}
            </Text>
            
            {scannedData.verified ? (
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{scannedData.productName}</Text>
                <Text style={styles.batchNumber}>Batch: {scannedData.batchNumber}</Text>
                <Text style={styles.origin}>Origin: {scannedData.origin}</Text>
                <Text style={styles.grade}>Quality: {scannedData.qualityGrade}</Text>
                <Text style={styles.certifications}>
                  Certifications: {scannedData.certifications?.join(', ')}
                </Text>
                <Text style={styles.expiry}>Expires: {scannedData.expiryDate}</Text>
                
                <View style={styles.blockchainInfo}>
                  <Text style={styles.blockchainTitle}>🔗 Blockchain Details</Text>
                  <Text style={styles.hashText}>Hash: {scannedData.blockchainHash?.substring(0, 32)}...</Text>
                  <Text style={styles.timestampText}>
                    Created: {new Date(scannedData.batchEntry?.timestamp).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => router.push(`/product/${scannedData.batchNumber}`)}
                >
                  <Text style={styles.detailsButtonText}>View Full History</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.errorInfo}>
                <Text style={styles.errorText}>{scannedData.error}</Text>
                <Text style={styles.errorDescription}>
                  This product may not be authentic or registered in our blockchain network.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
              <Text style={styles.resetButtonText}>Scan Another Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <View style={{ width: 30 }} />
          </View>
          
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
          />
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerInstructions}>
              Position the QR code within the frame
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  scanSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  scanButton: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
  },
  demoSection: {
    marginBottom: 32,
  },
  demoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  sampleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sampleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    alignItems: 'center',
  },
  sampleButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  resultSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  batchNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  origin: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  grade: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  certifications: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  expiry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  blockchainInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  blockchainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  hashText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorInfo: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -125 }, { translateY: -125 }],
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});
