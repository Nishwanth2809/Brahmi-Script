import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# image settings
img_size = 64
batch_size = 32

# dataset generators
train_gen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=5,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1
)

test_gen = ImageDataGenerator(rescale=1./255)

# load training dataset
train_data = train_gen.flow_from_directory(
    "dataset/train",
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode="categorical"
)

# load test dataset
test_data = test_gen.flow_from_directory(
    "dataset/test",
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode="categorical"
)

num_classes = train_data.num_classes

print("Number of classes:", num_classes)

# CNN model
model = tf.keras.Sequential([

    tf.keras.layers.Conv2D(32,(3,3),activation='relu',input_shape=(64,64,3)),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(64,(3,3),activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(128,(3,3),activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Flatten(),

    tf.keras.layers.Dense(256,activation='relu'),
    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(num_classes,activation='softmax')
])

# compile model
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# train model
model.fit(
    train_data,
    epochs=20,
    validation_data=test_data
)

# save model
model.save("brahmi_model.h5")

print("Training completed. Model saved as brahmi_model.h5")