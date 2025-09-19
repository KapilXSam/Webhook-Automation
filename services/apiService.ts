import type { GroundingSource } from '../types';

/**
 * Calls the secure backend API to summarize content from a given URL.
 * @param url The URL of the content to summarize.
 * @param modelName The specific AI model to use for the summarization.
 * @returns A promise that resolves to an object with the summary and grounding sources.
 */
export const summarizeUrlOnBackend = async (url: string, modelName?: string): Promise<{ summary: string; sources: GroundingSource[] }> => {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, modelName }),
  });

  if (!response.ok) {
    // Try to parse a JSON error message from the backend, otherwise fall back to status text.
    const errorData = await response.json().catch(() => ({ message: `Request failed: ${response.statusText}` }));
    throw new Error(errorData.message || 'An unknown server error occurred.');
  }

  return await response.json();
};
