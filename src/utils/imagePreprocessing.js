import { manipulateAsync, SaveFormat } from "react-native-image-manipulator";
import { getPixels } from "react-native-pixels";
import * as ort from "onnxruntime-react-native";

// Convert image to grayscale tensor with proper preprocessing
export const preprocessImage = async (imageUri) => {
  try {
    console.log("Preprocessing image:", imageUri)

    // Step 1: Resize image to 128x32 (width x height) as required by model
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 128, height: 32 } }],
      { format: SaveFormat.PNG, compress: 1.0 }
    );

    console.log("Image resized to 128x32")

    // Step 2: Get pixel data
    const { pixels } = await getPixels(manipResult.uri);

    // Step 3: Convert RGBA to grayscale and normalize
    const tensorData = new Float32Array(1 * 32 * 128);
    let idx = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      // Grayscale
      const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      // Normalize to [-1, 1]
      tensorData[idx++] = (gray - 0.5) / 0.5;
    }

    // Step 4: Create ONNX tensor with shape [1, 1, 32, 128]
    const inputTensor = new ort.Tensor("float32", tensorData, [1, 1, 32, 128]);
    console.log("Image preprocessing completed")
    return inputTensor;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
};
