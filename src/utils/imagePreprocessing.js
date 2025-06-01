import ImageResizer from "@bam.tech/react-native-image-resizer";
import RNFS from "react-native-fs";
import { PNG } from "pngjs/browser";
import { Buffer } from "buffer";
import * as ort from "onnxruntime-react-native";

// Convert image to grayscale tensor with proper preprocessing
export const preprocessImage = async (imageUri) => {
  try {
    console.log("Preprocessing image:", imageUri);

    // Step 1: Resize image to 128x32 (width x height) as required by model
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      128,
      32,
      "PNG",
      100,
      0,
      undefined,
      false // set 'onlyScaleDown' to false to force resize
    );
    console.log("Image resized to 128x32:", resizedImage.uri);

    // Step 2: Read file as base64
    const base64 = await RNFS.readFile(
      resizedImage.uri.replace("file://", ""),
      "base64"
    );

    // Step 3: Decode PNG using pngjs with Buffer
    const buffer = Buffer.from(base64, "base64");
    const png = PNG.sync.read(buffer);
    console.log("Decoded PNG size:", png.width, png.height);

    // Step 3.5: If not 128x32, crop or pad to 128x32
    let { width, height, data } = png;
    if (width !== 128 || height !== 32) {
      // Create a blank 128x32 image and copy/crop the decoded image into it
      const fixed = new PNG({ width: 128, height: 32 });
      PNG.bitblt(
        png,
        fixed,
        0, 0, // src x, y
        Math.min(width, 128), Math.min(height, 32), // src w, h
        0, 0  // dest x, y
      );
      width = 128;
      height = 32;
      data = fixed.data;
      console.log("Image cropped/padded to 128x32");
    }

    // Step 4: Convert RGBA to grayscale and normalize
    const tensorData = new Float32Array(1 * height * width);
    let idx = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      tensorData[idx++] = (gray - 0.5) / 0.5;
    }

    // Step 5: Create ONNX tensor with shape [1, 1, 32, 128]
    const inputTensor = new ort.Tensor("float32", tensorData, [1, 1, 32, 128]);
    console.log("Image preprocessing completed");
    return inputTensor;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
};
