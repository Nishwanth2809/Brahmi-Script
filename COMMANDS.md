# Brahmi Script Recognition - Run Commands

## Install Backend Dependencies

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Install Frontend Dependencies

```bash
cd front-end
npm install
```

## Development Run

Start the Flask API from the project root:

```bash
.venv\Scripts\activate
python api.py
```

Start the React dev server from `front-end` in a second terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:8080
```

The Vite dev server proxies `/api` calls to Flask at `http://localhost:5000`.

## Production-Style Run

Build the React frontend:

```bash
cd front-end
npm run build
```

Run Flask from the project root:

```bash
python api.py
```

Open:

```text
http://localhost:5000
```

## API Checks

```bash
curl http://localhost:5000/api/health
```

## Generate Dataset

```bash
python generate_dataset.py --clean
```

## Train Model

```bash
python train.py
```

## Test Model Locally

```bash
python test.py
```

## Deploy Backend on Render

Use the repository's `render.yaml` blueprint, or create a Render web service with:

```text
Build Command: pip install -r requirements.txt
Start Command: gunicorn api:app --bind 0.0.0.0:$PORT
Health Check Path: /api/health
```

After Render gives you the backend URL, set this in the Vercel frontend project:

```text
VITE_API_BASE_URL=https://your-render-backend-url
```
