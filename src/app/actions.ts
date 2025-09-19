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
const WEBHOOK_URL = 'http://srv858154.hstgr.cloud:5678/webhook/afb1492e-cda4-44d5-9906-f91d7525d003';
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
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData, // Directly forward the original FormData
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        // Handle non-2xx responses
        const errorBody = await response.text();
        console.error(`Webhook error response (status ${response.status}): ${errorBody}`);
        if (response.status >= 400 && response.status < 500) {
            return { error: "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo." };
        }
        return { error: 'Oops! Something went wrong on our end. Please check your connection and try again.' };
    }

    const jsonResponse: WebhookResponse | { error: string } = await response.json();
    
    console.log('Webhook response:', JSON.stringify(jsonResponse, null, 2));

    if (!jsonResponse || typeof jsonResponse !== 'object') {
        return { error: "We received an invalid response from our server. Please try again." };
    }

    if ('error' in jsonResponse) {
      return { error: "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo." };
    }

    if (!('output' in jsonResponse) || !Array.isArray(jsonResponse.output) || jsonResponse.output.length === 0) {
      console.error('Invalid or empty menu items in webhook response:', jsonResponse);
      return { error: "We couldn't find any dishes in that photo. Please ensure the menu text is visible." };
    }

    const menuItems = jsonResponse.output;

    const clientData: ClientMenuItem[] = menuItems.map((item) => ({
      originalName: item.originalName,
      translatedName: item.translatedName,
      description: item.description,
      isRecommended: item.isRecommended,
    }));

    return { data: clientData };
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error('Request timed out');
      return { error: 'The request took too long and timed out. Please try again with a smaller image or better connection.' };
    }
    console.error('Error in processMenuImage:', e);
    return { error: 'Oops! Something went wrong. Please check your connection and try again.' };
  }
}
