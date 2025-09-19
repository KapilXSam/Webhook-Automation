
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
// FIX: Import GroundingSource type.
import type { GroundingSource } from '../types';

// The API key is assumed to be set in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Calls the Gemini API to summarize content from a given URL.
 * @param url The URL of the content to summarize.
 * @param modelName The specific AI model to use for the summarization.
 * @returns A promise that resolves to an object with the summary and grounding sources.
 */
export const summarizeContentFromUrl = async (url: string, modelName?: string): Promise<{ summary: string; sources: GroundingSource[] }> => {
  try {
    const prompt = `Please provide a concise summary of the content found at this URL: ${url}`;
    const modelToUse = modelName || 'gemini-2.5-flash';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    // When using googleSearch, you must also extract and display the URLs
    // from `response.candidates?.[0]?.groundingMetadata?.groundingChunks`.
    // FIX: Return both summary text and grounding sources as per API guidelines.
    const summary = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // FIX: Filter and map grounding chunks to conform to the GroundingSource type.
    // This ensures that only sources with a valid URI are passed to the UI,
    // and resolves the type mismatch between the API response and the app's types.
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web?.uri)
      .map(chunk => ({
        web: {
          uri: chunk.web!.uri!,
          title: chunk.web!.title,
        },
      }));

    return { summary, sources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("The model failed to generate a response.");
  }
};