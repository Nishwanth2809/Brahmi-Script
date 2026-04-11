# 🕉️ AI-Based Brahmi Script Recognition and Translation System

AI-powered Brahmi script recognition and transliteration system with a React frontend and Flask API. The app accepts an image of Brahmi text, segments characters, predicts each character with a TensorFlow model, and returns transliterations in Telugu, Tamil, and Devanagari/Hindi.

## Features

- Upload Brahmi script images from a browser UI.
- Segment individual characters with OpenCV.
- Classify characters with a TensorFlow/Keras CNN model.
- Transliterate recognized characters to Telugu, Tamil, and Devanagari/Hindi.
- Show the original image, tracked/boxed output, per-character confidence, and translated text.
- Training and dataset generation scripts are included for experimentation.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Flask, Flask-CORS |
| ML / Vision | TensorFlow/Keras, OpenCV, NumPy, Pillow |

## Project Structure

```text
Brahmi-Script/
|-- api.py                         # Flask API and production frontend server
|-- mapping.py                     # Brahmi to Telugu/Tamil/Hindi mappings
|-- generate_dataset.py            # Synthetic dataset generator
|-- train.py                       # CNN training script
|-- test.py                        # Local model test script
|-- class_labels.json              # Model label order
|-- requirements.txt               # Python dependencies
|-- NotoSansBrahmi-Regular.ttf     # Brahmi font used for dataset generation
|-- front-end/
|   |-- index.html
|   |-- package.json
|   |-- src/                       # React application source
|   |-- public/                    # Public logo/favicon assets
|   `-- vite.config.ts
`-- .gitignore
```

Ignored local assets:

- `brahmi_model.h5`
- `dataset/`
- `.venv/`
- `front-end/node_modules/`
- `front-end/dist/`

The model and dataset can be large, so they are not committed to Git. Place `brahmi_model.h5` in the project root before running inference, or regenerate it with the training commands below.

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Nishwanth2809/Brahmi-Script.git
cd Brahmi-Script
```

### 2. Set up the Python backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Make sure `brahmi_model.h5` exists in the project root. If it does not, generate a dataset and train the model first.

### 3. Set up the React frontend

```bash
cd front-end
npm install
npm run dev
```

The Vite dev server runs on:

```text
http://localhost:8080
```

### 4. Run the Flask API

In a second terminal from the project root:

```bash
.venv\Scripts\activate
python api.py
```

The API runs on:

```text
http://localhost:5000
```

The frontend is configured to proxy `/api` requests to the Flask server during development.

## Production-Style Run

Build the frontend first:

```bash
cd front-end
npm install
npm run build
```

Then run the Flask server from the project root:

```bash
python api.py
```

When `front-end/dist` exists, Flask serves the built React app and API together from:

```text
http://localhost:5000
```

## Deploy Frontend on Vercel

This repository's Vercel app should use the `front-end` folder as the project root.

Vercel settings:

```text
Framework Preset: Vite
Root Directory: front-end
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

If your Flask backend is deployed separately, add this Vercel environment variable:

```text
VITE_API_BASE_URL=https://your-backend-url
```

Leave `VITE_API_BASE_URL` empty for local development. The local Vite server uses the proxy in `front-end/vite.config.ts` and sends `/api` requests to `http://localhost:5000`.

Note: the TensorFlow model file `brahmi_model.h5` is ignored by Git and can be too large for a simple Vercel static frontend deployment. Deploy the Flask API on a backend-friendly host, then point `VITE_API_BASE_URL` to that backend URL.

## Deploy Backend

The backend can run on any Python web host that supports TensorFlow wheels. This repo includes:

- `vercel.json` for an experimental Vercel Python function deployment.
- `render.yaml` for Render web service deployment.

Recommended Render settings:

```text
Build Command: pip install -r requirements.txt
Start Command: gunicorn api:app --bind 0.0.0.0:$PORT
Health Check Path: /api/health
```

After the backend is live, set the frontend environment variable in Vercel:

```text
VITE_API_BASE_URL=https://your-backend-url
```

## API

Health check:

```http
GET /api/health
```

Process an image:

```http
POST /api/process
```

Send the uploaded file as multipart form data with the field name `image`.

## Model Training

Generate a synthetic dataset:

```bash
python generate_dataset.py --clean
```

Train the model:

```bash
python train.py
```

Training writes:

- `brahmi_model.h5`
- `class_labels.json`
- `training_history.json`

## Supported Characters

The classifier covers 34 core Brahmi labels:

```text
A
KA KHA GA GHA NGA
CHA CHHA JA JHA NYA
TTA TTHA DDA DDHA NNA
TA THA DA DHA NA
PA PHA BA BHA MA
YA RA LA VA
SHA SSA SA HA
```

## Repository

```text
https://github.com/Nishwanth2809/Brahmi-Script
```

## License

This project is for educational and research purposes.
