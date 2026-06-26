"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const activeLectureIdRef = useRef(null);
  const [recognitionStatus, setRecognitionStatus] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Route Protection
    if (!localStorage.getItem('student_id')) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 3000);
    return () => {
      clearInterval(intervalId);
      stopCamera();
    };
  }, [router]);

  // Bind the camera stream to the video element whenever the modal opens
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const fetchDashboardData = async () => {
    try {
      let email = localStorage.getItem('email');
      const student_id = localStorage.getItem('student_id');
      if (!student_id) return;

      if (!email) {
        // Fallback to fetch email if not in localStorage (for older sessions)
        const profileRes = await fetch(`/api/profile?student_id=${student_id}`);
        const profileData = await profileRes.json();
        if (profileData.success && profileData.user?.email) {
          email = profileData.user.email;
          localStorage.setItem('email', email);
        } else {
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/student/lectures?email=${encodeURIComponent(email)}&student_id=${student_id}`);
      const data = await res.json();
      if (data.success) {
        setLectures(data.lectures);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async (lectureId) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access requires a secure connection (HTTPS) or localhost.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setActiveLectureId(lectureId);
      activeLectureIdRef.current = lectureId;
      setIsCameraActive(true);
      setRecognitionStatus('Scanning for faces...');

      // Start capturing frames every 2 seconds
      intervalRef.current = setInterval(processFrame, 2000);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setRecognitionStatus("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsCameraActive(false);
    setActiveLectureId(null);
    activeLectureIdRef.current = null;
    setRecognitionStatus('');
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Only capture if the video is actually playing and has dimensions
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;
    
    const context = canvas.getContext('2d');

    // Draw the current video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get base64 image
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    try {
      // Send to Python Flask Backend
      const response = await fetch('http://localhost:5001/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      const data = await response.json();
      
      if (data.success && data.match) {
        const loggedInId = localStorage.getItem('student_id');
        if (data.student_id !== loggedInId) {
          setRecognitionStatus(`Identity Mismatch: You are not Student ${data.student_id}`);
          return;
        }

        setRecognitionStatus(`Identity Confirmed: Student ${data.student_id}`);
        
        // Log attendance to Next.js API
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: data.student_id, lecture_id: activeLectureIdRef.current })
        });
        
        // Refresh dashboard data to show as attended
        fetchDashboardData();
        
        // Temporarily pause scanning and auto-close after 4 seconds
        clearInterval(intervalRef.current);
        setTimeout(() => {
          stopCamera();
        }, 4000);
        
      } else {
        setRecognitionStatus('No match found. Please look at the camera.');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setRecognitionStatus('Error connecting to AI engine.');
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('student_id');
    localStorage.removeItem('name');
    router.push('/login');
  };

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-background">
      <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-20" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" autoPlay loop muted playsInline />
      
      {/* Camera Modal Popup */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-rise">
          <div className="liquid-glass p-8 rounded-3xl flex flex-col items-center max-w-md w-full relative">
            <h2 className="text-2xl text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Face Scan Active</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">Please look directly at the camera to log your attendance.</p>
            
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-3xl z-10 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-3xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="absolute inset-0 border-t-2 border-green-400/50 w-full animate-pulse blur-[1px] translate-y-[-100%] z-20 pointer-events-none" style={{ animation: "scan 3s linear infinite" }}></div>
            </div>

            <div className="h-8 mb-6 flex items-center justify-center">
              {recognitionStatus && (
                <div className="text-xs font-mono text-white/80 animate-pulse bg-white/10 px-4 py-2 rounded-full border border-white/10">
                  {recognitionStatus}
                </div>
              )}
            </div>

            <button 
              onClick={stopCamera}
              className="w-full py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}

      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          SaveState<sup className="text-xs">®</sup>
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-xs text-muted-foreground uppercase tracking-widest hidden sm:inline-block">
              {isCameraActive ? 'Scanning Active' : 'Live Tracking'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Profile
            </Link>
            <button onClick={handleLogout} className="liquid-glass px-4 py-2 rounded-full text-xs text-white hover:scale-[1.05] transition-transform">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col px-6 py-12 max-w-5xl mx-auto w-full animate-fade-rise">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-6xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Today's Lectures
          </h1>
        </div>

        <div className="liquid-glass rounded-3xl p-8 w-full animate-fade-rise-delay">
          <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground border-b border-white/10 pb-4 mb-4 font-medium tracking-wide">
            <div className="col-span-2">LECTURE</div>
            <div>TIME</div>
            <div className="text-right">ACTION</div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Syncing class schedule...</div>
            ) : lectures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No active lectures scheduled for you today.</div>
            ) : (
              lectures.map((lecture) => (
                <div key={lecture._id} className="grid grid-cols-4 gap-4 items-center bg-black/20 rounded-xl p-4 border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-medium">
                      {lecture.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium text-lg">{lecture.name}</div>
                      <div className="text-xs text-muted-foreground">Prof. {lecture.teacher_name}</div>
                    </div>
                  </div>
                  <div className="text-white font-mono text-sm">
                    {lecture.date}<br/>
                    <span className="text-muted-foreground text-xs">{new Date(`2000-01-01T${lecture.startTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(`2000-01-01T${lecture.endTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="text-right">
                    {lecture.has_attended ? (
                      <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-wide">
                        Present
                      </span>
                    ) : (
                      <button 
                        onClick={() => startCamera(lecture._id)}
                        className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:scale-[1.05] transition-transform"
                      >
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Global styles for scanner line */}
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(480px); }
        }
      `}</style>
    </main>
  );
}
