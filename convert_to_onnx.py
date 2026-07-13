"""
Convert brahmi_model.h5 -> brahmi_model.onnx

Run this ONCE locally (requires tensorflow + tf2onnx):
    pip install tf2onnx
    python convert_to_onnx.py

The output file (brahmi_model.onnx) should be committed to git so that
the Render deployment can use it with the lightweight onnxruntime package
instead of the full tensorflow-cpu (~500 MB).

onnxruntime uses ~50 MB RAM vs TensorFlow's ~450 MB, fitting comfortably
within Render's free tier 512 MB limit.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

BASE_DIR = Path(__file__).resolve().parent
H5_PATH = BASE_DIR / "brahmi_model.h5"
ONNX_PATH = BASE_DIR / "brahmi_model.onnx"


def convert() -> None:
    if not H5_PATH.exists():
        raise FileNotFoundError(f"Source model not found: {H5_PATH}")

    try:
        import tf2onnx  # noqa: F401
    except ImportError:
        raise ImportError(
            "tf2onnx is required for conversion.\n"
            "Install it with:  pip install tf2onnx"
        )

    import tensorflow as tf
    import shutil, tempfile
    import tf2onnx.convert

    print(f"Loading {H5_PATH.name} ...")
    model = tf.keras.models.load_model(str(H5_PATH), compile=False)
    print(f"  Input shape : {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")

    # Save as TF SavedModel first (tf2onnx from_keras fails with Keras 3)
    tmp_dir = tempfile.mkdtemp(prefix="brahmi_sm_")
    try:
        print(f"Saving as SavedModel to {tmp_dir} ...")
        tf.saved_model.save(model, tmp_dir)

        print("Converting SavedModel -> ONNX ...")
        onnx_model, _ = tf2onnx.convert.from_saved_model(
            tmp_dir,
            opset=13,
            output_path=str(ONNX_PATH),
        )
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    size_mb = ONNX_PATH.stat().st_size / 1024 / 1024
    print(f"Saved {ONNX_PATH.name} ({size_mb:.2f} MB)")

    # Quick sanity check using onnxruntime
    print("Running sanity check ...")
    import onnxruntime as ort

    session = ort.InferenceSession(str(ONNX_PATH))
    input_name = session.get_inputs()[0].name
    dummy = np.zeros((1, 64, 64, 3), dtype=np.float32)
    result = session.run(None, {input_name: dummy})
    print(f"  Output shape: {result[0].shape}  (check)")
    print("Conversion complete.")


if __name__ == "__main__":
    convert()
