"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_id', data.teacher._id);
        localStorage.setItem('admin_name', data.teacher.name);
        localStorage.setItem('classroom_id', data.classroom._id);
        router.push('/admin/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-background">
      <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-20" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" autoPlay loop muted playsInline />
      
      <nav className="relative z-10 flex flex-row items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          SaveState<sup className="text-xs">®</sup>
        </Link>
      </nav>

      <section className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md liquid-glass p-8 rounded-3xl animate-fade-rise">
          <div className="mb-8 text-center">
            <h1 className="text-4xl text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Teacher Login</h1>
            <p className="text-sm text-muted-foreground">Access your classroom dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white mt-1" />
            </div>

            {error && <div className="text-red-400 text-sm text-center py-2">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl font-medium mt-4">
              {loading ? 'Authenticating...' : 'Login'}
            </button>
            <div className="text-center pt-4">
              <Link href="/admin/signup" className="text-sm text-muted-foreground hover:text-white">Need an account? Register</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
