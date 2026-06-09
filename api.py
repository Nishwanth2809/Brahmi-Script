"""
Flask API backend for Brahmi Script Recognition.

In production, this module serves the built React frontend from ``front-end/dist``
and exposes the inference API under ``/api`` so the whole app can run on one port.
"""

from __future__ import annotations

import base64
import json
import os
from pathlib import Path

# Suppress TensorFlow C++ INFO and WARNING logs (AVX2/FMA compile-flag noise).
# Must be set before importing tensorflow.
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, abort, jsonify, request, send_from_directory
from flask_cors import CORS

from mapping import mapping

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST_DIR = BASE_DIR / "front-end" / "dist"
MODEL_PATH = BASE_DIR / "brahmi_model.h5"
CLASS_LABELS_PATH = BASE_DIR / "class_labels.json"

app = Flask(__name__, static_folder=str(FRONTEND_DIST_DIR), static_url_path="")
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "https://brahmi-script-evolution.vercel.app",
        "https://brahmi-script.vercel.app",
        "http://localhost:8080",
        "http://localhost:5000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5000",
    ]}},
    supports_credentials=False,
    allow_headers=["Content-Type"],
    methods=["GET", "POST", "OPTIONS"],
)


def load_class_labels() -> list[str]:
    if CLASS_LABELS_PATH.exists():
        return json.loads(CLASS_LABELS_PATH.read_text(encoding="utf-8"))

    # Fallback: match the alphabetical ordering used by flow_from_directory.
    return sorted(mapping.keys())


def load_model() -> tf.keras.Model | None:
    if not MODEL_PATH.exists():
        return None

    loaded_model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    loaded_model.predict(np.zeros((1, 64, 64, 3), dtype=np.float32), verbose=0)
    return loaded_model


model = load_model()
class_labels = load_class_labels()


def encode_image_b64(img_array: np.ndarray) -> str:
    """Encode a numpy image (grayscale or BGR) to a base64 data URI string."""
    success, buf = cv2.imencode(".png", img_array)
    if not success:
        return ""
    return "data:image/png;base64," + base64.b64encode(buf).decode("utf-8")


@app.route("/api/process", methods=["POST"])
def process_image():
    if model is None:
        return jsonify(
            {"error": "Model file not found. Train the model or restore brahmi_model.h5."}
        ), 503

    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send as 'image' field."}), 400

    file = request.files["image"]
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify(
            {"error": "Could not decode image. Please upload a valid PNG/JPG/JPEG."}
        ), 400

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Reject colorful images (digital UI screenshots, photos with colored content).
    # Brahmi script documents are black ink on white/cream paper — near-zero saturation.
    # Use pixel-ratio instead of mean: even a small blue sidebar or colorful icons
    # will push the ratio above the threshold, while a white/cream background won't.
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    total_pixels = hsv[:, :, 1].size
    high_sat_pixels = int(np.sum(hsv[:, :, 1] > 60))
    high_sat_ratio = high_sat_pixels / total_pixels
    if high_sat_ratio > 0.015:  # More than 1.5% colorful pixels → not a Brahmi scan
        return jsonify(
            {
                "error": (
                    "Invalid Image: The image contains significant color content. "
                    "Please upload a black-and-white scan or photo of Brahmi script."
                )
            }
        ), 400

    # Reject dark-background images (digital screenshots, UI captures, photos of dark surfaces).
    # Brahmi script documents are always on light/white backgrounds.
    mean_brightness = float(np.mean(gray))
    if mean_brightness < 100:
        return jsonify(
            {
                "error": (
                    "Invalid Image: The image background appears to be dark. "
                    "Please upload a scan or photo of Brahmi script on a light background."
                )
            }
        ), 400

    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
    if edge_density > 0.10:
        return jsonify(
            {"error": "Invalid Image: This does not appear to be a Brahmi script image."}
        ), 400

    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        31,
        5,
    )

    kernel = np.ones((3, 3), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    pre_contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(pre_contours) < 1:
        return jsonify({"error": "Invalid Image: No characters found."}), 400

    contours = sorted(pre_contours, key=lambda contour: cv2.boundingRect(contour)[0])
    valid_contours = [
        contour
        for contour in contours
        if cv2.boundingRect(contour)[2] >= 10 and cv2.boundingRect(contour)[3] >= 10
    ]

    if len(valid_contours) > 80:
        return jsonify(
            {"error": "Invalid Image: Too many objects detected, likely not Brahmi script."}
        ), 400

    if len(valid_contours) > 2:
        areas = [cv2.contourArea(contour) for contour in valid_contours]
        mean_area = np.mean(areas)
        std_area = np.std(areas)
        cv_area = std_area / mean_area if mean_area > 0 else 999
        if cv_area > 1.8:
            return jsonify(
                {
                    "error": (
                        "Invalid Image: Character sizes are too varied, likely not Brahmi script."
                    )
                }
            ), 400

    if valid_contours:
        solidities = []
        aspect_ratios = []
        for contour in valid_contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = cv2.contourArea(contour)
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = area / float(hull_area) if hull_area > 0 else 0
            aspect_ratio = w / float(h)
            solidities.append(solidity)
            aspect_ratios.append(aspect_ratio)

        mean_solidity = np.mean(solidities)
        mean_aspect_ratio = np.mean(aspect_ratios)
        # Reject only when contours are excessively wide (UI buttons/text-fields) OR
        # the size variation is compounded by near-perfect rectangular fills.
        if mean_aspect_ratio > 3.0 or (mean_solidity > 0.90 and mean_aspect_ratio > 2.0):
            return jsonify(
                {
                    "error": (
                        "Invalid Image: The text morphology matches modern scripts rather than "
                        "ancient Brahmi."
                    )
                }
            ), 400

    if not valid_contours:
        return jsonify({"error": "No characters found in the image."}), 400

    img_with_boxes = img.copy()
    predictions = []
    char_inputs = []
    char_metadata = []

    for contour in valid_contours:
        x, y, w, h = cv2.boundingRect(contour)
        char = thresh[y : y + h, x : x + w]
        char = cv2.bitwise_not(char)
        char = cv2.medianBlur(char, 3)
        char_height, char_width = char.shape
        scale = 48 / max(char_height, char_width)
        new_w = int(char_width * scale)
        new_h = int(char_height * scale)
        try:
            char = cv2.resize(char, (new_w, new_h))
        except Exception:
            continue

        canvas = np.ones((64, 64), dtype=np.uint8) * 255
        x_offset = (64 - new_w) // 2
        y_offset = (64 - new_h) // 2
        canvas[y_offset : y_offset + new_h, x_offset : x_offset + new_w] = char

        char_rgb = cv2.cvtColor(canvas, cv2.COLOR_GRAY2RGB)
        char_inputs.append((char_rgb / 255.0).astype(np.float32))
        char_metadata.append(
            {
                "char_image": encode_image_b64(canvas),
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h),
            }
        )

    if char_inputs:
        batch_predictions = model.predict(np.stack(char_inputs, axis=0), verbose=0)
        for metadata, pred in zip(char_metadata, batch_predictions):
            idx = int(np.argmax(pred))
            predictions.append(
                {
                    "label": class_labels[idx],
                    "confidence": float(pred[idx]),
                    **metadata,
                }
            )

    avg_conf = np.mean([prediction["confidence"] for prediction in predictions]) if predictions else 0.0

    # Per-character check: count how many chars scored below 50% confidence
    low_conf_chars = sum(1 for p in predictions if p["confidence"] < 0.50)
    low_conf_ratio = low_conf_chars / len(predictions) if predictions else 1.0

    if low_conf_ratio > 0.50:
        return jsonify(
            {
                "error": (
                    f"Invalid Image: {low_conf_chars} of {len(predictions)} characters scored below "
                    f"50% confidence — this does not appear to be Brahmi script. "
                    "Please upload a clear Brahmi script image."
                )
            }
        ), 400

    if avg_conf < 0.60:
        return jsonify(
            {
                "error": (
                    f"Invalid Image: Overall model confidence is too low ({avg_conf:.0%}). "
                    "Please upload a clear Brahmi script image."
                )
            }
        ), 400

    telugu_sequence = []
    tamil_sequence = []
    hindi_sequence = []
    result_predictions = []

    for prediction in predictions:
        label = prediction["label"]

        cv2.rectangle(
            img_with_boxes,
            (prediction["x"], prediction["y"]),
            (prediction["x"] + prediction["w"], prediction["y"] + prediction["h"]),
            (0, 255, 0),
            2,
        )
        cv2.putText(
            img_with_boxes,
            label,
            (prediction["x"], prediction["y"] - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2,
        )

        telugu = mapping[label]["telugu"] if label in mapping else label
        tamil = mapping[label]["tamil"] if label in mapping else label
        hindi = mapping[label]["hindi"] if label in mapping else label

        telugu_sequence.append(telugu)
        tamil_sequence.append(tamil)
        hindi_sequence.append(hindi)

        result_predictions.append(
            {
                "label": label,
                "confidence": prediction["confidence"],
                "char_image": prediction["char_image"],
                "telugu": telugu,
                "tamil": tamil,
                "hindi": hindi,
            }
        )

    return jsonify(
        {
            "predictions": result_predictions,
            "tracked_image": encode_image_b64(img_with_boxes),
            "telugu_sequence": " ".join(telugu_sequence),
            "tamil_sequence": " ".join(tamil_sequence),
            "hindi_sequence": " ".join(hindi_sequence),
        }
    )


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "model_loaded": model is not None,
            "num_classes": len(class_labels),
            "frontend_built": FRONTEND_DIST_DIR.joinpath("index.html").exists(),
        }
    )


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path: str):
    if path.startswith("api/"):
        abort(404)

    requested_file = FRONTEND_DIST_DIR / path
    if path and requested_file.is_file():
        return send_from_directory(str(FRONTEND_DIST_DIR), path)

    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return send_from_directory(str(FRONTEND_DIST_DIR), "index.html")

    if not path:
        return jsonify(
            {
                "status": "ok",
                "service": "Brahmi Script API",
                "health": "/api/health",
            }
        )

    return jsonify(
        {
            "error": "Frontend build not found. Run `npm run build` inside `front-end` first."
        }
    ), 503


if __name__ == "__main__":
    print(f"Brahmi API running with {len(class_labels)} classes available")
    app.run(host="0.0.0.0", port=5000, debug=True)
