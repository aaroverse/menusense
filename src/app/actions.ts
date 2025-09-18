'use server';

import type { ClientMenuItem } from '@/lib/definitions';

// The expected structure from the webhook
type WebhookMenuItem = {
  originalName: string;
  translatedName: string;
  description: string;
  isRecommended: boolean;
};

type WebhookResponse = {
  output: {
    data: {
      menuItems: WebhookMenuItem[];
    };
  };
}[];

export type ActionResult = {
  data?: ClientMenuItem[];
  error?: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const WEBHOOK_URL = 'http://srv858154.hstgr.cloud:5678/webhook-test/afb1492e-cda4-44d5-9906-f91d7525d003';
const REQUEST_TIMEOUT = 30000; // 30 seconds

export async function processMenuImage(formData: FormData): Promise<ActionResult> {
  const file = formData.get('menuImage') as File | null;

  if (!file || file.size === 0) {
    return { error: 'Please select an image to upload.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File is too large. Maximum size is 10MB.' };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
     return { error: 'Invalid file type. Please upload a JPG, PNG, or HEIC file.' };
  }

  const body = new FormData();
  body.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
            return { error: "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo." };
        }
      return { error: 'Oops! Something went wrong on our end. Please check your connection and try again.' };
    }

    const jsonResponse: WebhookResponse | { error: string } | undefined = await response.json();

    if (!jsonResponse) {
        return { error: "We couldn't find any dishes in that photo. Please ensure the menu text is visible." };
    }

    if ('error' in jsonResponse) {
      return { error: "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo." };
    }

    if (!Array.isArray(jsonResponse) || jsonResponse.length === 0 || !jsonResponse[0].output?.data?.menuItems) {
      return { error: "We couldn't find any dishes in the response. Please ensure the menu text is visible." };
    }

    const menuItems = jsonResponse[0].output.data.menuItems;

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
      return { error: 'The request took too long. Please try again with a smaller image or better connection.' };
    }
    console.error(e);
    return { error: 'Oops! Something went wrong. Please check your connection and try again.' };
  }
}
