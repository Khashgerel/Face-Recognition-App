from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import face_recognition
import math
import json
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageData(BaseModel):
    image: str

def classify_face_shape(chin_points):
    jaw_width = np.linalg.norm(np.array(chin_points[0]) - np.array(chin_points[16]))
    jaw_height = np.linalg.norm(np.array(chin_points[8]) - np.array(chin_points[0]))
    
    ratio = jaw_width / jaw_height

    if ratio > 1.6:
        return "round"
    elif 1.3 < ratio <= 1.6:
        return "oval"
    else:
        return "square"

@app.post("/recognize-face")
async def recognize_face(data: ImageData):
    try:
        if not data.image or "," not in data.image:
            raise HTTPException(status_code=400, detail="Invalid image format")

        header, encoded = data.image.split(",", 1)
        image_data = base64.b64decode(encoded)
        # print(data)

        # Load image using PIL, ensure it's in RGB mode
        pil_image = Image.open(io.BytesIO(image_data))

        # Handle alpha channel if it exists (convert to RGB)
        if pil_image.mode in ("RGBA", "LA"):
            pil_image = pil_image.convert("RGB")

        # Final safety: convert to RGB (even if already)
        pil_image = pil_image.convert("RGB")

        # Convert to numpy array (this will be uint8 RGB by default)
        img_rgb = np.array(pil_image)

        # Debug checks
        if img_rgb.dtype != np.uint8 or len(img_rgb.shape) != 3 or img_rgb.shape[2] != 3:
            raise ValueError("Image is not a proper 8-bit 3-channel RGB image.")

        print("Image shape:", img_rgb.shape)
        print("Image dtype:", img_rgb.dtype)

        # Face recognition
        face_locations = face_recognition.face_locations(img_rgb)
        face_landmarks_list = face_recognition.face_landmarks(img_rgb)

        results = []
        for landmarks in face_landmarks_list:
            if "chin" in landmarks:
                face_shape = classify_face_shape(landmarks["chin"])
                results.append({"face_shape": face_shape})

        with open("face_shapes.json", "a") as f:
            for item in results:
                json.dump(item, f)
                f.write("\n")

        return {"faces_detected": len(results), "details": results}

    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
