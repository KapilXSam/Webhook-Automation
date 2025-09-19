interface SseEventData {
    id: string;
    webhookId?: string;
    tempId?: string;
    url?: string;
    fileName?: string;
    inputType: 'url' | 'file';
    status: 'loading' | 'success' | 'error';
    summary: string;
    sources?: { uri: string; title: string }[];
}

export function listenForWebhookResults(onResult: (result: SseEventData) => void): () => void {
  const events = new EventSource('/api/events');

  events.onmessage = (event) => {
    try {
      const parsedData: SseEventData = JSON.parse(event.data);
      onResult(parsedData);
    } catch (error) { // FIX: Added curly braces to the catch block for correct syntax.
      console.error('Error parsing SSE event data:', error);
    }
  };

  events.onerror = (err) => {
    console.error('EventSource failed:', err);
    // The browser will automatically attempt to reconnect.
    // No need to close the connection here.
  };

  // Return a cleanup function to close the connection
  return () => {
    events.close();
  };
}

export async function testWebhook(webhookId: string, serverUrl: string): Promise<Response> {
  const url = `${serverUrl}/api/webhook/${webhookId}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: 'https://en.wikipedia.org/wiki/Webhook' }), // Use a real example URL for better summaries
  });
}


function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); // Remove the data URI prefix
        reader.onerror = error => reject(error);
    });
}

export async function analyzeFile(
    file: File,
    prompt: string,
    webhookName: string,
    tempId: string
): Promise<Response> {
    const fileData = await fileToBase64(file);
    return fetch('/api/analyze-file', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fileData,
            mimeType: file.type,
            fileName: file.name,
            prompt,
            webhookName,
            tempId,
        }),
    });
}
