# 🕉️ AI-Based Brahmi Script Recognition and Translation System

An AI-powered application that recognizes ancient **Brahmi script** characters from images and translates them into modern Indian scripts — **Telugu**, **Tamil**, and **Devanagari (Hindi)**.

## ✨ Features

- **Image Upload** — Upload images containing Brahmi script text
- **Character Segmentation** — Automatically segments individual characters using OpenCV
- **CNN Classification** — Classifies each character using a trained TensorFlow CNN model
- **Multi-Script Translation** — Translates recognized characters to Telugu, Tamil, and Hindi
- **Validation Pipeline** — Multi-stage image validation (edge density, contour analysis, morphology checks)
- **Interactive UI** — Built with Streamlit for an easy-to-use web interface

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **TensorFlow / Keras** | CNN model for character classification |
| **OpenCV** | Image processing & character segmentation |
| **Streamlit** | Web application UI |
| **NumPy** | Numerical operations |
| **Pillow** | Image handling & dataset generation |

## 📁 Project Structure

```
Brahmi-Script/
├── app.py                      # Main Streamlit web app
├── train.py                    # Model training script
├── generate_dataset.py         # Synthetic dataset generation
├── test.py                     # Model testing script
├── mapping.py                  # Brahmi → Telugu/Tamil/Hindi mappings
├── brahmi_model.h5             # Pre-trained CNN model
├── NotoSansBrahmi-Regular.ttf  # Brahmi Unicode font
├── requirements.txt            # Python dependencies
├── COMMANDS.md                 # Detailed run commands
├── REACT_PROMPTS.md            # React frontend prompts (future)
└── .gitignore
```

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Brahmi-Script
```

### 2. Create & activate virtual environment
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the app
```bash
streamlit run app.py
```

Then open your browser at **http://localhost:8501**

## 🧠 Model Training (Optional)

The pre-trained model (`brahmi_model.h5`) is already included. To retrain:

```bash
# Step 1: Generate synthetic dataset
python generate_dataset.py

# Step 2: Train the CNN model
python train.py
```

## 🔤 Supported Characters

The system recognizes **34 Brahmi characters** covering the core consonant groups:

| Group | Characters |
|---|---|
| **Vowel** | A |
| **Velar** | KA, KHA, GA, GHA, NGA |
| **Palatal** | CHA, CHHA, JA, JHA, NYA |
| **Retroflex** | TTA, TTHA, DDA, DDHA, NNA |
| **Dental** | TA, THA, DA, DHA, NA |
| **Labial** | PA, PHA, BA, BHA, MA |
| **Semivowel** | YA, RA, LA, VA |
| **Sibilant** | SHA, SSA, SA, HA |

## 📄 License

This project is for educational and research purposes.
