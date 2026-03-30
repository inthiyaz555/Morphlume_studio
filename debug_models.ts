import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyAIBEpxooeWd2jyKDVgClCtbO3AU0VRSiU";
const genAI = new GoogleGenAI(apiKey);

async function listModels() {
  try {
    // There is no direct "listModels" in the simple genAI object in some versions of the SDK,
    // but we can try to get a model and see if it fails, or use the fetch API.
    console.log("Attempting to list models via fetch...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available models:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
