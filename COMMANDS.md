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
