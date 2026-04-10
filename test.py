import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from mapping import mapping

# load model
model = tf.keras.models.load_model("brahmi_model.h5", compile=False)

# load class labels
datagen = ImageDataGenerator()

data = datagen.flow_from_directory(
    "dataset/train",
    target_size=(64,64),
    batch_size=1,
    shuffle=False
)

class_labels = list(data.class_indices.keys())


# read test image
img = cv2.imread("text.png")

if img is None:
    print("Image not found")
    exit()

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# blur improves segmentation
gray = cv2.GaussianBlur(gray,(5,5),0)

# threshold
thresh = cv2.adaptiveThreshold(
    gray,255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY_INV,
    31,5
)

# close gaps
kernel = np.ones((3,3),np.uint8)
thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

# find contours
contours,_ = cv2.findContours(
    thresh,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)

# sort left to right
contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

result = ""

for c in contours:

    x,y,w,h = cv2.boundingRect(c)

    if w < 10 or h < 10:
        continue

    char = thresh[y:y+h, x:x+w]

    # invert colors (white background)
    char = cv2.bitwise_not(char)

    # remove noise
    char = cv2.medianBlur(char,3)

    # get size
    h2, w2 = char.shape

    # scale to fit inside 48x48
    scale = 48 / max(h2, w2)

    new_w = int(w2 * scale)
    new_h = int(h2 * scale)

    char = cv2.resize(char, (new_w, new_h))

    # create white canvas
    canvas = np.ones((64,64), dtype=np.uint8) * 255

    x_offset = (64 - new_w) // 2
    y_offset = (64 - new_h) // 2

    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = char

    char = canvas

    # convert to RGB
    char = cv2.cvtColor(char, cv2.COLOR_GRAY2RGB)

    # normalize
    char = char / 255.0

    # reshape
    char = np.expand_dims(char, axis=0)

    # predict
    pred = model.predict(char, verbose=0)

    idx = np.argmax(pred)

    label = class_labels[idx]

    confidence = pred[0][idx]

    result += label + " "

    print("\nDetected:", label)
    print("Confidence:", confidence)

    if label in mapping:
        print("Telugu:", mapping[label]["telugu"])
        print("Tamil:", mapping[label]["tamil"])
        print("Hindi:", mapping[label]["hindi"])
        print("Evolution:", mapping[label]["evolution"])

    # draw bounding box
    cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)

    cv2.putText(
        img,
        label,
        (x,y-10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0,255,0),
        2
    )

print("\nFinal Sequence:", result)

cv2.imshow("Prediction", img)
cv2.waitKey(0)
cv2.destroyAllWindows()