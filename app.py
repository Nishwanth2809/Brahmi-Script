import streamlit as st
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from mapping import mapping
import os

st.set_page_config(page_title="AI-Based Brahmi Script Recognition and Translation System", layout="wide")

st.title("AI-Based Brahmi Script Recognition and Translation System")
st.write("Upload an image of Brahmi text and the model will perform segmentation, predicting each character.")

@st.cache_resource
def load_model_and_labels():
    model = tf.keras.models.load_model("brahmi_model.h5", compile=False)
    train_dir = "dataset/train"
    if os.path.exists(train_dir):
        class_labels = sorted([
            d for d in os.listdir(train_dir)
            if os.path.isdir(os.path.join(train_dir, d))
        ])
    else:
        # Fallback: derive class labels from mapping (sorted alphabetically,
        # matching the order Keras flow_from_directory used during training)
        class_labels = sorted(mapping.keys())
    return model, class_labels

# Load resources
model, class_labels = load_model_and_labels()

uploaded_file = st.file_uploader("Upload an Image", type=["png", "jpg", "jpeg"])

if uploaded_file is not None:
    file_bytes = np.asarray(bytearray(uploaded_file.getvalue()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, 1)

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Original Image")
        st.image(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), use_container_width=True)

    if st.button("Process Image", type="primary"):
        with st.spinner("Analyzing image..."):
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (5, 5), 0)

            # ── PRE-VALIDATION: Is this a text image? ───────────────────
            # Use Canny edge detection to find edge density
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
            
            # Text images have low, clean edges. Natural photos have higher edge density.
            if edge_density > 0.10:
                st.error("❌ Invalid Image: This does not appear to be a Brahmi script image.")
                st.stop()
                
            thresh = cv2.adaptiveThreshold(
                gray, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV,
                31, 5
            )

            kernel = np.ones((3, 3), np.uint8)
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

            # ── PRE-VALIDATION 2: Contour Analysis ──────────────────────
            # Find contours just to check the structure
            pre_contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Reject only completely blank images (no contours at all)
            if len(pre_contours) < 1:
                st.error("❌ Invalid Image")
                st.stop()
                
            contours = sorted(pre_contours, key=lambda c: cv2.boundingRect(c)[0])

            img_with_boxes = img.copy()

            # Filter contours
            valid_contours = [c for c in contours if cv2.boundingRect(c)[2] >= 10 and cv2.boundingRect(c)[3] >= 10]

            # ── Early exit: extremely high contour count = likely noise/natural image ──
            if len(valid_contours) > 500:
                st.error("❌ Invalid Image: This does not appear to be a Brahmi script image. Please upload an image containing Brahmi characters.")
                st.stop()

            # ── PRE-VALIDATION 3: Contour size uniformity check ──────────────
            # Brahmi script characters are roughly uniform in size.
            # Natural photos produce contours of wildly varying sizes.
            if len(valid_contours) > 2:
                areas = [cv2.contourArea(c) for c in valid_contours]
                mean_area = np.mean(areas)
                std_area = np.std(areas)
                cv_area = std_area / mean_area if mean_area > 0 else 999
                if cv_area > 1.8:  # coefficient of variation > 180% = too varied = not script
                    st.error("❌ Invalid Image: This does not appear to be a Brahmi script image. Please upload an image containing Brahmi characters.")
                    st.stop()
                    
            # ── PRE-VALIDATION 4: Script Morphology (Reject Modern Fonts) ────
            # Modern scripts (Telugu, Hindi) are thicker/curvier (high solidity) and squarish (aspect ratio ~1.0).
            # Brahmi characters are thin, stick-like, and tall (solidity ~0.4, aspect ratio ~0.6).
            if len(valid_contours) > 0:
                solidities = []
                aspect_ratios = []
                for c in valid_contours:
                    x, y, w, h = cv2.boundingRect(c)
                    area = cv2.contourArea(c)
                    hull = cv2.convexHull(c)
                    hull_area = cv2.contourArea(hull)
                    
                    solidity = area / float(hull_area) if hull_area > 0 else 0
                    ar = w / float(h)
                    
                    solidities.append(solidity)
                    aspect_ratios.append(ar)
                    
                mean_solidity = np.mean(solidities)
                mean_ar = np.mean(aspect_ratios)
                
                # If characters are too "compact/filled" or too "wide", it's a modern script
                if mean_solidity > 0.65 or mean_ar > 1.4:
                    st.error("❌ Invalid Image: The text morphology matches modern scripts (e.g., Telugu/Hindi) rather than ancient Brahmi script. Please upload genuine Brahmi text.")
                    st.stop()

            if not valid_contours:
                st.warning("No characters found in the image.")
            else:
                # ── PASS 1: Collect all predictions silently (no UI output yet) ──
                predictions = []  # (label, confidence, char_display_img, x, y, w, h)
                for c in valid_contours:
                    x, y, w, h = cv2.boundingRect(c)
                    char = thresh[y:y+h, x:x+w]
                    char = cv2.bitwise_not(char)
                    char = cv2.medianBlur(char, 3)
                    h2, w2 = char.shape
                    scale = 48 / max(h2, w2)
                    new_w, new_h = int(w2 * scale), int(h2 * scale)
                    try:
                        char = cv2.resize(char, (new_w, new_h))
                    except Exception:
                        continue
                    canvas = np.ones((64, 64), dtype=np.uint8) * 255
                    x_off = (64 - new_w) // 2
                    y_off = (64 - new_h) // 2
                    canvas[y_off:y_off+new_h, x_off:x_off+new_w] = char

                    char_rgb = cv2.cvtColor(canvas, cv2.COLOR_GRAY2RGB)
                    char_input = np.expand_dims(char_rgb / 255.0, axis=0)

                    if len(class_labels) > 0:
                        pred = model.predict(char_input, verbose=0)
                        idx = int(np.argmax(pred))
                        label = class_labels[idx]
                        confidence = float(pred[0][idx])
                    else:
                        label = "Unknown"
                        confidence = 0.0

                    predictions.append((label, confidence, canvas.copy(), x, y, w, h))

                # ── VALIDATE before showing ANY results ───────────────────────
                avg_confidence = np.mean([p[1] for p in predictions]) if predictions else 0.0

                if avg_confidence < 0.40:
                    st.error(
                        f"❌ Invalid Image: This does not appear to be a Brahmi script image "
                        f"(model confidence: {avg_confidence:.0%}). "
                        f"Please upload an image containing Brahmi characters."
                    )
                    st.stop()

                # ── PASS 2: Render results only if image is valid ─────────────
                result_sequence = []
                for label, confidence, char_display, x, y, w, h in predictions:
                    result_sequence.append((label, confidence))
                    cv2.rectangle(img_with_boxes, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    cv2.putText(img_with_boxes, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

                st.divider()
                st.subheader("Segmentation & Predictions")
                cols_per_row = 6
                cols = st.columns(cols_per_row)
                for col_idx, (label, confidence, char_display, x, y, w, h) in enumerate(predictions):
                    with cols[col_idx % cols_per_row]:
                        st.image(char_display, width=64)
                        st.markdown(f"**{label}** ({confidence:.2f})")
                        if label in mapping:
                            st.caption(f"**Te:** {mapping[label]['telugu']} | **Ta:** {mapping[label]['tamil']} | **Hi:** {mapping[label]['hindi']}")
                    if (col_idx + 1) % cols_per_row == 0 and (col_idx + 1) < len(predictions):
                        cols = st.columns(cols_per_row)

                with col2:
                    st.subheader("Tracked Image")
                    st.image(cv2.cvtColor(img_with_boxes, cv2.COLOR_BGR2RGB), use_container_width=True)

                st.divider()
                st.subheader("Final Sequence")
                te_seq, ta_seq, hi_seq = [], [], []
                for label, _ in result_sequence:
                    if label in mapping:
                        te_seq.append(mapping[label]['telugu'])
                        ta_seq.append(mapping[label]['tamil'])
                        hi_seq.append(mapping[label]['hindi'])
                    else:
                        te_seq.append(label)
                        ta_seq.append(label)
                        hi_seq.append(label)

                st.success(f"**Telugu:** {' '.join(te_seq)}\n\n**Tamil:** {' '.join(ta_seq)}\n\n**Devanagari:** {' '.join(hi_seq)}")
