# SaveState 🎓

SaveState is an AI-powered Classroom Attendance System that replaces traditional roll calls with seamless biometric facial recognition. It features a complete end-to-end architecture with a Next.js full-stack web application and a dedicated Python Flask AI engine for real-time facial processing.

## 🌟 Key Features

*   **Teacher Portal (Admin)**
    *   Secure Teacher Registration & Login.
    *   **Classroom Management**: Whitelist student emails to grant them access to specific classrooms.
    *   **Live Lecture Scheduling**: Create lectures with Start and End times. The system dynamically updates the lecture status (Upcoming, Active, Completed) using a real-time clock.
    *   **Live Attendance Roster**: View exactly which students marked themselves present, complete with timestamps.
*   **Student Portal**
    *   **Secure Biometric Registration**: Students register an account by scanning their face using their webcam. The AI extracts mathematical facial encodings and stores them securely.
    *   **Dynamic Dashboard**: Students only see lectures that are currently `Active` and assigned to their whitelisted classroom.
    *   **One-Click Attendance**: Students click "Mark Attendance", and the AI camera scans their face in real-time.
    *   **Strict Identity Verification**: SaveState utilizes a highly strict `0.45` threshold tolerance in the AI engine to eliminate false positives (e.g., family members). The dashboard also actively validates that the face recognized exactly matches the logged-in student session.

## 🛠 Tech Stack

*   **Frontend**: Next.js (React), Tailwind CSS, Lucide Icons.
*   **Backend (Web)**: Next.js App Router API, Mongoose.
*   **Database**: MongoDB (Atlas).
*   **AI Engine**: Python, Flask, OpenCV, `face_recognition` (dlib).

## 🚀 Local Development Setup

To run SaveState locally, you need to boot up both the Web Application and the AI Engine.

### 1. Web Application (Next.js)

1. Navigate to the `next-app` directory:
   ```bash
   cd next-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `next-app` directory and add your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The web app will run on `http://localhost:3000`.*

### 2. AI Engine (Python)

1. Navigate to the `ai-engine` directory:
   ```bash
   cd ai-engine
   ```
2. Install Python dependencies (ensure you have CMake installed for `dlib`):
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `ai-engine` directory and add your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the Flask server:
   ```bash
   python3 app.py
   ```
   *The AI engine will boot up, synchronize facial encodings from MongoDB into active memory, and listen on `http://localhost:5001`.*

## 🔒 Mobile Testing (Secure Context)

Modern mobile browsers strictly require `HTTPS` to access the device camera. If you are testing SaveState on your phone over a local Wi-Fi network, the camera will silently fail. 

To easily test on mobile, use a secure tunnel from your Mac terminal to bypass this restriction:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
Open the `.trycloudflare.com` URL provided in your phone's browser to successfully test the biometric scanner!
