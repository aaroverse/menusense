# **App Name**: MenuSense

## Core Features:

- Image Upload and OCR: Upload a menu image, which is then processed using OCR to extract the text. The application will only accept JPG, PNG, and HEIC image formats, with a maximum file size of 10MB.
- Menu Item Translation: Translate the extracted menu item names into English.
- Dish Description Generation: Generate a short, appetizing description for each menu item based on its name.
- Recommendation Engine: Implement a method to analyze menu items and highlight a 'Must-Try!' dish based on the AI's assessment of its popularity or uniqueness from the provided menu context.
- User-Friendly Error Handling: Display clear, simple messages to the user for common failures. This includes:

- If OCR fails (e.g., blurry image): "Sorry, we couldn't read this menu. Please try a clearer, well-lit photo."

- If the server connection fails: "Oops! Something went wrong. Please check your connection and try again."

- If no menu items are found: "We couldn't seem to find any dishes in that photo. Please ensure the menu text is visible."
- Dynamic State Management: Manage the application's state (Ready, Processing, Result, Error) to show or hide elements dynamically on a single page.
- Result Display: Display the decoded menu items in a user-friendly list of cards, including the original name, translated name, and AI-generated description. Visually highlight the recommended dish.
- Webhook Communication: Send the image file to the specified URL (`http://srv858154.hstgr.cloud:5678/webhook-test/afb1492e-cda4-44d5-9906-f91d7525d003`) and process the JSON response to display menu items.
- Privacy Statement: Include a small, non-intrusive text link in the page footer that provides a simple privacy note, such as "Uploaded images are used only for processing and are not stored."

## Style Guidelines:

- Background color: Dark gray (`#121212`) to establish a modern, minimalist, dark theme.
- Primary color: Vibrant blue (`#2962FF`) for the call-to-action buttons, providing a visual focus and modern aesthetic.
- Accent color: Vibrant gold/yellow (`#FFD700`) for the recommended dish highlight, to ensure it stands out clearly as a special item.
- Font: 'Inter', a clean sans-serif font for a modern and readable design.
- Use minimalist line icons, particularly for the file upload button and the recommendation badge.
- Mobile-first, single-page layout with vertically and horizontally centered elements in the 'Ready State'.
- Subtle animations for the loading spinner in the 'Processing State' to indicate activity without being distracting.