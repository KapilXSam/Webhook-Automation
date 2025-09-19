const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

// 1. Securely load and validate the API key at startup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY or API_KEY environment variable is not set.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase body limit for file uploads
app.use(express.static(__dirname)); // Serve static files from the project root

// --- Real-time SSE (Server-Sent Events) Setup ---
let clients = [];
let eventsHistory = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);
  
  // Immediately send the history of events to the new client
  eventsHistory.forEach(event => newClient.res.write(`data: ${JSON.stringify(event)}\n\n`));

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

function sendEvent(data) {
  // Store the event in history (and cap its size)
  eventsHistory.push(data);
  if (eventsHistory.length > 20) {
    eventsHistory.shift();
  }
  // Broadcast the event to all connected clients
  clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

// --- Gemini Helper Functions ---
async function getUrlSummary(url, model = 'gemini-2.5-flash') {
    const prompt = `Please provide a concise summary of the content found at this URL: ${url}`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
    });

    const summary = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri,
        }));
    return { summary, sources };
}

async function analyzeFileData(fileData, mimeType, prompt, model = 'gemini-2.5-flash') {
    const imagePart = {
      inlineData: { data: fileData, mimeType },
    };
    const textPart = { text: prompt };
    
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, textPart] },
    });
    
    return { summary: response.text, sources: [] }; // No web sources for file analysis
}

// --- API Endpoints ---

// Handles both external webhook triggers and internal "Test" button clicks
app.post('/api/webhook/:id', async (req, res) => {
  const { id: webhookId } = req.params;
  const { url, webhookName, tempId } = req.body; // tempId is sent from the frontend test button

  if (!url) return res.status(400).json({ message: 'URL is required in the request body.' });
  try { new URL(url); } catch (error) { return res.status(400).json({ message: 'Invalid URL format.' }); }

  res.status(202).json({ message: 'Webhook received. Processing started.' });
  
  try {
    const { summary, sources } = await getUrlSummary(url);
    sendEvent({
      id: `res_${Date.now()}`,
      tempId,
      webhookId,
      status: 'success',
      summary,
      sources,
      url,
      inputType: 'url',
      webhookName: webhookName || webhookId,
    });
  } catch (error) {
    console.error(`Error processing webhook ${webhookId}:`, error);
    sendEvent({
      id: `res_${Date.now()}`,
      tempId,
      webhookId,
      status: 'error',
      summary: error instanceof Error ? error.message : 'An unknown error occurred during AI processing.',
      sources: [],
      url,
      inputType: 'url',
      webhookName: webhookName || webhookId,
    });
  }
});

app.post('/api/analyze-file', async (req, res) => {
    const { fileData, mimeType, fileName, prompt, webhookName, tempId } = req.body;

    if (!fileData || !mimeType || !prompt) {
        return res.status(400).json({ message: 'Missing fileData, mimeType, or prompt.' });
    }
    
    res.status(202).json({ message: 'File received. Processing started.' });

    try {
        const { summary, sources } = await analyzeFileData(fileData, mimeType, prompt);
        sendEvent({
            id: `res_${Date.now()}`,
            tempId,
            status: 'success',
            summary,
            sources,
            fileName,
            inputType: 'file',
            webhookName,
        });
    } catch (error) {
        console.error('Error analyzing file:', error);
        sendEvent({
            id: `res_${Date.now()}`,
            tempId,
            status: 'error',
            summary: error instanceof Error ? error.message : 'An unknown error occurred during file analysis.',
            sources: [],
            fileName,
            inputType: 'file',
            webhookName,
        });
    }
});

// --- Frontend Serving ---
// This catch-all route ensures that any request that doesn't match an API endpoint
// will be served the main index.html file, allowing React Router to handle the URL.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});