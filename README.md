# AI-Based Brahmi Script Recognition and Translation System

An AI-powered application that recognizes ancient **Brahmi script** characters from images and transliterates them into modern Indian scripts: **Telugu**, **Tamil**, and **Devanagari/Hindi**.

## Features

- **Image Upload** - Upload images containing Brahmi script text through a React web interface.
- **Character Segmentation** - Automatically segments individual characters using OpenCV.
- **CNN Classification** - Classifies each character using a trained TensorFlow/Keras CNN model.
- **Multi-Script Transliteration** - Converts recognized characters to Telugu, Tamil, and Devanagari/Hindi.
- **Validation Pipeline** - Checks uploaded images with edge density, contour analysis, morphology, and model confidence.
- **Interactive UI** - Built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- **Flask API Backend** - Provides `/api/process` and `/api/health` endpoints and can serve the built frontend.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| **React + TypeScript** | Frontend user interface |
| **Vite** | Frontend development server and production build |
| **Tailwind CSS + shadcn/ui** | Styling and UI components |
| **Flask** | Backend API and production frontend serving |
| **TensorFlow / Keras** | CNN model for character classification |
| **OpenCV** | Image processing and character segmentation |
| **NumPy** | Numerical operations |
| **Pillow** | Dataset image generation |

## Project Structure

```text
Brahmi-Script/
|-- api.py                         # Flask API and production frontend server
|-- train.py                       # Model training script
|-- generate_dataset.py            # Synthetic dataset generation script
|-- test.py                        # Local model testing script
|-- mapping.py                     # Brahmi to Telugu/Tamil/Hindi mappings
|-- class_labels.json              # Model label order
|-- requirements.txt               # Python dependencies
|-- COMMANDS.md                    # Detailed run commands
|-- NotoSansBrahmi-Regular.ttf     # Brahmi Unicode font for dataset generation
|-- front-end/
|   |-- index.html                 # Vite HTML entry
|   |-- package.json               # Frontend dependencies and scripts
|   |-- src/                       # React application source
|   |-- public/                    # Logo and public assets
|   `-- vite.config.ts             # Vite config with API proxy
`-- .gitignore
```

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Nishwanth2809/Brahmi-Script.git
cd Brahmi-Script
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd front-end
npm install
```

### 5. Run the Flask API

From the project root:

```bash
python api.py
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Run the React frontend

From the `front-end` folder:

```bash
npm run dev
```

Then open:

```text
http://localhost:8080
```

The frontend proxies `/api` requests to the Flask server during development.

## Production-Style Run

Build the React frontend:

```bash
cd front-end
npm run build
```

Then run the Flask server from the project root:

```bash
python api.py
```

When `front-end/dist` exists, Flask serves the built React app and API together at:

```text
http://localhost:5000
```

## API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/health` | `GET` | Checks server status, model availability, class count, and frontend build status |
| `/api/process` | `POST` | Accepts an uploaded image in the `image` form field and returns predictions/transliterations |

## Model Training

The model file `brahmi_model.h5` is intentionally ignored by Git because it can be large. Place a trained model in the project root before running inference, or retrain it locally.

```bash
# Step 1: Generate synthetic dataset
python generate_dataset.py --clean

# Step 2: Train the CNN model
python train.py
```

Training writes:

- `brahmi_model.h5`
- `class_labels.json`
- `training_history.json`

## Supported Characters

The system recognizes **34 Brahmi character labels** covering the core consonant groups:

| Group | Characters |
| --- | --- |
| **Vowel** | A |
| **Velar** | KA, KHA, GA, GHA, NGA |
| **Palatal** | CHA, CHHA, JA, JHA, NYA |
| **Retroflex** | TTA, TTHA, DDA, DDHA, NNA |
| **Dental** | TA, THA, DA, DHA, NA |
| **Labial** | PA, PHA, BA, BHA, MA |
| **Semivowel** | YA, RA, LA, VA |
| **Sibilant** | SHA, SSA, SA, HA |

## Notes

- `dataset/`, `brahmi_model.h5`, `.venv/`, `front-end/node_modules/`, and `front-end/dist/` are ignored by Git.
- Run `npm install` inside `front-end` after cloning because `node_modules/` is not committed.
- Run `npm run build` before serving the full app from Flask in production-style mode.

## License

This project is for educational and research purposes.
