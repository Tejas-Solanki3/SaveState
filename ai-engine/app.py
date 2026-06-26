import os
import io
import base64
import face_recognition
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Next.js

# Connect to MongoDB
MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("MONGODB_URI environment variable not set")
client = MongoClient(MONGO_URI)
db = client["test"]  # Mongoose default DB is "test" unless specified in URI
users_collection = db["users"]

# In-memory store for face encodings
# In a production app, you might re-fetch this periodically or cache it
known_face_encodings = []
known_student_ids = []

def sync_encodings():
    global known_face_encodings, known_student_ids
    print("Syncing users from MongoDB...")
    
    # We need to explicitly clear in case it's called again
    known_face_encodings = []
    known_student_ids = []
    
    users = users_collection.find({})
    count = 0
    
    for user in users:
        selfie_b64 = user.get("selfie_base64")
        student_id = user.get("student_id")
        
        if not selfie_b64 or not student_id:
            continue
            
        try:
            # Decode base64 image
            if "," in selfie_b64:
                selfie_b64 = selfie_b64.split(",")[1]
            
            image_bytes = base64.b64decode(selfie_b64)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB (face_recognition requires RGB)
            if image.mode != "RGB":
                image = image.convert("RGB")
                
            img_array = np.array(image)
            
            # Extract face encodings
            encodings = face_recognition.face_encodings(img_array)
            
            if len(encodings) > 0:
                known_face_encodings.append(encodings[0])
                known_student_ids.append(student_id)
                count += 1
                
        except Exception as e:
            print(f"Failed to process encoding for {student_id}: {e}")
            
    print(f"Successfully loaded {count} facial descriptors into memory.")

# Load immediately on startup
sync_encodings()

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "service": "SaveState AI Engine"}), 200

@app.route('/sync', methods=['POST'])
def force_sync():
    sync_encodings()
    return jsonify({"success": True, "message": f"Synced {len(known_student_ids)} faces"})

@app.route('/recognize', methods=['POST'])
def recognize_face():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"success": False, "message": "No image provided"}), 400
        
    try:
        image_b64 = data['image']
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]
            
        # Decode and load image
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        img_array = np.array(image)
        
        # Find faces in the current frame
        face_locations = face_recognition.face_locations(img_array)
        face_encodings = face_recognition.face_encodings(img_array, face_locations)
        
        if not face_encodings:
            return jsonify({"success": True, "match": False, "message": "No face detected"}), 200
            
        # We only care about the most prominent face (first one found)
        # Compare against known encodings
        unknown_encoding = face_encodings[0]
        
        # Use a strict tolerance (default is 0.6)
        matches = face_recognition.compare_faces(known_face_encodings, unknown_encoding, tolerance=0.45)
        
        if True in matches:
            first_match_index = matches.index(True)
            matched_id = known_student_ids[first_match_index]
            return jsonify({"success": True, "match": True, "student_id": matched_id}), 200
            
        return jsonify({"success": True, "match": False, "message": "Face not recognized"}), 200
        
    except Exception as e:
        print("Recognition error:", e)
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    print("SaveState AI Backend running on port 5000")
    app.run(host='0.0.0.0', port=5001, debug=False)
