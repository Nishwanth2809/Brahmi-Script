# ⚛️ React Frontend Prompts — Brahmi Script Recognition

> Use these prompts with any AI coding tool (Copilot, ChatGPT, Cursor, etc.)
> to build a React frontend for this project.

---

## 📌 Project Context (Paste this before any prompt)

```
I have a Python/Flask backend for an AI-Based Brahmi Script Recognition and Translation System.
The backend:
- Accepts image uploads (PNG/JPG/JPEG)
- Segments Brahmi characters from the image using OpenCV
- Classifies each character using a TensorFlow CNN model
- Translates characters to Telugu, Tamil, and Devanagari (Hindi)
- Returns character labels, confidence scores, and translations

I want to build a modern React frontend that communicates with this backend via REST API.
```

---

## 🔰 Prompt 1 — Project Setup

```
Create a new React app using Vite for a Brahmi Script Recognition frontend.
Set up the following folder structure:
- src/
  - components/
  - pages/
  - services/
  - assets/
- Use React Router for navigation
- Use Axios for API calls
- Add a global CSS reset
- Use Google Fonts (Inter or Outfit)
```

---

## 🖼️ Prompt 2 — Image Upload Component

```
Create a React component called <ImageUploader /> that:
- Has a drag-and-drop zone to upload an image (PNG, JPG, JPEG only)
- Shows a preview of the uploaded image
- Has a "Process Image" button that triggers the API call
- Shows a loading spinner while waiting for results
- Displays an error message if the image is invalid (not Brahmi script)
- Uses useState and useRef hooks
```

---

## 📡 Prompt 3 — API Service

```
Create an API service file (src/services/api.js) using Axios that:
- Has a base URL pointing to http://localhost:5000
- Exports a function called `processImage(imageFile)` that:
  - Sends a POST request to /api/process with the image as FormData
  - Returns the JSON response
  - Handles errors gracefully
```

---

## 🔲 Prompt 4 — Character Grid Component

```
Create a React component called <CharacterGrid /> that receives an array of predictions:
[
  {
    label: "ka",
    confidence: 0.95,
    char_image: "<base64_string>",
    telugu: "క",
    tamil: "க",
    hindi: "क"
  },
  ...
]

Display them in a responsive 6-column grid where each card shows:
- The character image (from base64)
- The Brahmi label in bold
- Confidence score as a percentage badge
- Telugu, Tamil, Hindi translations below
Use CSS Grid for layout.
```

---

## 📝 Prompt 5 — Translation Summary Panel

```
Create a React component called <TranslationPanel /> that receives:
- teluguSequence: string (e.g., "క ఖ గ")
- tamilSequence: string
- hindiSequence: string

Display each in a styled card with:
- Language name as header (with flag emoji 🇮🇳)
- The translated text in a large readable font
- A "Copy to Clipboard" button for each language
- A success toast notification when copied
```

---

## 🖼️ Prompt 6 — Tracked Image Viewer

```
Create a React component called <TrackedImageViewer /> that:
- Receives the original image URL and a tracked/annotated image URL (base64 or blob)
- Shows both images side by side using CSS Grid layout
- Labels them as "Original Image" and "Detected Characters"
- On mobile, stacks them vertically
- Adds a subtle border and shadow to each image card
```

---

## 🏠 Prompt 7 — Home Page Layout

```
Create a HomePage component in React that assembles all components in this order:
1. <Header /> — App title: "AI-Based Brahmi Script Recognition" with a subtitle
2. <ImageUploader /> — For uploading images
3. <TrackedImageViewer /> — Shown only after processing
4. <CharacterGrid /> — Shown only after processing
5. <TranslationPanel /> — Shown only after processing

Use conditional rendering (show results only when API response is available).
Use a centered max-width layout (800px).
Add smooth fade-in animation when results appear.
```

---

## 🎨 Prompt 8 — Styling & Theme

```
Create a dark-themed CSS design system for the Brahmi Recognition app with:
- Background: deep navy (#0f0f1a)
- Accent: golden/amber (#f5a623) to reflect ancient script aesthetics
- Cards: glassmorphism style (semi-transparent with blur)
- Fonts: Google Fonts "Outfit" for UI, "Noto Sans" for Indic script rendering
- Smooth hover effects on buttons and cards
- Responsive breakpoints for mobile and tablet
```

---

## 🔗 Prompt 9 — Flask Backend API Endpoints (for connecting React)

```
Add the following Flask API endpoint to the Python backend so the React app can call it:

POST /api/process
- Accepts multipart/form-data with field "image"
- Returns JSON:
  {
    "predictions": [
      {
        "label": "ka",
        "confidence": 0.95,
        "char_image": "<base64>",
        "telugu": "క",
        "tamil": "க",
        "hindi": "क"
      }
    ],
    "tracked_image": "<base64>",
    "telugu_sequence": "క ఖ",
    "tamil_sequence": "க ககா",
    "hindi_sequence": "क ख"
  }

Also add CORS support using flask-cors so React (localhost:3000) can call it.
```

---

## 🌐 Prompt 10 — Full App Integration

```
Wire everything together in a React app:
- App.jsx should use React Router with a single "/" route for HomePage
- On image upload + "Process Image" click:
  1. Call processImage() from api.js
  2. Store response in React state
  3. Render <TrackedImageViewer />, <CharacterGrid />, <TranslationPanel /> with response data
- Handle errors: show a red alert banner if response contains an error message
- Handle loading: show a spinner overlay during API call
- Use useReducer or useState for managing app state
```

---

## 💡 Tips for React Developer

- Run backend on port **5000**, React dev server on port **3000**
- Add a proxy in `vite.config.js`:
  ```js
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
  ```
- Use `encodeURIComponent` for base64 images if needed
- Use `react-hot-toast` for notifications
- Use `framer-motion` for animations
