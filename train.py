from __future__ import annotations

import argparse
import json
import os
import random
from pathlib import Path

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_DETERMINISTIC_OPS", "1")

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

BASE_DIR = Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train the Brahmi character recognition model."
    )
    parser.add_argument("--dataset-dir", type=Path, default=BASE_DIR / "dataset")
    parser.add_argument("--img-size", type=int, default=64)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--model-output", type=Path, default=BASE_DIR / "brahmi_model.h5")
    parser.add_argument("--history-output", type=Path, default=BASE_DIR / "training_history.json")
    parser.add_argument("--labels-output", type=Path, default=BASE_DIR / "class_labels.json")
    return parser.parse_args()


def enable_reproducibility(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    tf.keras.utils.set_random_seed(seed)
    try:
        tf.config.experimental.enable_op_determinism()
    except Exception:
        pass


def build_model(num_classes: int, img_size: int) -> tf.keras.Model:
    return tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(img_size, img_size, 3)),
            tf.keras.layers.Conv2D(32, (3, 3), activation="relu"),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Conv2D(64, (3, 3), activation="relu"),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Conv2D(128, (3, 3), activation="relu"),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(256, activation="relu"),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(num_classes, activation="softmax"),
        ]
    )


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    enable_reproducibility(args.seed)

    train_dir = args.dataset_dir / "train"
    test_dir = args.dataset_dir / "test"

    if not train_dir.exists() or not test_dir.exists():
        raise FileNotFoundError(
            "Dataset not found. Run generate_dataset.py before training."
        )

    train_gen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=5,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
    )
    test_gen = ImageDataGenerator(rescale=1.0 / 255)

    train_data = train_gen.flow_from_directory(
        str(train_dir),
        target_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        class_mode="categorical",
        shuffle=True,
        seed=args.seed,
    )
    test_data = test_gen.flow_from_directory(
        str(test_dir),
        target_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        class_mode="categorical",
        shuffle=False,
    )

    num_classes = train_data.num_classes
    ordered_labels = [
        label for label, _ in sorted(train_data.class_indices.items(), key=lambda item: item[1])
    ]

    print(f"Number of classes: {num_classes}")
    print(f"Training samples: {train_data.samples}")
    print(f"Validation samples: {test_data.samples}")
    print(f"Seed: {args.seed}")

    model = build_model(num_classes=num_classes, img_size=args.img_size)
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history = model.fit(
        train_data,
        epochs=args.epochs,
        validation_data=test_data,
    )

    args.model_output.parent.mkdir(parents=True, exist_ok=True)
    args.history_output.parent.mkdir(parents=True, exist_ok=True)
    args.labels_output.parent.mkdir(parents=True, exist_ok=True)

    model.save(args.model_output)
    write_json(args.history_output, history.history)
    write_json(args.labels_output, ordered_labels)

    evaluation_loss, evaluation_accuracy = model.evaluate(test_data, verbose=0)
    print(f"Validation accuracy: {evaluation_accuracy:.4f}")
    print(f"Validation loss: {evaluation_loss:.4f}")
    print(f"Model saved to {args.model_output}")
    print(f"Training history saved to {args.history_output}")
    print(f"Class labels saved to {args.labels_output}")


if __name__ == "__main__":
    main()
