# Brahmi Project Review Prep

## 1-Minute Intro

This project is an AI-based Brahmi script recognition and translation system. The goal is to take an image containing ancient Brahmi characters, segment the characters using OpenCV, classify them with a CNN, and map the recognized output into modern Telugu, Tamil, and Devanagari. Since there is no large public labeled Brahmi dataset, we built a synthetic dataset generator using a Brahmi Unicode font and augmentation. The current product version uses a React frontend and a Flask backend, and the whole app can run on a single port in production.

## Core Problem

- Brahmi is historically important but hard to read without experts.
- Real labeled datasets are scarce.
- Ancient inscriptions are noisy, damaged, rotated, and inconsistent.

## Our Solution

1. Generate a synthetic Brahmi dataset for 34 character classes.
2. Train a CNN on the generated data.
3. Preprocess uploaded images with OpenCV.
4. Segment characters using contours.
5. Predict each character with the trained model.
6. Map predictions to Telugu, Tamil, and Hindi/Devanagari.
7. Show results in a modern web UI and allow export.

## Architecture

- Frontend: React + Vite
- Backend: Flask API
- ML: TensorFlow / Keras CNN
- CV: OpenCV
- Dataset generation: Pillow + NumPy + OpenCV

## Pipeline You Should Explain

### Training Pipeline

1. `generate_dataset.py` creates synthetic images from Brahmi Unicode glyphs.
2. Augmentations include rotation, translation, blur, Gaussian noise, dilation, and erosion.
3. `train.py` loads the dataset with `flow_from_directory`.
4. A CNN with 3 convolution blocks and dense layers is trained.
5. The model is saved as `brahmi_model.h5`.
6. `class_labels.json` stores the class order for stable inference.

### Inference Pipeline

1. User uploads an image from the frontend.
2. Frontend sends it to `/api/process`.
3. Backend converts to grayscale and applies Gaussian blur.
4. Canny edge density and contour-based checks reject invalid images.
5. Adaptive thresholding and morphological closing prepare the image.
6. Contours are extracted and sorted left to right.
7. Each character is resized to a centered 64x64 input.
8. CNN predicts the label and confidence.
9. The label is mapped to Telugu, Tamil, and Hindi.
10. Frontend shows segmented characters, confidence, tracked image, and final sequence.

## Important Project Numbers

- 34 Brahmi character classes
- Default synthetic dataset size: 7000 train + 2000 test per class
- Total default dataset size: 306,000 images
- Input to model during inference: 64x64 RGB
- Confidence rejection threshold: 40%

## Current Product Features

- Single-page React UI
- Flask API for processing
- Production mode serves built frontend from Flask
- Character-level predictions with confidence
- Telugu, Tamil, and Devanagari output
- Download results as JSON or text

## Key Files

- `generate_dataset.py`: synthetic data generation
- `train.py`: CNN training
- `api.py`: inference API and production serving
- `mapping.py`: Brahmi to modern script mapping
- `front-end/src/pages/Index.tsx`: main UI flow
- `front-end/src/components/TranslationPanel.tsx`: final results and download feature

## Likely Review Questions

### Why did you use synthetic data?

Because a large labeled Brahmi dataset is not publicly available. Synthetic generation lets us create a controlled dataset across all 34 classes and apply realistic distortions to reduce the domain gap.

### Why CNN instead of traditional OCR?

Traditional OCR and template matching are brittle for ancient scripts because inscriptions are noisy and vary in shape. CNNs learn features automatically and are more robust to distortion.

### Why OpenCV before the CNN?

The CNN classifies individual characters, so we need OpenCV first to preprocess the image, isolate characters, and reject invalid inputs.

### Why map to Telugu, Tamil, and Devanagari?

Brahmi is an ancestor of many South Asian scripts. These mappings make the output more understandable to modern users and demonstrate script evolution.

### What are the main limitations?

- Synthetic data is not the same as real inscription data.
- The model currently handles 34 base characters only.
- It does not fully support conjuncts, modifiers, or very degraded inscriptions.
- Segmentation assumes mostly separable horizontally arranged characters.

### How is the product version different from the report version?

The report describes the core ML system and an earlier Streamlit-style interface. The current implementation productizes that work using React + Flask and serves the built frontend from Flask on a single port.

## Strong Answers for Weak Spots

### If they ask why synthetic accuracy may not equal real-world accuracy

I would say that synthetic data is a practical bootstrapping strategy for a low-resource script, but real inscription fine-tuning is the next step for stronger field performance.

### If they ask about scalability

The system can be extended by adding more labeled characters, real inscription samples, better restoration preprocessing, and a stronger model such as transfer learning or sequence-aware recognition.

### If they ask why this matters

It supports cultural heritage preservation, reduces manual epigraphy effort, and makes ancient scripts more accessible to students and researchers.

## Demo Flow

1. Start the app.
2. Upload a Brahmi image.
3. Click process.
4. Show tracked image with boxes.
5. Show segmented characters and confidence.
6. Show translated output in Telugu, Tamil, and Devanagari.
7. Show download feature.

## Final 30-Second Closing

This project combines computer vision, deep learning, and historical script mapping into one end-to-end system. The main contribution is not only recognition, but building a complete usable pipeline for a low-resource ancient script using synthetic data, CNN-based classification, and a product-ready web interface.
