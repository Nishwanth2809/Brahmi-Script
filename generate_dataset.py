import os
import random
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

characters = {
"A":"𑀅","KA":"𑀓","KHA":"𑀔","GA":"𑀕","GHA":"𑀖","NGA":"𑀗",
"CHA":"𑀘","CHHA":"𑀙","JA":"𑀚","JHA":"𑀛","NYA":"𑀜",
"TTA":"𑀝","TTHA":"𑀞","DDA":"𑀟","DDHA":"𑀠","NNA":"𑀡",
"TA":"𑀢","THA":"𑀣","DA":"𑀤","DHA":"𑀥","NA":"𑀦",
"PA":"𑀧","PHA":"𑀨","BA":"𑀩","BHA":"𑀪","MA":"𑀫",
"YA":"𑀬","RA":"𑀭","LA":"𑀮","VA":"𑀯",
"SHA":"𑀰","SSA":"𑀱","SA":"𑀲","HA":"𑀳"
}

train_count = 7000
test_count = 2000
img_size = 128

font = ImageFont.truetype("NotoSansBrahmi-Regular.ttf",160)

def augment(img):

    h,w = img.shape[:2]

    # rotation with padding
    angle = random.uniform(-20,20)
    M = cv2.getRotationMatrix2D((w//2,h//2),angle,1)
    img = cv2.warpAffine(img,M,(w,h),borderValue=255)

    # translation
    tx = random.randint(-10,10)
    ty = random.randint(-10,10)
    M = np.float32([[1,0,tx],[0,1,ty]])
    img = cv2.warpAffine(img,M,(w,h),borderValue=255)

    # blur
    if random.random()>0.5:
        img = cv2.GaussianBlur(img,(3,3),0)

    # gaussian noise
    noise = np.random.normal(0,8,img.shape)
    img = img + noise
    img = np.clip(img,0,255).astype(np.uint8)

    # thickness variation
    if random.random()>0.6:
        kernel = np.ones((2,2),np.uint8)
        img = cv2.dilate(img,kernel)

    if random.random()>0.6:
        kernel = np.ones((2,2),np.uint8)
        img = cv2.erode(img,kernel)

    return img


for label,char in characters.items():

    train_path = f"dataset/train/{label}"
    test_path = f"dataset/test/{label}"

    os.makedirs(train_path,exist_ok=True)
    os.makedirs(test_path,exist_ok=True)

    total = train_count + test_count

    for i in range(total):

        # create large canvas to avoid cutting
        img = Image.new("L",(256,256),255)
        draw = ImageDraw.Draw(img)

        # center text
        w,h = draw.textbbox((0,0),char,font=font)[2:]
        x = (256-w)//2
        y = (256-h)//2

        draw.text((x,y),char,font=font,fill=0)

        img = np.array(img)

        img = augment(img)

        # final resize
        img = cv2.resize(img,(img_size,img_size))

        if i < train_count:
            cv2.imwrite(f"{train_path}/{i}.png",img)
        else:
            cv2.imwrite(f"{test_path}/{i}.png",img)

print("Dataset generated correctly without cutting.")