"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [activeTab, setActiveTab] = useState('lectures'); // 'lectures' or 'roster'
  
  const [lectures, setLectures] = useState([]);
  const [studentEmails, setStudentEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  
  const [newLecture, setNewLecture] = useState({ name: '', date: '', startTime: '', endTime: '' });
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const aid = localStorage.getItem('admin_id');
    const aname = localStorage.getItem('admin_name');
    const cid = localStorage.getItem('classroom_id');
    
    if (!aid) {
      router.push('/admin/login');
      return;
    }
    
    setTeacherId(aid);
    setAdminName(aname);
    setClassroomId(cid);
    
    fetchLectures(aid);
    fetchClassroom(aid);
  }, [router]);

  const fetchLectures = async (tid) => {
    const res = await fetch(`/api/admin/lectures?teacher_id=${tid}`);
    const data = await res.json();
    if (data.success) setLectures(data.lectures);
  };

  const fetchClassroom = async (tid) => {
    const res = await fetch(`/api/admin/classroom?teacher_id=${tid}`);
    const data = await res.json();
    if (data.success) setStudentEmails(data.classroom.student_emails);
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    const res = await fetch('/api/admin/classroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher_id: teacherId, email: newEmail })
    });
    const data = await res.json();
    if (data.success) {
      setStudentEmails(data.classroom.student_emails);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = async (email) => {
    const res = await fetch(`/api/admin/classroom?teacher_id=${teacherId}&email=${email}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) setStudentEmails(data.classroom.student_emails);
  };

  const handleCreateLecture = async (e) => {
    e.preventDefault();
    if (!newLecture.name || !newLecture.date || !newLecture.startTime || !newLecture.endTime) return;
    
    const res = await fetch('/api/admin/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLecture, teacher_id: teacherId, classroom_id: classroomId })
    });
    const data = await res.json();
    if (data.success) {
      setNewLecture({ name: '', date: '', startTime: '', endTime: '' });
      fetchLectures(teacherId);
    }
  };

  const handleViewAttendance = async (lecture) => {
    setSelectedLecture(lecture);
    const res = await fetch(`/api/admin/lectures/${lecture._id}/attendance?classroom_id=${classroomId}`);
    const data = await res.json();
    if (data.success) {
      setAttendance(data.attendance);
    }
  };

  const handleUpdateLectureStatus = async (id, status) => {
    const res = await fetch(`/api/admin/lectures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchLectures(teacherId);
  };

  const handleRemoveLecture = async (id) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    const res = await fetch(`/api/admin/lectures/${id}`, { method: 'DELETE' });
    if (res.ok) fetchLectures(teacherId);
  };

  const handleGenerateCode = async (id) => {
    const res = await fetch(`/api/admin/lectures/${id}/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      fetchLectures(teacherId);
    } else {
      alert(data.message || 'Failed to generate room code');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('classroom_id');
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen relative flex flex-col bg-background overflow-hidden text-white">
      <video className="absolute inset-0 w-full h-full object-cover z-0 opacity-10" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" autoPlay loop muted playsInline />
      
      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full border-b border-white/10">
        <Link href="/" className="text-3xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          SaveState Admin
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Prof. {adminName}</span>
          <button onClick={handleLogout} className="liquid-glass px-4 py-2 rounded-full text-xs hover:scale-[1.05] transition-transform">Logout</button>
        </div>
      </nav>

      <section className="relative z-10 flex-1 flex flex-col px-6 py-12 max-w-7xl mx-auto w-full gap-8">
        {selectedLecture ? (
          <div className="liquid-glass rounded-3xl p-8 animate-fade-rise">
            <button onClick={() => setSelectedLecture(null)} className="text-sm text-muted-foreground hover:text-white mb-6 flex items-center gap-2">
              &larr; Back to Dashboard
            </button>
            <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-display)" }}>{selectedLecture.name}</h2>
            <p className="text-muted-foreground mb-8">
              {selectedLecture.date} from {new Date(`2000-01-01T${selectedLecture.startTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to {new Date(`2000-01-01T${selectedLecture.endTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              &nbsp;&bull; Status: <span className={`uppercase text-xs font-bold text-white px-2 py-1 rounded ${selectedLecture.status === 'active' ? 'bg-green-500' : selectedLecture.status === 'completed' ? 'bg-white/20' : 'bg-blue-500/50'}`}>{selectedLecture.status}</span>
            </p>
            
            <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground border-b border-white/10 pb-4 mb-4 font-medium tracking-wide uppercase">
              <div className="col-span-2">Student Name</div>
              <div>Status</div>
              <div className="text-right">Time Marked</div>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {attendance.map((student) => (
                <div key={student._id} className={`grid grid-cols-4 gap-4 items-center rounded-xl p-4 border transition-colors ${student.status === 'Present' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="col-span-2 flex items-center gap-4">
                    {student.selfie_base64 ? (
                      <img src={student.selfie_base64} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs">?</div>
                    )}
                    <div>
                      <div className="font-medium text-white">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="text-right text-sm font-mono text-muted-foreground">
                    {student.timestamp ? new Date(student.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 border-b border-white/10 pb-4">
              <button onClick={() => setActiveTab('lectures')} className={`text-xl font-medium transition-colors ${activeTab === 'lectures' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>Lectures</button>
              <button onClick={() => setActiveTab('roster')} className={`text-xl font-medium transition-colors ${activeTab === 'roster' ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>Classroom Roster</button>
            </div>

            {activeTab === 'lectures' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-rise">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-2xl mb-4" style={{ fontFamily: "var(--font-display)" }}>Your Lectures</h3>
                  {lectures.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/20 rounded-3xl text-muted-foreground">No lectures scheduled yet.</div>
                  ) : lectures.map(lec => (
                    <div key={lec._id} className="liquid-glass p-6 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors">
                      <div>
                        <h4 className="text-xl font-medium text-white">{lec.name}</h4>
                        <p className="text-sm text-muted-foreground">{lec.date} &bull; {new Date(`2000-01-01T${lec.startTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to {new Date(`2000-01-01T${lec.endTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {lec.status === 'active' && (
                          <div className="flex flex-col items-end mr-2">
                            {lec.activeCode && new Date() < new Date(lec.codeExpiresAt) ? (
                              <div className="text-right">
                                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Active Code</span>
                                <span className="text-lg font-mono font-bold text-green-400 tracking-wider bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">{lec.activeCode}</span>
                              </div>
                            ) : (
                              <button onClick={() => handleGenerateCode(lec._id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl transition-colors font-medium">
                                Generate Room Code
                              </button>
                            )}
                          </div>
                        )}
                        <span className={`px-4 py-2 text-xs font-bold uppercase rounded-full border ${lec.status === 'active' ? 'border-green-500 text-green-400 bg-green-500/10' : lec.status === 'completed' ? 'border-white/20 text-white/50 bg-white/5' : 'border-blue-500 text-blue-400 bg-blue-500/10'}`}>
                          {lec.status}
                        </span>
                        <button onClick={() => handleViewAttendance(lec)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:scale-[1.05] transition-transform">
                          View Roster
                        </button>
                        <button onClick={() => handleRemoveLecture(lec._id)} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="liquid-glass p-6 rounded-3xl h-fit">
                  <h3 className="text-xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Schedule Lecture</h3>
                  <form onSubmit={handleCreateLecture} className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Lecture Name</label>
                      <input type="text" required value={newLecture.name} onChange={e => setNewLecture({...newLecture, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white mt-1" placeholder="e.g. CS101 Midterm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">Date</label>
                        <input type="date" required value={newLecture.date} onChange={e => setNewLecture({...newLecture, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">Start Time</label>
                        <input type="time" required value={newLecture.startTime} onChange={e => setNewLecture({...newLecture, startTime: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white mt-1" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground uppercase">End Time</label>
                        <input type="time" required value={newLecture.endTime} onChange={e => setNewLecture({...newLecture, endTime: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white mt-1" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-white text-black py-3 rounded-xl font-medium mt-4">Create Lecture</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'roster' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-rise">
                <div className="lg:col-span-2 liquid-glass p-8 rounded-3xl">
                  <h3 className="text-2xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Authorized Students</h3>
                  <div className="space-y-2">
                    {studentEmails.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No students added to classroom yet.</div>
                    ) : studentEmails.map(email => (
                      <div key={email} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                        <span className="font-mono text-sm text-white/90">{email}</span>
                        <button onClick={() => handleRemoveEmail(email)} className="text-red-400 text-xs hover:text-red-300 transition-colors">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="liquid-glass p-6 rounded-3xl h-fit">
                  <h3 className="text-xl mb-6" style={{ fontFamily: "var(--font-display)" }}>Add Student Email</h3>
                  <p className="text-xs text-muted-foreground mb-4">Only students with these email addresses will be able to mark attendance for your lectures.</p>
                  <form onSubmit={handleAddEmail} className="flex flex-col gap-4">
                    <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="student@university.edu" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white" />
                    <button type="submit" className="w-full bg-white text-black py-3 rounded-xl font-medium">Whitelist Email</button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
