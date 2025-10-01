'use server';

import type { ClientMenuItem } from '@/lib/definitions';

// The expected structure from the webhook
type WebhookMenuItem = {
  originalName: string;
  translatedName: string;
  description: string;
  isRecommended: boolean;
};

// The new expected webhook response structure
type WebhookResponse = {
  output: WebhookMenuItem[];
};


export type ActionResult = {
  data?: ClientMenuItem[];
  error?: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
// The WEBHOOK_URL now points to our internal proxy.
const PROXY_URL = '/api/proxyWebhook';
const REQUEST_TIMEOUT = 90000; // 90 seconds

export async function processMenuImage(formData: FormData): Promise<ActionResult> {
  const file = formData.get('menuImage') as File | null;

  if (!file || file.size === 0) {
    return { error: 'Please select an image to upload.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File is too large. Maximum size is 10MB.' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
     return { error: `Invalid file type. Please upload a JPG, PNG, or HEIC file. Detected type: ${file.type}` };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    // We get the absolute URL for the proxy endpoint to make the fetch call from the server action.
    // process.env.NEXT_PUBLIC_URL will need to be set in your environment.
    // For Firebase Hosting, this is often automatically set.
    const host = process.env.URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:9002');
    const proxyEndpoint = new URL(PROXY_URL, host).toString();


    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      body: formData, // Send the original FormData
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Proxy error response (status ${response.status}): ${errorBody}`);
        try {
            const errorJson = JSON.parse(errorBody);
            return { error: errorJson.error || 'An unexpected error occurred with the proxy.' };
        } catch (e) {
            return { error: "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo." };
        }
    }

    const jsonResponse: { data?: ClientMenuItem[], error?: string } = await response.json();
    
    console.log('Proxy response:', JSON.stringify(jsonResponse, null, 2));

    if (jsonResponse.error) {
      return { error: jsonResponse.error };
    }

    if (!jsonResponse.data || jsonResponse.data.length === 0) {
      console.error('Invalid or empty menu items from proxy:', jsonResponse);
      return { error: "We couldn't find any dishes in that photo. Please ensure the menu text is visible." };
    }

    return { data: jsonResponse.data };
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error('Request to proxy timed out');
      return { error: 'The request took too long and timed out. Please try again with a smaller image or better connection.' };
    }
    console.error('Error in processMenuImage calling proxy:', e);
    return { error: 'Oops! Something went wrong. Please check your connection and try again.' };
  }
}
