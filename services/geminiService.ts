/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";

// Lazy initialization helper
// This prevents the app from crashing on load if the API key is missing.
// The error will only occur when trying to use AI features.
const getAiClient = () => {
  const localKey = localStorage.getItem('gemini_api_key');
  const apiKey = localKey || import.meta.env.VITE_API_KEY || (import.meta.env.API_KEY as string);

  if (!apiKey) {
    console.error("API Key is missing. Please check your .env file or Project Settings.");
    throw new Error("API Key is missing. Please configure it in Project Settings or .env file.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates an image using Gemini 2.5 Flash Image based on a text prompt.
 */
export const generateImageWithGemini = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001',
      contents: {
        parts: [
          {
            text: prompt
          }
        ]
      }
    });

    // Parse response to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in response.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

/**
 * Edits an image using Gemini 2.5 Flash Image.
 * Wraps the image and prompt to perform generative editing.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = getAiClient(); // Initialize here instead of top-level

    // clean base64 string if it has prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity or preserving source type logic if needed
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    // Parse response to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in response.");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};

/**
 * Analyzes a shot description or notes and suggests technical settings.
 * Uses Gemini 2.5 Flash for speed.
 */
export const suggestShotDetails = async (description: string): Promise<Partial<any>> => {
  try {
    const ai = getAiClient(); // Initialize here instead of top-level

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `You are a professional Director of Photography. 
      Based on this shot description: "${description}", 
      suggest a JSON object with the following keys: 
      - lens (string, e.g. "50mm")
      - aperture (string, e.g. "T2.8")
      - camera (string, generic pro camera)
      - lighting (string)
      - size (one of: "Extreme Long Shot", "Long Shot", "Medium Long Shot", "Medium Shot", "Medium Close-Up", "Close-Up", "Extreme Close-Up")
      - angle (one of: "Bird's Eye / Overhead", "High Angle", "Eye Level", "Low Angle", "Worm's Eye", "Dutch Angle")
      - movement (one of: "Static", "Pan", "Tilt", "Dolly In", "Dolly Out", "Zoom In", "Zoom Out", "Tracking", "Crane", "Steadicam", "Handheld")
      - framing (one of: "Single / Standard", "Two-Shot", "Over the Shoulder", "Point of View", "Insert Shot")
      - focus (one of: "Standard", "Deep Focus", "Rack Focus", "Shallow Focus")

      Return ONLY valid JSON. Do not use markdown code blocks.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return {};
  } catch (error) {
    console.error("Gemini Text Gen Error:", error);
    return {};
  }
};

/**
 * Translates an Italian description into a detailed English image generation prompt.
 */
export const generatePromptFromDescription = async (description: string): Promise<string> => {
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Act as an expert prompt engineer for AI image generation. 
      Translate the following Italian shot description into a highly detailed, cinematic English prompt suitable for a photorealistic movie shot.
      
      Italian Description: "${description}"
      
      Rules:
      1. Translate accurately to English.
      2. Enhance with cinematic keywords (e.g., "cinematic lighting", "photorealistic", "8k", "highly detailed").
      3. Describe lighting, mood, and texture if implied.
      4. Return ONLY the English prompt string, no other text.`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Prompt Gen Error:", error);
    return "";
  }
};