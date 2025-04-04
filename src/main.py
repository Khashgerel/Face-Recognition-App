from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import face_recognition

app = FastAPI()

class ImageData(BaseModel):
    image: str

@app.post("/recognize-face")
async def recognize_face(data: ImageData):
    try:
        # Decode Base64 image
        image_data = base64.b64decode(data.image.split(",")[1])
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Face recognition processing
        face_locations = face_recognition.face_locations(img)

        return {"faces_detected": len(face_locations)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
