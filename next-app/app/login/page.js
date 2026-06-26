"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect
    if (localStorage.getItem('student_id')) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted) return null; // Prevent hydration mismatch

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('student_id', data.user.student_id);
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('email', data.user.email);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid Student ID');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-background">
      <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-30" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" autoPlay loop muted playsInline />
      
      <nav className="relative z-10 flex flex-row items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          SaveState<sup className="text-xs">®</sup>
        </Link>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full animate-fade-rise">
        <div className="w-full max-w-md liquid-glass p-8 rounded-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Secure Login</h1>
            <p className="text-sm text-muted-foreground">Enter your Student ID to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Student ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-white/50" />
                </div>
                <input 
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 104"
                />
              </div>
            </div>

            {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-medium hover:bg-white/90 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="text-center pt-4 border-t border-white/10 flex flex-col gap-2">
              <div>
                <span className="text-sm text-muted-foreground">Don't have an account? </span>
                <Link href="/signup" className="text-sm text-white hover:underline">Register Face</Link>
              </div>
              <div className="mt-2">
                <Link href="/admin/login" className="text-sm text-white/70 hover:text-white hover:underline">Teacher Portal Login &rarr;</Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
