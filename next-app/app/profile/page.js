"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Hash, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?student_id=${studentId}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('student_id');
    localStorage.removeItem('name');
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen relative flex items-center justify-center bg-background">
        <div className="text-white/50 font-mono animate-pulse">Loading secure profile...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-background">
      <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-20" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" autoPlay loop muted playsInline />
      
      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          SaveState<sup className="text-xs">®</sup>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">
            Dashboard
          </Link>
          <button onClick={handleLogout} className="liquid-glass px-4 py-2 rounded-full text-xs text-white hover:scale-[1.05] transition-transform">
            Logout
          </button>
        </div>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full animate-fade-rise">
        <div className="w-full flex justify-between items-center mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wide uppercase">Back to Feed</span>
          </Link>
        </div>

        <div className="liquid-glass rounded-3xl p-8 sm:p-12 w-full">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            
            {/* Selfie Display */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-48 h-48 rounded-3xl overflow-hidden border border-white/20 bg-black/50 p-2">
                  <img 
                    src={user?.selfie_base64} 
                    alt="Facial Descriptor" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {/* Scanner overlay line animation */}
                  <div className="absolute inset-0 border-t-2 border-white/50 w-full animate-pulse blur-[1px] translate-y-[-100%]" style={{ animation: "scan 3s linear infinite" }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">
                <ShieldCheck size={14} />
                <span>Biometric Descriptor Active</span>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-6 w-full">
              <div>
                <h1 className="text-5xl text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  {user?.name}
                </h1>
                <p className="text-muted-foreground tracking-widest text-sm uppercase">Registered Personnel</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="bg-black/40 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 text-muted-foreground mb-1">
                    <Hash size={16} />
                    <span className="text-xs uppercase tracking-wider font-medium">Student ID</span>
                  </div>
                  <div className="text-xl text-white font-mono">{user?.student_id}</div>
                </div>

                <div className="bg-black/40 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 text-muted-foreground mb-1">
                    <Mail size={16} />
                    <span className="text-xs uppercase tracking-wider font-medium">Email Address</span>
                  </div>
                  <div className="text-lg text-white truncate">{user?.email}</div>
                </div>
              </div>
            </div>

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
