// Load environment variables from .env file for local development
require('dotenv').config();
const path = require('path');
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security: API Key Configuration ---
// The Gemini API key is loaded from the .env file for local development
// or from the hosting environment's secrets in production.
const apiKey = process.env.API_KEY;

// Critical validation: The application cannot start without a valid API key.
// This prevents the server from running in a misconfigured state.
if (!apiKey) {
  console.error("FATAL ERROR: API_KEY environment variable is missing.");
  console.error("Please create a .env file and add API_KEY='your_key_here' or set it in your hosting environment.");
  process.exit(1); // Exit the process with an error code
}

// Initialize the Gemini AI Client with the validated API key
const ai = new GoogleGenAI({ apiKey });


// --- Middleware ---
// Parse JSON bodies for API requests
app.use(express.json());
// Serve the static frontend assets. In production, this will be your build output (e.g., 'dist' or 'build' folder).
// For this project structure, we assume assets are in the root.
app.use(express.static(path.join(__dirname, '')));


// --- API Endpoint ---
app.post('/api/summarize', async (req, res) => {
  const { url, modelName } = req.body;

  // 1. Input Validation
  if (!url) {
    return res.status(400).json({ message: 'URL is required.' });
  }
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid URL format provided.' });
  }

  try {
    // 2. Call the Gemini API with Google Search grounding
    const prompt = `Please provide a concise summary of the content found at this URL: ${url}`;
    
    const response = await ai.models.generateContent({
      model: modelName || 'gemini-2.5-flash',
      contents: prompt,
      // Using googleSearch is essential for accessing live web pages.
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const summary = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // 3. Format the sources as required by the frontend
    const sources = groundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => ({
        web: {
          uri: chunk.web.uri,
          title: chunk.web.title || ''
        }
      }));

    // 4. Send the successful response back to the frontend
    res.json({ summary, sources });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Failed to generate summary due to a server error.' });
  }
});


// --- Serve Frontend ---
// For any GET request that doesn't match a static file or API route,
// send back the main index.html file. This allows for client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running securely on http://localhost:${PORT}`);
});