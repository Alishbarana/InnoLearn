import ImageResizer from "@bam.tech/react-native-image-resizer";
import RNFS from "react-native-fs";
import { PNG } from "pngjs/browser";
import { Buffer } from "buffer";
import * as ort from "onnxruntime-react-native";

export const preprocessImage = async (imageUri) => {
  try {
    console.log("Preprocessing image:", imageUri);

    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      128,
      32,
      "PNG",
      100,
      0,
      undefined,
      false
    );
    console.log("Image resized to 128x32:", resizedImage.uri);

    const base64 = await RNFS.readFile(
      resizedImage.uri.replace("file://", ""),
      "base64"
    );

    const buffer = Buffer.from(base64, "base64");
    const png = PNG.sync.read(buffer);
    console.log("Decoded PNG size:", png.width, png.height);

    let { width, height, data } = png;
    if (width !== 128 || height !== 32) {
      const fixed = new PNG({ width: 128, height: 32 });
      PNG.bitblt(
        png,
        fixed,
        0, 0,
        Math.min(width, 128), Math.min(height, 32),
        0, 0
      );
      width = 128;
      height = 32;
      data = fixed.data;
      console.log("Image cropped/padded to 128x32");
    }

    const tensorData = new Float32Array(1 * height * width);
    let idx = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
      tensorData[idx++] = gray; // no normalization here — model expects [0,1]
    }

    const inputTensor = new ort.Tensor("float32", tensorData, [1, 1, 32, 128]);
    console.log("Image preprocessing completed");
    return inputTensor;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
};
