import { NextResponse } from 'next/server';

const WEBHOOK_URL = 'http://srv858154.hstgr.cloud:5678/webhook/afb1492e-cda4-44d5-9906-f91d7525d003'; // Production
// const WEBHOOK_URL = 'http://srv858154.hstgr.cloud:5678/webhook-test/afb1492e-cda4-44d5-9906-f91d7525d003'; // Test
const REQUEST_TIMEOUT = 85000; // Slightly less than the client-side timeout

// The expected structure from the webhook
type WebhookMenuItem = {
  originalName: string;
  translatedName: string;
  description: string;
  isRecommended: boolean;
};

type WebhookResponse = {
  output: WebhookMenuItem[];
};

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const requestFormData = await request.formData();
    const file = requestFormData.get('menuImage') as File | null;
    const targetLanguage = requestFormData.get('targetLanguage') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file found in the request.' }, { status: 400 });
    }

    // Create a new FormData and append the file with the key 'file' as expected by the webhook.
    const webhookFormData = new FormData();
    webhookFormData.append('file', file);
    if (targetLanguage) {
      webhookFormData.append('targetLanguage', targetLanguage);
    }

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: webhookFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!webhookResponse.ok) {
      const errorBody = await webhookResponse.text();
      console.error(`Webhook error (status ${webhookResponse.status}):`, errorBody);
       return NextResponse.json({ error: "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo." }, { status: webhookResponse.status });
    }

    const jsonResponse: WebhookResponse | { error: string } = await webhookResponse.json();

    if ('error' in jsonResponse || !('output' in jsonResponse) || !Array.isArray(jsonResponse.output)) {
         console.error('Invalid response from webhook:', jsonResponse);
         return NextResponse.json({ error: "We couldn't find any dishes in that photo. Please ensure the menu text is visible." }, { status: 500 });
    }
    
    // The client expects a 'data' field, so we wrap the webhook output.
    return NextResponse.json({ data: jsonResponse.output });

  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error('Webhook request timed out');
      return NextResponse.json({ error: 'The request to the menu processor timed out. Please try again.' }, { status: 504 });
    }
    console.error('Error in proxy route:', e);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
