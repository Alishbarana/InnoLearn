 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import React Native AR Viewer (you'll need to install and configure this)
// import { ARViewer as NativeARViewer } from 'react-native-ar-viewer';

// Import your colors from the styles folder
import Colors from '../../styles/colors';

// 3D Models configuration for educational terms
const educationalModels = {
  'array': {
    title: 'Array Data Structure',
    description: 'Visualize array indexing and operations in 3D',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf',
    localFileName: 'array_model.glb',
    icon: 'view-grid',
    color: '#4285F4'
  },
  'tree': {
    title: 'Tree Data Structure',
    description: 'Interactive tree with node connections',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf',
    localFileName: 'tree_model.glb',
    icon: 'file-tree',
    color: '#34A853'
  },
  'list': {
    title: 'List Data Structure',
    description: 'Explore list structure and operations',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf',
    localFileName: 'list_model.glb',
    icon: 'format-list-bulleted',
    color: '#EA4335'
  },
  'stack': {
    title: 'Stack Operations',
    description: 'View push and pop operations in 3D',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Cube/glTF/Cube.gltf',
    localFileName: 'stack_model.glb',
    icon: 'stack-overflow',
    color: '#FBBC05'
  },
  'queue': {
    title: 'Queue Visualization',
    description: 'Understand FIFO operations visually',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sphere/glTF/Sphere.gltf',
    localFileName: 'queue_model.glb',
    icon: 'format-list-numbered',
    color: '#9C27B0'
  },
  'sort': {
    title: 'Sorting Algorithm',
    description: 'Visualize sorting operations in 3D',
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf',
    localFileName: 'sort_model.glb',
    icon: 'sort',
    color: '#009688'
  }
};

const ARViewerScreen = ({ route }) => {
  const navigation = useNavigation();
  const { recognizedTerm, confidence, imageUri } = route.params || {};
  
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [localModelPath, setLocalModelPath] = useState(null);

  const selectedModel = educationalModels[recognizedTerm];

  useEffect(() => {
    initializeAR();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      checkModelAvailability();
    }
  }, [selectedModel]);

  const initializeAR = async () => {
    try {
      setIsLoading(true);
      
      // Check AR support
      const supported = await checkARSupport();
      setIsARSupported(supported);
      
      if (!supported) {
        Alert.alert(
          'AR Not Supported',
          'Your device does not support AR features. Please ensure you have ARCore installed and your device is compatible.',
          [
            { text: 'Install ARCore', onPress: () => openARCorePlayStore() },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error initializing AR:', error);
      setIsARSupported(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkARSupport = async () => {
    try {
      // For now, we'll assume AR is supported on newer devices
      // You can implement actual AR support checking when you add AR library
      if (Platform.OS === 'android') {
        // Check Android API level and device capabilities
        return Platform.Version >= 24; // Android 7.0+ for ARCore
      } else {
        // For iOS, check for ARKit availability (iOS 11+)
        return true; // Assume supported for now
      }
    } catch (error) {
      console.error('AR support check failed:', error);
      return false;
    }
  };

  const openARCorePlayStore = () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.google.ar.core';
    Linking.openURL(playStoreUrl);
  };

  const checkModelAvailability = async () => {
    if (!selectedModel) return;

    try {
      const localPath = `${RNFS.DocumentDirectoryPath}/${selectedModel.localFileName}`;
      const fileExists = await RNFS.exists(localPath);
      
      if (fileExists) {
        setLocalModelPath(localPath);
        setModelReady(true);
      } else {
        setModelReady(false);
      }
    } catch (error) {
      console.error('Error checking model availability:', error);
      setModelReady(false);
    }
  };

  const downloadModel = async () => {
    if (!selectedModel) return;

    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);

      const localPath = `${RNFS.DocumentDirectoryPath}/${selectedModel.localFileName}`;
      
      const downloadOptions = {
        fromUrl: selectedModel.modelUrl,
        toFile: localPath,
        progress: (res) => {
          const progressPercent = (res.bytesWritten / res.contentLength) * 100;
          setModelDownloadProgress(progressPercent);
        }
      };

      const downloadResult = await RNFS.downloadFile(downloadOptions).promise;

      if (downloadResult.statusCode === 200) {
        setLocalModelPath(localPath);
        setModelReady(true);
        
        // Cache the download info
        await AsyncStorage.setItem(`model_${recognizedTerm}`, JSON.stringify({
          path: localPath,
          downloadDate: new Date().toISOString()
        }));
        
        Alert.alert('Success', '3D model downloaded successfully!');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading model:', error);
      Alert.alert('Download Error', 'Failed to download 3D model. Please check your internet connection.');
    } finally {
      setIsDownloading(false);
      setModelDownloadProgress(0);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to display AR content',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const launchAR = async () => {
    if (!selectedModel || !modelReady || !localModelPath) {
      Alert.alert('Model Not Ready', 'Please download the 3D model first');
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required for AR');
      return;
    }

    try {
      // For now, show an alert. Replace this with actual AR implementation
      Alert.alert(
        'AR Feature',
        'AR functionality will be implemented with a proper AR library like react-native-arcore or viro-react.',
        [{ text: 'OK' }]
      );
      
      // When you implement AR library, use something like:
      // await NativeARViewer.displayModel({
      //   modelUri: `file://${localModelPath}`,
      //   title: selectedModel.title,
      //   allowScaling: true,
      //   allowRotation: true,
      //   allowTranslation: true,
      //   planeDetection: true,
      //   lightEstimation: true,
      // });
    } catch (error) {
      console.error('AR launch error:', error);
      Alert.alert('AR Error', 'Failed to launch AR viewer: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Initializing AR...</Text>
      </SafeAreaView>
    );
  }

  if (!selectedModel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.background} />
          </TouchableOpacity>
          <Text style={styles.headerText}>AR Viewer</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={wp(15)} color={Colors.error} />
          <Text style={styles.errorText}>No model found for the recognized term</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.background} />
        </TouchableOpacity>
        <Text style={styles.headerText}>AR Learning Models</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Recognition Result Summary */}
          <View style={styles.recognitionSummary}>
            <Text style={styles.summaryTitle}>Recognition Result</Text>
            <Text style={styles.recognizedTerm}>{selectedModel.title}</Text>
            {confidence && (
              <Text style={styles.confidenceText}>Confidence: {confidence.toFixed(1)}%</Text>
            )}
          </View>

          {/* AR Support Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <MaterialCommunityIcons 
                name={isARSupported ? "check-circle" : "close-circle"} 
                size={24} 
                color={isARSupported ? Colors.success : Colors.error} 
              />
              <Text style={[styles.statusText, { color: isARSupported ? Colors.success : Colors.error }]}>
                AR {isARSupported ? 'Supported' : 'Not Supported'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <MaterialCommunityIcons 
                name={modelReady ? "check-circle" : "download"} 
                size={24} 
                color={modelReady ? Colors.success : Colors.warning} 
              />
              <Text style={[styles.statusText, { color: modelReady ? Colors.success : Colors.warning }]}>
                Model {modelReady ? 'Ready' : 'Download Required'}
              </Text>
            </View>
          </View>

          {/* Model Card */}
          <View style={styles.modelCard}>
            <View style={[styles.modelIcon, { backgroundColor: selectedModel.color + '20' }]}>
              <MaterialCommunityIcons 
                name={selectedModel.icon} 
                size={wp('8%')} 
                color={selectedModel.color} 
              />
            </View>
            <View style={styles.modelInfo}>
              <Text style={styles.modelTitle}>{selectedModel.title}</Text>
              <Text style={styles.modelDescription}>{selectedModel.description}</Text>
            </View>
          </View>

          {/* Download Progress */}
          {isDownloading && (
            <View style={styles.downloadContainer}>
              <Text style={styles.downloadText}>Downloading 3D Model...</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${modelDownloadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{modelDownloadProgress.toFixed(0)}%</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {!modelReady && !isDownloading && (
              <TouchableOpacity 
                style={[styles.downloadButton, !isARSupported && styles.disabledButton]} 
                onPress={downloadModel}
                disabled={!isARSupported || isDownloading}
              >
                <MaterialCommunityIcons name="download" size={24} color="white" />
                <Text style={styles.buttonText}>Download 3D Model</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[
                styles.arButton, 
                (!isARSupported || !modelReady || isDownloading) && styles.disabledButton
              ]} 
              onPress={launchAR}
              disabled={!isARSupported || !modelReady || isDownloading}
            >
              <MaterialCommunityIcons name="augmented-reality" size={24} color="white" />
              <Text style={styles.buttonText}>Launch AR Viewer</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>How to use AR:</Text>
            <Text style={styles.instructionText}>
              1. Ensure your device supports ARCore{'\n'}
              2. Download the 3D model{'\n'}
              3. Tap "Launch AR Viewer"{'\n'}
              4. Point your camera at a flat surface{'\n'}
              5. Tap to place the 3D model{'\n'}
              6. Use gestures to interact with the model
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isARSupported 
            ? "Point your camera at a flat surface to begin" 
            : "AR not supported on this device"
          }
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: wp('4%'),
    paddingTop: hp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: wp('4%'),
  },
  headerText: {
    color: Colors.background,
    fontSize: wp('6%'),
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: wp('4%'),
  },
  recognitionSummary: {
    backgroundColor: Colors.quinary,
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  summaryTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: hp('0.5%'),
  },
  recognizedTerm: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: hp('0.5%'),
  },
  confidenceText: {
    fontSize: wp('3.5%'),
    color: Colors.ternary,
  },
  statusContainer: {
    backgroundColor: Colors.background,
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  statusText: {
    marginLeft: wp('3%'),
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.quinary,
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modelIcon: {
    padding: wp('3%'),
    borderRadius: wp('3%'),
    marginRight: wp('3%'),
  },
  modelInfo: {
    flex: 1,
  },
  modelTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: hp('0.5%'),
  },
  modelDescription: {
    fontSize: wp('3.5%'),
    color: Colors.secondary,
  },
  downloadContainer: {
    backgroundColor: Colors.background,
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    elevation: 2,
  },
  downloadText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.quartery,
    borderRadius: 4,
    marginBottom: hp('1%'),
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: wp('3.5%'),
    color: Colors.ternary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: hp('2%'),
  },
  downloadButton: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1%'),
    elevation: 2,
  },
  arButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  instructions: {
    backgroundColor: Colors.background,
    padding: wp('4%'),
    borderRadius: wp('3%'),
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: hp('1%'),
  },
  instructionText: {
    fontSize: wp('3.5%'),
    color: Colors.secondary,
    lineHeight: wp('5%'),
  },
  footer: {
    backgroundColor: Colors.quinary,
    padding: wp('4%'),
    alignItems: 'center',
  },
  footerText: {
    color: Colors.secondary,
    fontSize: wp('3.5%'),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  errorText: {
    fontSize: wp('4%'),
    color: Colors.error,
    textAlign: 'center',
    marginVertical: hp('2%'),
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('3%'),
  },
});

export default ARViewerScreen;