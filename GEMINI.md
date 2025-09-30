# Project Overview

This is a Next.js web application called "MenuSense" that allows users to upload a picture of a menu and get it translated and explained. The application is built with Next.js, React, and TypeScript. It uses Tailwind CSS for styling and is configured for deployment on Vercel. The AI functionality is provided by an external webhook service, which is called through a proxy API route in the Next.js application.

## Key Technologies

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, shadcn/ui
- **AI:** Genkit (with Google AI) via an external webhook
- **Deployment:** Vercel

# Building and Running

## Development

To run the development server:

```bash
npm run dev
```

This will start the Next.js development server on port 9002.

## Building

To build the application for production:

```bash
npm run build
```

## Starting the production server

To start the production server:

```bash
npm run start
```

## Linting and Type Checking

To run the linter:

```bash
npm run lint
```

To run the type checker:

```bash
npm run typecheck
```

# Development Conventions

- The project uses `pnpm` as the package manager.
- The code is formatted using Prettier and ESLint.
- The project follows the standard Next.js project structure.
- The application state is managed using React hooks.
- Server-side logic is implemented in Next.js server actions and API routes.
- The AI functionality is abstracted behind a proxy API route, which calls an external webhook.

# Detailed Application Flow

The application is designed around a state machine managed in `src/app/page.tsx`, which orchestrates the user interface by rendering different components based on the current application state. Here’s a step-by-step breakdown of the entire process from the user's perspective:

### 1. Initial State: `ready`

- **`src/app/page.tsx`**: The `HomePage` component initializes with the `state` variable set to `'ready'`. The `file` is `null` and the `result` is an empty object.
- **Rendering**: The `renderContent` function evaluates the `'ready'` state and renders the `<ReadyView />` component.
- **`src/components/views/ready-view.tsx`**: This component displays the main UI, including the app title, a description, and a file upload area. It takes two key props from `page.tsx`: `onFileChange` and `onSubmit`.

### 2. User Uploads an Image

- **User Action**: The user either drags and drops an image onto the upload area or clicks it to open a file dialog.
- **`ready-view.tsx`**: The `<input type="file">`'s `onChange` event fires. This calls the `handleFileChange` function inside `ReadyView`, which in turn calls the `onFileChange` prop function passed down from `page.tsx`.
- **`page.tsx`**: The `handleFileChange` function updates the `file` state with the new `File` object. The UI re-renders to show the selected file's name and size, along with a button to remove it.

### 3. User Submits the Form

- **User Action**: The user clicks the "Decode Menu" button.
- **`ready-view.tsx`**: The `<form>`'s `onSubmit` event fires, calling the `handleSubmit` function inside `ReadyView`. This function prevents the default form submission and calls the `onSubmit` prop function from `page.tsx`.
- **`page.tsx`**: The `handleFormSubmit` function is executed.

### 4. Processing State: `processing`

- **`page.tsx`**: The first thing `handleFormSubmit` does is call `setState('processing')`. The UI immediately re-renders.
- **Rendering**: `renderContent` now sees the `'processing'` state and renders the `<ProcessingView />` component, which displays an animated loader and cycles through friendly messages like "Scanning the menu...".

### 5. Server-Side Action and Proxy

- **`page.tsx`**: `handleFormSubmit` creates a `FormData` object, appends the `file` to it under the key `'menuImage'`, and calls `await processMenuImage(formData)`.
- **`src/app/actions.ts` (`processMenuImage`)**: This is a Next.js Server Action. It runs exclusively on the server.
  1.  It performs validation checks (file exists, size, type).
  2.  It constructs the full URL for the internal proxy route (`/api/proxyWebhook`).
  3.  It uses `fetch` to make a `POST` request to its own app's proxy route, forwarding the `FormData` it received.
- **`src/app/api/proxyWebhook/route.ts`**: This API route also runs on the server.
  1.  It receives the request from the `processMenuImage` action.
  2.  It extracts the `File` from the `FormData`.
  3.  It creates a _new_ `FormData` object, appending the file under the key `'file'` (as expected by the external service).
  4.  It `fetch`es the external `WEBHOOK_URL`, sending the new `FormData`.

### 6. External AI Processing

- The external service at `http://srv858154.hstgr.cloud:5678/webhook/...` receives the image.
- It performs the AI magic: Optical Character Recognition (OCR), translation, and analysis using a model (likely Gemini, as hinted at in `src/ai/genkit.ts`).
- It returns a JSON response containing an `output` array of menu items, where each item is an object with `originalName`, `translatedName`, `description`, and `isRecommended` (matching the `WebhookMenuItem` type).

### 7. Response Propagation

- **`proxyWebhook/route.ts`**: It receives the JSON from the external webhook.
  1.  It validates the response to ensure it has the expected `output` array.
  2.  It wraps the `output` array in a `{ data: ... }` object to match the client's expectation and returns it as a `NextResponse`.
- **`actions.ts`**: The `processMenuImage` function receives the response from the proxy.
  1.  It parses the JSON.
  2.  It performs its own validation.
  3.  It returns the final `ActionResult` object (`{ data: [...] }` on success, or `{ error: "..." }` on failure) back to the client component.

### 8. Final State: `result` or `error`

- **`page.tsx`**: The `await processMenuImage(formData)` call completes, and the `response` object is received.
- **Success**: If `response.data` exists and is not empty, it calls `setResult({ data: response.data })` and then `setState('result')`.
- **Failure**: If `response.error` exists, it calls `setResult({ error: response.error })` and `setState('error')`.
- **Rendering**:
  - On `'result'`, `renderContent` renders the `<ResultView />` component, passing the `result.data` array to it. `ResultView` then maps over this array and renders a `<MenuItemCard />` for each item.
  - On `'error'`, `renderContent` renders the `<ErrorView />` component, passing it the `result.error` message to display.

### 9. Resetting

- **User Action**: The user can click the "Scan Another Menu" button in `<ResultView />` or the "Try Again" button in `<ErrorView />`.
- **`page.tsx`**: Both buttons call the `resetState` function, which sets the `state` back to `'ready'`, clears the `result` object, and sets the `file` back to `null`, bringing the application back to its initial state for a new upload.
