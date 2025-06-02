import { useEffect, useState, useCallback, useRef } from "react";
import * as ort from "onnxruntime-react-native";
import RNFS from "react-native-fs";
import { preprocessImage } from "../utils/imagePreprocessing";

const CLASS_LABELS = [
  "array",
  "binary_tree",
  "client_server",
  "firewall",
  "linked_list",
  "merge_sort",
  "osi_model",
  "queue",
  "router",
  "stack",
];

export const useONNXClassifier = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const sessionRef = useRef(null);

  const loadModel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading ONNX model...");

      const modelDestPath = `${RNFS.DocumentDirectoryPath}/word_classifier.onnx`;
      const modelExists = await RNFS.exists(modelDestPath);

      if (!modelExists) {
        console.log("Copying model from assets...");
        await RNFS.copyFileAssets("models/word_classifier.onnx", modelDestPath);
        console.log("Model copied successfully");
      }

      const sess = await ort.InferenceSession.create(modelDestPath);
      setSession(sess);
      sessionRef.current = sess;
      setLoading(false);

      console.log("ONNX model loaded successfully");
    } catch (err) {
      console.error("Failed to load ONNX model:", err);
      setError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModel();
    return () => {
      if (sessionRef.current) {
        sessionRef.current = null;
      }
    };
  }, [loadModel]);

  const applySoftmax = useCallback((logits) => {
    const expValues = logits.map((val) => Math.exp(val));
    const sumExp = expValues.reduce((acc, val) => acc + val, 0);
    return expValues.map((val) => val / sumExp);
  }, []);

  const classifyImage = useCallback(
    async (imageUri) => {
      if (!session) {
        throw new Error("ONNX session not initialized. Please wait for model to load.");
      }

      if (isProcessing) {
        throw new Error("Classification already in progress");
      }

      try {
        setIsProcessing(true);
        setError(null);

        console.log("Starting image classification...");

        const inputTensor = await preprocessImage(imageUri);
        const inputName = session.inputNames[0];
        const feeds = { [inputName]: inputTensor };

        console.log("Running ONNX inference...");
        const results = await session.run(feeds);
        const outputName = session.outputNames[0];
        const outputData = Array.from(results[outputName].data);

        console.log("Raw model output:", outputData);

        let maxScore = outputData[0];
        let maxIndex = 0;

        for (let i = 1; i < outputData.length; i++) {
          if (outputData[i] > maxScore) {
            maxScore = outputData[i];
            maxIndex = i;
          }
        }

        const probabilities = applySoftmax(outputData);
        const confidence = probabilities[maxIndex] * 100;

        console.log("Softmax probabilities:", probabilities);

        const recognizedTerm = CLASS_LABELS[maxIndex];

        const allProbabilities = probabilities
          .map((prob, idx) => ({
            label: CLASS_LABELS[idx],
            probability: prob * 100,
          }))
          .sort((a, b) => b.probability - a.probability);

        const result = {
          recognizedTerm,
          confidence,
          allProbabilities,
          rawLogits: outputData,
        };

        console.log("Classification result:", result);

        setIsProcessing(false);
        return result;
      } catch (err) {
        console.error("Classification failed:", err);
        setError(err);
        setIsProcessing(false);
        throw err;
      }
    },
    [session, isProcessing, applySoftmax],
  );

  const retryLoadModel = useCallback(() => {
    setError(null);
    loadModel();
  }, [loadModel]);

  const isReady = !loading && !error && session !== null;

  return {
    classifyImage,
    loading,
    error,
    isProcessing,
    isReady,
    retryLoadModel,
    modelLoaded: !!session,
  };
};

export default useONNXClassifier;
