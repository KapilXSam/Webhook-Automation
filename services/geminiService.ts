import { GoogleGenAI } from "@google/genai";
import { WebhookSource } from '../types';

// Initialize the Gemini client.
// The API key MUST be available as an environment variable.
if (!process.env.API_KEY) {
  // In a real app, you'd want more robust error handling or startup checks.
  // For this context, we'll log an error.
  console.error("API_KEY environment variable not set. Gemini API will not be available.");
}
// FIX: Initialize GoogleGenAI with apiKey from environment variables, which resolves original parsing errors.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface SummarizeResult {
  summary: string;
  sources: WebhookSource[];
}

/**
 * Generates a summary of the given text content using a specified Gemini model.
 * It uses Google Search grounding to provide sources for its summary.
 *
 * @param content The text content to summarize.
 * @param model The Gemini model to use (e.g., 'gemini-2.5-flash').
 * @returns A promise that resolves to an object containing the summary and sources.
 */
export async function generateSummaryWithSources(
  content: string,
  model: string
): Promise<SummarizeResult> {
  if (!process.env.API_KEY) {
      throw new Error("Gemini API key is not configured on the server.");
  }
    
  try {
    const prompt = `Please summarize the following content. Provide a concise but comprehensive summary that captures the key points and main ideas presented.
    
    Content to summarize:
    ---
    ${content}
    ---
    
    Summary:`;
    
    // FIX: Call generateContent with the correct parameters, including Google Search for grounding.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // FIX: Extract summary text directly from response.text property as per guidelines.
    const summary = response.text;
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: WebhookSource[] = [];
    
    // FIX: Extract sources from grounding chunks as per API guidelines.
    if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web) {
                 sources.push({
                    uri: chunk.web.uri || '',
                    title: chunk.web.title || 'Untitled',
                });
            }
        }
    }
    
    // Deduplicate sources based on URI to provide a clean list.
    const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

    return {
      summary,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    // In a real app, you might want to handle different error types from the API.
    if (error instanceof Error) {
        throw new Error(`Failed to generate summary: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the summary.");
  }
}
