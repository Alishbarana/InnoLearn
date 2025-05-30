 // src/AI/AIRecognitionUpdate.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../../styles/colors";

const AIRecognitionUpdate = ({ recognizedTerm, confidence, capturedImage }) => {
  const navigation = useNavigation();
  const displayTerms = {
    array: 'Array',
    tree: 'Tree',
    list: 'List',
    queue: 'Queue',
    stack: 'Stack',
    sort: 'Sort',
    // Add more terms as necessary
  };

  const resetCamera = () => {
    // Implement reset camera logic here
  };

  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.secondaryButton} onPress={resetCamera}>
        <Ionicons name="camera-outline" size={wp(5)} color={Colors.primary} />
        <Text style={styles.secondaryButtonText}>Take Another</Text>
      </TouchableOpacity>
      
      {/* Add AR Viewer Button */}
      <TouchableOpacity 
        style={styles.arViewerButton} 
        onPress={() => {
          if (recognizedTerm) {
            navigation.navigate("ARViewer", { 
              recognizedTerm: recognizedTerm,
              confidence: confidence,
              imageUri: capturedImage
            });
          }
        }}
        disabled={!recognizedTerm}
      >
        <MaterialCommunityIcons name="augmented-reality" size={wp(5)} color="#fff" />
        <Text style={styles.arViewerButtonText}>View in AR</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => {
          // Navigate to the content detail page with the recognized term
          if (recognizedTerm) {
            navigation.navigate("ContentDetail", { 
              title: displayTerms[recognizedTerm], 
              category: recognizedTerm.includes('array') || 
                       recognizedTerm.includes('tree') || 
                       recognizedTerm.includes('list') || 
                       recognizedTerm.includes('queue') || 
                       recognizedTerm.includes('stack') || 
                       recognizedTerm.includes('sort') 
                       ? "Data Structures" : "Computer Networking"
            });
          }
        }}
        disabled={!recognizedTerm}
      >
        <Ionicons name="book-outline" size={wp(5)} color="#fff" />
        <Text style={styles.primaryButtonText}>Learn About It</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'column', // Change to column to accommodate 3 buttons
    width: '100%',
    marginTop: hp(2),
  },
  arViewerButton: {
    backgroundColor: Colors.ternary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  arViewerButtonText: {
    color: '#fff',
    fontSize: wp(3.5),
    fontWeight: '600',
    marginLeft: wp(2),
  },
  // Update existing button styles to work with column layout
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: Colors.quartery,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(2),
  },
});

export default AIRecognitionUpdate;
