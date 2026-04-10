# 🕉️ Brahmi Script Recognition — Run Commands

## 📁 Project Structure

```
brahmi_dataset_generator/
├── app.py                      # Main Streamlit web app
├── train.py                    # Model training script
├── generate_dataset.py         # Dataset generation script
├── test.py                     # Testing script
├── mapping.py                  # Brahmi character mappings
├── brahmi_model.h5             # Pre-trained model
├── NotoSansBrahmi-Regular.ttf  # Brahmi font
├── dataset/                    # Training dataset
└── requirements.txt            # Python dependencies
```

---

## ⚙️ Setup (First Time Only)

### 1. Navigate to the project directory
```bash
cd /Users/samithvangeti/Documents/dataset_KA/brahmi_dataset_generator
```

### 2. (Optional) Create and activate a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

---

## 🚀 Run the App

```bash
streamlit run app.py
```

Then open your browser at:
- **Local:** http://localhost:8501
- **Network:** http://172.20.10.4:8501

---

## 🗃️ Generate Dataset

```bash
python generate_dataset.py
```

---

## 🧠 Train the Model

```bash
python train.py
```

---

## 🧪 Test the Model

```bash
python test.py
```

---

## 🔁 Full Pipeline (First Run)

```bash
# Step 1: Install dependencies
pip install -r requirements.txt

# Step 2: Generate dataset
python generate_dataset.py

# Step 3: Train the model
python train.py

# Step 4: Launch the app
streamlit run app.py
```

---

## 📦 Dependencies

| Package         | Purpose                        |
|----------------|--------------------------------|
| `tensorflow`   | Deep learning / CNN model      |
| `streamlit`    | Web app UI                     |
| `opencv-python`| Image processing               |
| `numpy`        | Numerical operations           |
| `Pillow`       | Image handling                 |

---

> **Note:** The pre-trained model `brahmi_model.h5` is already included, so you can skip dataset generation and training and directly run the app.
