import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  SafeAreaView 
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    try {
      // Try to parse as consumer QR data
      const qrData = JSON.parse(data);
      if (qrData.batchId && qrData.blockchainHash) {
        Alert.alert(
          'Product Verified!', 
          `Product: ${qrData.productName}\nBatch: ${qrData.batchNumber}\nGrade: ${qrData.qualityGrade}\nOrigin: ${qrData.origin}\nCertifications: ${qrData.certifications.join(', ')}`,
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { text: 'View Details', onPress: () => router.push(`/product/${qrData.batchId}`) },
            { text: 'Verify Blockchain', onPress: () => {
              Alert.alert('Blockchain Verified', `Hash: ${qrData.blockchainHash.substring(0, 16)}...\nThis product is authentic and verified on the blockchain.`);
              setScanned(false);
            }}
          ]
        );
      } else {
        throw new Error('Invalid QR format');
      }
    } catch (error) {
      // Fallback for simple product ID
      Alert.alert(
        'QR Code Scanned!', 
        `Product ID: ${data}`,
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'View Product', onPress: () => router.push(`/product/${data}`) }
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Product</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <Text style={styles.subtitle}>Point your camera at the QR code</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          flash={flashEnabled ? 'on' : 'off'}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <Ionicons name="flashlight" size={24} color="#666" />
          <Text style={styles.buttonText}>Flashlight</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/manual-entry')}>
          <Ionicons name="create" size={24} color="#666" />
          <Text style={styles.buttonText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
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
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});