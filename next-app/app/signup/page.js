"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', student_id: '' });
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access requires a secure connection (HTTPS) or localhost.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access is required to take a selfie.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Calculate how the video is displayed (object-cover)
      const cw = video.offsetWidth;
      const ch = video.offsetHeight;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(cw / vw, ch / vh);
      
      // Calculate the offset of the video in the container
      const offsetX = (vw * scale - cw) / 2;
      const offsetY = (vh * scale - ch) / 2;
      
      // Calculate the dotted outline's position and size relative to the container
      const outlineWidth = cw * 0.75;
      const outlineHeight = ch * (2 / 3);
      const outlineX = (cw - outlineWidth) / 2;
      const outlineY = (ch - outlineHeight) / 2;
      
      // Map the outline's position back to the source video coordinates
      const sourceX = (outlineX + offsetX) / scale;
      const sourceY = (outlineY + offsetY) / scale;
      const sourceWidth = outlineWidth / scale;
      const sourceHeight = outlineHeight / scale;
      
      // Set canvas to the exact cropped dimensions to prevent squishing
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      
      // Mirror the context so the saved image matches the user's mirrored view
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      // Draw ONLY the exact region inside the dotted outline from the source video
      context.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
      
      const base64Image = canvas.toDataURL('image/jpeg');
      setSelfie(base64Image);
      stopCamera();
    }
  };

  const retakeSelfie = () => {
    setSelfie(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selfie) {
      setError('Please take a selfie first.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, selfie_base64: selfie })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      
      setSuccess('Successfully registered! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-background">
      <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-20" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" autoPlay loop muted playsInline />
      
      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          SaveState<sup className="text-xs">®</sup>
        </Link>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="liquid-glass p-8 rounded-3xl w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center animate-fade-rise">
          
          <div className="space-y-6">
            <div>
              <h2 className="text-5xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>Join the network</h2>
              <p className="text-muted-foreground text-sm">Register your identity to enable frictionless access across campus.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input type="text" placeholder="Full Name" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <input type="email" placeholder="Email Address" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <input type="text" placeholder="Student ID" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
              </div>
              
              {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2 rounded">{error}</p>}
              {success && <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 p-2 rounded">{success}</p>}
              
              <button disabled={loading} type="submit" className="w-full liquid-glass rounded-lg px-6 py-4 text-sm font-medium text-foreground hover:scale-[1.02] transition-transform disabled:opacity-50 cursor-pointer">
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full aspect-[3/4] bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
              {!selfie ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-3/4 h-2/3 border-2 border-dashed border-white/30 rounded-full"></div>
                  </div>
                </>
              ) : (
                <img src={selfie} alt="Selfie" className="w-[75%] h-[66.666%] object-cover rounded-full z-10" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {!selfie ? (
              <button onClick={captureSelfie} type="button" className="liquid-glass rounded-full px-8 py-3 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer">
                Take Selfie
              </button>
            ) : (
              <button onClick={retakeSelfie} type="button" className="liquid-glass rounded-full px-8 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Retake
              </button>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
