"""
Convert brahmi_model.h5 -> brahmi_model.tflite

Run this ONCE locally (requires tensorflow):
    python convert_to_tflite.py

The output file (brahmi_model.tflite) should be committed to git so that
the Render deployment can use it with the lightweight ai-edge-litert package
instead of the full tensorflow-cpu (~500 MB).

Dynamic-range quantization is applied by default: it reduces the model size
by ~4x with negligible accuracy loss (weights quantized to int8, activations
remain float32 at runtime).

Note: Uses tf.saved_model approach + legacy converter to work around the
known MLIR/LLVM incompatibility in TF 2.16 + Keras 3.
"""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import numpy as np
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent
H5_PATH = BASE_DIR / "brahmi_model.h5"
TFLITE_PATH = BASE_DIR / "brahmi_model.tflite"


def convert() -> None:
    if not H5_PATH.exists():
        raise FileNotFoundError(f"Source model not found: {H5_PATH}")

    print(f"Loading {H5_PATH.name} ...")
    model = tf.keras.models.load_model(str(H5_PATH), compile=False)
    print(f"  Input shape : {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")

    # Use concrete function approach — most reliable for Keras 3 + TF 2.16
    print("Tracing concrete function ...")
    @tf.function(input_signature=[tf.TensorSpec(shape=[1, 64, 64, 3], dtype=tf.float32, name="input")])
    def predict(x):
        return model(x, training=False)

    concrete_func = predict.get_concrete_function()

    print("Converting to TFLite with dynamic-range quantization ...")
    converter = tf.lite.TFLiteConverter.from_concrete_functions([concrete_func], model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    TFLITE_PATH.write_bytes(tflite_model)
    size_mb = len(tflite_model) / 1024 / 1024
    print(f"Saved {TFLITE_PATH.name} ({size_mb:.2f} MB)")

    # Quick sanity check
    print("Running sanity check ...")
    interpreter = tf.lite.Interpreter(model_content=tflite_model)
    interpreter.allocate_tensors()
    inp = interpreter.get_input_details()[0]
    out = interpreter.get_output_details()[0]
    dummy = np.zeros(inp["shape"], dtype=np.float32)
    interpreter.set_tensor(inp["index"], dummy)
    interpreter.invoke()
    result = interpreter.get_tensor(out["index"])
    print(f"  Output shape: {result.shape}  (check)")
    print("Conversion complete.")


if __name__ == "__main__":
    convert()
